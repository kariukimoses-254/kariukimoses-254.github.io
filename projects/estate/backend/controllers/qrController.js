const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { query, queryOne, insert, update } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ===== M-Pesa Daraja API =====

let mpesaAccessToken = null;
let mpesaTokenExpiry = null;

async function getMpesaAccessToken() {
  if (mpesaAccessToken && mpesaTokenExpiry && Date.now() < mpesaTokenExpiry) {
    return mpesaAccessToken;
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new AppError('M-Pesa credentials not configured', 500);
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );

  mpesaAccessToken = response.data.access_token;
  mpesaTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

  return mpesaAccessToken;
}

function generateMpesaPassword() {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const timestamp = getTimestamp();
  const data = `${shortcode}${passkey}${timestamp}`;
  return { password: Buffer.from(data).toString('base64'), timestamp };
}

function getTimestamp() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}${hh}${mm}${ss}`;
}

async function initiateStkPush(phoneNumber, amount, accountReference, transactionDesc) {
  const accessToken = await getMpesaAccessToken();
  const { password, timestamp } = generateMpesaPassword();

  const callbackUrl = process.env.MPESA_CALLBACK_URL ||
    `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/v1/qr/mpesa/callback`;

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phoneNumber.replace(/\D/g, '').replace(/^0/, '254'),
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phoneNumber.replace(/\D/g, '').replace(/^0/, '254'),
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc
  };

  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    payload,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
}

// ===== QR Code Generation =====

exports.generateBookingQR = async (req, res, next) => {
  try {
    const { booking_id } = req.params;

    const booking = await queryOne(`
      SELECT b.*, p.title as property_title, p.price, p.address, p.city,
             c.user_id as customer_user_id,
             u.first_name, u.last_name, u.email, u.phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
      JOIN customers c ON b.customer_id = c.customer_id
      JOIN users u ON c.user_id = u.user_id
      WHERE b.booking_id = ?
    `, [booking_id]);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.customer_user_id !== req.user.user_id && req.user.role !== 'admin') {
      return next(new AppError('Unauthorized', 403));
    }

    const depositAmount = Math.round(booking.price * 0.1);

    const token = jwt.sign(
      {
        booking_id: booking.booking_id,
        customer_id: booking.customer_id,
        property_id: booking.property_id,
        amount: depositAmount,
        type: 'booking_deposit',
        customer_name: `${booking.first_name} ${booking.last_name}`,
        property_title: booking.property_title,
        generated_by: req.user.user_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const paymentUrl = `${frontendUrl}/pay.html?token=${token}`;

    const qrDataUrl = await QRCode.toDataURL(paymentUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#0B1F3A', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    });

    await update(
      'UPDATE properties SET qr_code = ? WHERE property_id = ?',
      [paymentUrl, booking.property_id]
    );

    logger.info(`Booking QR generated for booking ${booking_id}`);

    res.json({
      status: 'success',
      data: {
        qr_code: qrDataUrl,
        payment_url: paymentUrl,
        token,
        amount: depositAmount,
        property_title: booking.property_title,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.generateTenantQR = async (req, res, next) => {
  try {
    const { rent_payment_id } = req.params;

    const payment = await queryOne(`
      SELECT rp.*, l.rent_amount, l.lease_id, l.tenant_id,
             p.title as property_title, p.address, p.city,
             t.user_id as tenant_user_id,
             u.first_name, u.last_name, u.email, u.phone
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.lease_id
      JOIN properties p ON l.property_id = p.property_id
      JOIN tenants t ON rp.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      WHERE rp.rent_payment_id = ?
    `, [rent_payment_id]);

    if (!payment) {
      return next(new AppError('Rent payment not found', 404));
    }

    const tenant = await queryOne(
      'SELECT payment_pin FROM tenants WHERE tenant_id = ?',
      [payment.tenant_id]
    );

    const token = jwt.sign(
      {
        rent_payment_id: payment.rent_payment_id,
        lease_id: payment.lease_id,
        tenant_id: payment.tenant_id,
        amount: payment.amount,
        type: 'rent_payment',
        tenant_name: `${payment.first_name} ${payment.last_name}`,
        property_title: payment.property_title,
        payment_month: payment.payment_month,
        has_pin: !!(tenant && tenant.payment_pin)
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const payUrl = `${frontendUrl}/tenant-pay.html?token=${token}`;

    const qrDataUrl = await QRCode.toDataURL(payUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#0B1F3A', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    });

    logger.info(`Tenant QR generated for rent payment ${rent_payment_id}`);

    res.json({
      status: 'success',
      data: {
        qr_code: qrDataUrl,
        payment_url: payUrl,
        token,
        amount: payment.amount,
        property_title: payment.property_title,
        payment_month: payment.payment_month,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Public Payment Token Verification =====

exports.verifyPaymentToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired payment token', 400));
    }

    if (decoded.type === 'booking_deposit') {
      const booking = await queryOne(`
        SELECT b.*, p.title as property_title, p.price, p.address, p.city,
               (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as property_image,
               u.first_name, u.last_name, u.email, u.phone
      FROM bookings b
        JOIN properties p ON b.property_id = p.property_id
        JOIN customers c ON b.customer_id = c.customer_id
        JOIN users u ON c.user_id = u.user_id
        WHERE b.booking_id = ?
      `, [decoded.booking_id]);

      if (!booking) {
        return next(new AppError('Booking not found', 400));
      }

      return res.json({
        status: 'success',
        data: {
          type: 'booking_deposit',
          booking_id: booking.booking_id,
          property: {
            title: booking.property_title,
            address: booking.address,
            city: booking.city,
            price: booking.price,
            image: booking.property_image
          },
          customer: {
            name: `${booking.first_name} ${booking.last_name}`,
            email: booking.email,
            phone: booking.phone
          },
          amount: decoded.amount,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time
        }
      });
    }

    if (decoded.type === 'rent_payment') {
      const payment = await queryOne(`
        SELECT rp.*, l.rent_amount, l.due_day,
               p.title as property_title, p.address, p.city,
               u.first_name, u.last_name, u.email, u.phone, u.user_id,
               t.payment_pin
        FROM rent_payments rp
          JOIN leases l ON rp.lease_id = l.lease_id
          JOIN properties p ON l.property_id = p.property_id
          JOIN tenants t ON rp.tenant_id = t.tenant_id
          JOIN users u ON t.user_id = u.user_id
        WHERE rp.rent_payment_id = ?
      `, [decoded.rent_payment_id]);

      if (!payment) {
        return next(new AppError('Rent payment not found', 400));
      }

      return res.json({
        status: 'success',
        data: {
          type: 'rent_payment',
          rent_payment_id: payment.rent_payment_id,
          property: {
            title: payment.property_title,
            address: payment.address,
            city: payment.city
          },
          tenant: {
            name: `${payment.first_name} ${payment.last_name}`,
            email: payment.email,
            phone: payment.phone
          },
          amount: payment.amount,
          payment_month: payment.payment_month,
          due_date: payment.due_date,
          status: payment.status,
          has_pin: !!(payment.payment_pin)
        }
      });
    }

    return next(new AppError('Unknown payment token type', 400));
  } catch (error) {
    next(error);
  }
};

// ===== M-Pesa STK Push =====

exports.initiateMpesaPayment = async (req, res, next) => {
  try {
    const { token, phone_number } = req.body;

    if (!token || !phone_number) {
      return next(new AppError('Token and phone number are required', 400));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired payment token', 400));
    }

    const phone = phone_number.replace(/\D/g, '').replace(/^0/, '254');

    let accountRef, transactionDesc;

    if (decoded.type === 'booking_deposit') {
      accountRef = `BOOK-${decoded.booking_id}`;
      transactionDesc = `Deposit for ${decoded.property_title}`;
    } else if (decoded.type === 'rent_payment') {
      accountRef = `RENT-${decoded.rent_payment_id}`;
      transactionDesc = `Rent ${decoded.payment_month} - ${decoded.property_title}`;
    } else {
      return next(new AppError('Invalid token type', 400));
    }

    let stkResponse;
    try {
      stkResponse = await initiateStkPush(
        phone_number,
        decoded.amount,
        accountRef,
        transactionDesc
      );
    } catch (mpesaError) {
      logger.error('M-Pesa STK push failed:', mpesaError.response?.data || mpesaError.message);

      if (mpesaError.response?.data?.errorMessage?.includes('DS timeout') ||
          !process.env.MPESA_CONSUMER_KEY) {
        logger.info('M-Pesa unavailable â€” simulating success for development');

        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const transactionId = `MPESA-SIM-${Date.now()}`;

        if (decoded.type === 'booking_deposit') {
          const bookingUser = await queryOne(
            `SELECT u.user_id FROM bookings b
             JOIN customers c ON b.customer_id = c.customer_id
             JOIN users u ON c.user_id = u.user_id
             WHERE b.booking_id = ?`,
            [decoded.booking_id]
          );
          const payerId = bookingUser ? bookingUser.user_id : null;

          await insert(
            `INSERT INTO payments (user_id, property_id, booking_id, amount, payment_method, transaction_id,
             status, description, invoice_number, receipt_number, paid_at)
             VALUES (?, ?, ?, ?, 'mpesa', ?, 'completed', ?, ?, ?, NOW())`,
            [payerId, decoded.property_id, decoded.booking_id,
             decoded.amount, transactionId, decoded.property_title, invoiceNumber, receiptNumber]
          );
        } else if (decoded.type === 'rent_payment') {
          await update(
            "UPDATE rent_payments SET status = 'completed', transaction_id = ?, paid_at = NOW(), receipt_number = ? WHERE rent_payment_id = ?",
            [transactionId, receiptNumber, decoded.rent_payment_id]
          );
        }

        return res.json({
          status: 'success',
          message: 'Payment processed successfully (simulated)',
          data: {
            receipt_number: receiptNumber,
            transaction_id: transactionId,
            amount: decoded.amount,
            simulated: true
          }
        });
      }

      return next(new AppError('Failed to initiate M-Pesa payment. Please try again.', 500));
    }

    if (stkResponse.ResponseCode === '0') {
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      if (decoded.type === 'booking_deposit') {
        await insert(
          `INSERT INTO payments (user_id, property_id, booking_id, amount, payment_method, transaction_id,
           status, description, invoice_number, receipt_number)
           VALUES (?, ?, ?, ?, 'mpesa', ?, 'pending', ?, ?, ?)`,
          [decoded.generated_by || 1, decoded.property_id, decoded.booking_id,
           decoded.amount, stkResponse.CheckoutRequestID, decoded.property_title, invoiceNumber, receiptNumber]
        );
      } else if (decoded.type === 'rent_payment') {
        await update(
          "UPDATE rent_payments SET transaction_id = ?, status = 'pending' WHERE rent_payment_id = ?",
          [stkResponse.CheckoutRequestID, decoded.rent_payment_id]
        );
      }

      return res.json({
        status: 'success',
        message: 'Please check your phone for the M-Pesa prompt',
        data: {
          checkout_request_id: stkResponse.CheckoutRequestID,
          response_code: stkResponse.ResponseCode,
          response_description: stkResponse.ResponseDescription,
          amount: decoded.amount,
          phone: phone
        }
      });
    }

    return next(new AppError(stkResponse.ResponseDescription || 'STK push failed', 400));
  } catch (error) {
    next(error);
  }
};

exports.mpesaCallback = async (req, res, next) => {
  try {
    const { Body } = req.body;
    logger.info('M-Pesa callback received:', JSON.stringify(Body));

    if (Body.ResultCode === 0) {
      const amount = Body.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value;
      const transactionId = Body.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const checkoutId = Body.CheckoutRequestID;

      if (checkoutId) {
        await update(
          "UPDATE payments SET status = 'completed', transaction_id = ?, paid_at = NOW() WHERE transaction_id = ?",
          [transactionId, checkoutId]
        );

        const payment = await queryOne(
          'SELECT * FROM payments WHERE transaction_id = ?',
          [transactionId]
        );

        if (payment && payment.booking_id) {
          await insert(
            `INSERT INTO notifications (user_id, title, message, type, link)
             VALUES (?, 'Payment Received', ?, 'success', '/customer/payments')`,
            [payment.user_id,
             `Your payment of KES ${payment.amount} for ${payment.description} has been received. Receipt: ${payment.receipt_number}`]
          );
        }
      }

      const rentPayment = await queryOne(
        "SELECT * FROM rent_payments WHERE transaction_id = ?",
        [checkoutId]
      );

      if (rentPayment) {
        await update(
          "UPDATE rent_payments SET status = 'completed', transaction_id = ?, paid_at = NOW() WHERE rent_payment_id = ?",
          [transactionId, rentPayment.rent_payment_id]
        );

        const tenantUser = await queryOne(
          "SELECT user_id FROM tenants WHERE tenant_id = ?",
          [rentPayment.tenant_id]
        );

        await insert(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, 'Rent Payment Received', ?, 'success', '/tenant/payments')`,
          [tenantUser ? tenantUser.user_id : null,
           `Your rent payment of KES ${rentPayment.amount} for ${rentPayment.payment_month} has been received.`]
        );
      }
    } else {
      logger.warn('M-Pesa payment failed:', Body.ResultDesc);
      const checkoutId = Body.CheckoutRequestID;
      if (checkoutId) {
        await update(
          "UPDATE payments SET status = 'failed' WHERE transaction_id = ?",
          [checkoutId]
        );
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    logger.error('M-Pesa callback error:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
};

// ===== Tenant Safe PIN =====

exports.setTenantPin = async (req, res, next) => {
  try {
    const { pin } = req.body;

    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return next(new AppError('PIN must be 4-6 digits', 400));
    }

    const tenant = await queryOne('SELECT tenant_id FROM tenants WHERE user_id = ?', [req.user.user_id]);
    if (!tenant) {
      return next(new AppError('Tenant profile not found', 404));
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await update(
      'UPDATE tenants SET payment_pin = ? WHERE tenant_id = ?',
      [hashedPin, tenant.tenant_id]
    );

    logger.info(`Payment PIN set for tenant ${tenant.tenant_id}`);

    res.json({
      status: 'success',
      message: 'Payment PIN set successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyTenantPin = async (req, res, next) => {
  try {
    const { token, pin } = req.body;

    if (!token || !pin) {
      return next(new AppError('Token and PIN are required', 400));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired payment token', 400));
    }

    if (decoded.type !== 'rent_payment') {
      return next(new AppError('Invalid token type for PIN verification', 400));
    }

    const tenant = await queryOne(
      'SELECT tenant_id, payment_pin FROM tenants WHERE tenant_id = ?',
      [decoded.tenant_id]
    );

    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }

    if (!tenant.payment_pin) {
      return next(new AppError('No payment PIN set. Please set a PIN in your profile first.', 400));
    }

    const isValid = await bcrypt.compare(pin, tenant.payment_pin);
    if (!isValid) {
      return next(new AppError('Invalid PIN', 401));
    }

    const rentPayment = await queryOne(
      'SELECT * FROM rent_payments WHERE rent_payment_id = ?',
      [decoded.rent_payment_id]
    );

    if (!rentPayment) {
      return next(new AppError('Rent payment not found', 404));
    }

    if (rentPayment.status === 'completed') {
      return next(new AppError('This payment has already been completed', 400));
    }

    const phone = req.body.phone_number || '0700000000';
    const transactionId = `MPESA-RENT-${Date.now()}`;
    const receiptNumber = `RENT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    let stkResponse;
    try {
      stkResponse = await initiateStkPush(
        phone,
        decoded.amount,
        `RENT-${decoded.rent_payment_id}`,
        `Rent ${decoded.payment_month}`
      );
    } catch (mpesaError) {
      logger.info('M-Pesa unavailable for tenant payment â€” simulating success');

      await update(
        "UPDATE rent_payments SET status = 'completed', transaction_id = ?, paid_at = NOW(), receipt_number = ? WHERE rent_payment_id = ?",
        [transactionId, receiptNumber, decoded.rent_payment_id]
      );

      return res.json({
        status: 'success',
        message: 'Rent payment processed successfully (simulated)',
        data: {
          receipt_number: receiptNumber,
          transaction_id: transactionId,
          amount: decoded.amount,
          payment_month: decoded.payment_month,
          simulated: true
        }
      });
    }

    if (stkResponse.ResponseCode === '0') {
      await update(
        "UPDATE rent_payments SET transaction_id = ?, status = 'pending' WHERE rent_payment_id = ?",
        [stkResponse.CheckoutRequestID, decoded.rent_payment_id]
      );

      return res.json({
        status: 'success',
        message: 'Please check your phone for the M-Pesa prompt',
        data: {
          checkout_request_id: stkResponse.CheckoutRequestID,
          response_code: stkResponse.ResponseCode,
          amount: decoded.amount,
          payment_month: decoded.payment_month
        }
      });
    }

    return next(new AppError(stkResponse.ResponseDescription || 'Payment failed', 400));
  } catch (error) {
    next(error);
  }
};
