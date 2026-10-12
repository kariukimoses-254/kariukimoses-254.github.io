const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { queryOne, update } = require('../config/database');
const logger = require('../utils/logger');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET;

async function generateBookingQR(bookingId) {
  const booking = await queryOne(`
    SELECT b.*, p.title as property_title, p.price, p.address, p.city,
           (SELECT image_path FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as property_image,
           c.user_id as customer_user_id,
           u.first_name, u.last_name, u.email, u.phone
    FROM bookings b
    JOIN properties p ON b.property_id = p.property_id
    JOIN customers c ON b.customer_id = c.customer_id
    JOIN users u ON c.user_id = u.user_id
    WHERE b.booking_id = ?
  `, [bookingId]);

  if (!booking) return null;

  const depositAmount = Math.round(booking.price * 0.1);

  const token = jwt.sign(
    {
      booking_id: booking.booking_id,
      customer_id: booking.customer_id,
      property_id: booking.property_id,
      amount: depositAmount,
      type: 'booking_deposit',
      customer_name: `${booking.first_name} ${booking.last_name}`,
      property_title: booking.property_title
    },
    JWT_SECRET,
    { expiresIn: '30m' }
  );

  const paymentUrl = `${FRONTEND_URL}/pay.html?token=${token}`;

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

  logger.info(`Booking QR auto-generated for booking ${bookingId}`);

  return {
    qr_code: qrDataUrl,
    payment_url: paymentUrl,
    token,
    amount: depositAmount,
    property_title: booking.property_title,
    property_address: `${booking.address}, ${booking.city}`,
    property_image: booking.property_image,
    customer_name: `${booking.first_name} ${booking.last_name}`,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  };
}

async function generateRentPaymentQR(rentPaymentId) {
  const payment = await queryOne(`
    SELECT rp.*, l.rent_amount, l.lease_id, l.tenant_id,
           p.title as property_title, p.address, p.city,
           (SELECT image_path FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as property_image,
           t.user_id as tenant_user_id,
           u.first_name, u.last_name, u.email, u.phone
    FROM rent_payments rp
    JOIN leases l ON rp.lease_id = l.lease_id
    JOIN properties p ON l.property_id = p.property_id
    JOIN tenants t ON rp.tenant_id = t.tenant_id
    JOIN users u ON t.user_id = u.user_id
    WHERE rp.rent_payment_id = ?
  `, [rentPaymentId]);

  if (!payment) return null;

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
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const payUrl = `${FRONTEND_URL}/tenant-pay.html?token=${token}`;

  const qrDataUrl = await QRCode.toDataURL(payUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#0B1F3A', light: '#ffffff' },
    errorCorrectionLevel: 'M'
  });

  logger.info(`Rent payment QR auto-generated for payment ${rentPaymentId}`);

  return {
    qr_code: qrDataUrl,
    payment_url: payUrl,
    token,
    amount: payment.amount,
    property_title: payment.property_title,
    property_address: `${payment.address}, ${payment.city}`,
    property_image: payment.property_image,
    tenant_name: `${payment.first_name} ${payment.last_name}`,
    payment_month: payment.payment_month,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

module.exports = { generateBookingQR, generateRentPaymentQR };
