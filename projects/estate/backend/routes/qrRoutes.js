const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const qrController = require('../controllers/qrController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

// QR Generation (authenticated)
router.post('/booking/:booking_id', authenticate, qrController.generateBookingQR);
router.post('/tenant/:rent_payment_id', authenticate, qrController.generateTenantQR);

// Public token verification (no auth — accessed via QR scan)
router.get('/verify/:token', qrController.verifyPaymentToken);

// M-Pesa STK Push
router.post('/pay', [
  body('token').notEmpty().withMessage('Payment token is required'),
  body('phone_number').notEmpty().withMessage('Phone number is required')
], validate, qrController.initiateMpesaPayment);

// M-Pesa callback (public — called by Safaricom)
router.post('/mpesa/callback', qrController.mpesaCallback);

// Tenant PIN management
router.post('/pin/set', authenticate, [
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], validate, qrController.setTenantPin);

router.post('/pin/verify', [
  body('token').notEmpty().withMessage('Token is required'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], validate, qrController.verifyTenantPin);

module.exports = router;
