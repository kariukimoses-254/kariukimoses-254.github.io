const { query, queryOne, insert, update } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

exports.createPayment = async (req, res, next) => {
  try {
    const { property_id, booking_id, amount, payment_method, description } = req.body;

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    let transactionId;
    if (payment_method === 'mpesa') {
      transactionId = `MPESA-${Date.now()}`;
    } else if (payment_method === 'stripe') {
      transactionId = `STR-${uuidv4()}`;
    } else if (payment_method === 'paypal') {
      transactionId = `PAY-${uuidv4()}`;
    } else {
      transactionId = `TXN-${Date.now()}`;
    }

    const result = await insert(
      `INSERT INTO payments (user_id, property_id, booking_id, amount, payment_method, transaction_id,
       status, description, invoice_number, receipt_number, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, NOW())`,
      [req.user.user_id, property_id || null, booking_id || null, amount, payment_method,
       transactionId, description, invoiceNumber, receiptNumber]
    );

    res.status(201).json({
      status: 'success',
      message: 'Payment initiated',
      data: {
        payment_id: result.insertId,
        invoice_number: invoiceNumber,
        receipt_number: receiptNumber,
        transaction_id: transactionId,
        amount,
        payment_method
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.processMpesaPayment = async (req, res, next) => {
  try {
    const { payment_id } = req.params;

    const payment = await queryOne('SELECT * FROM payments WHERE payment_id = ?', [payment_id]);
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    logger.info(`Processing M-Pesa payment: ${payment.payment_id}`);

    res.json({
      status: 'success',
      message: 'M-Pesa payment processing initiated',
      data: { payment_id }
    });
  } catch (error) {
    next(error);
  }
};

exports.mpesaCallback = async (req, res, next) => {
  try {
    const { Body } = req.body;
    logger.info('M-Pesa callback received:', JSON.stringify(Body));

    const checkoutId = Body.CheckoutRequestID;

    if (Body.ResultCode === 0) {
      const amount = Body.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value;
      const transactionId = Body.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

      if (checkoutId) {
        await update(
          `UPDATE payments SET status = 'completed', transaction_id = ?, paid_at = NOW() WHERE transaction_id = ?`,
          [transactionId, checkoutId]
        );
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    logger.error('M-Pesa callback error:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
};

exports.processStripePayment = async (req, res, next) => {
  try {
    const { payment_id } = req.params;

    const payment = await queryOne('SELECT * FROM payments WHERE payment_id = ?', [payment_id]);
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    logger.info(`Processing Stripe payment: ${payment.payment_id}`);

    res.json({
      status: 'success',
      message: 'Stripe payment processing initiated',
      data: { payment_id }
    });
  } catch (error) {
    next(error);
  }
};

exports.processPaypalPayment = async (req, res, next) => {
  try {
    const { payment_id } = req.params;

    const payment = await queryOne('SELECT * FROM payments WHERE payment_id = ?', [payment_id]);
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    res.json({
      status: 'success',
      message: 'PayPal payment processing initiated',
      data: { payment_id }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await query(`
      SELECT p.*, pr.title as property_title
      FROM payments p
      LEFT JOIN properties pr ON p.property_id = pr.property_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.user_id]);

    res.json({
      status: 'success',
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await queryOne(`
      SELECT p.*, pr.title as property_title, pr.address as property_address, pr.agent_id as property_agent_id,
             u.first_name, u.last_name, u.email
      FROM payments p
      LEFT JOIN properties pr ON p.property_id = pr.property_id
      JOIN users u ON p.user_id = u.user_id
      WHERE p.payment_id = ?
    `, [req.params.id]);

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    const isOwner = payment.user_id === req.user.user_id;
    const isAdmin = req.user.role === 'admin';
    const isAssignedAgent = req.user.role === 'agent' &&
      (!payment.property_agent_id || payment.property_agent_id === req.user.user_id);
    if (!isOwner && !isAdmin && !isAssignedAgent) {
      return next(new AppError('You do not have access to this payment', 403));
    }

    res.json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    let sql = `
      SELECT p.*, pr.title as property_title, u.first_name, u.last_name, u.email
      FROM payments p
      LEFT JOIN properties pr ON p.property_id = pr.property_id
      JOIN users u ON p.user_id = u.user_id
    `;
    const params = [];

    if (req.query.status) {
      sql += ' WHERE p.status = ?';
      params.push(req.query.status);
    }

    sql += ' ORDER BY p.created_at DESC';

    const payments = await query(sql, params);

    res.json({
      status: 'success',
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};
