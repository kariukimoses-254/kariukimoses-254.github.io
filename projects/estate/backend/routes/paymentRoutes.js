const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

router.post('/', authenticate, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('payment_method').isIn(['mpesa', 'paypal', 'stripe', 'bank_transfer', 'cash']).withMessage('Invalid payment method')
], validate, paymentController.createPayment);

router.post('/callback/mpesa', paymentController.mpesaCallback);

router.post('/:payment_id/mpesa', authenticate, paymentController.processMpesaPayment);
router.post('/:payment_id/stripe', authenticate, paymentController.processStripePayment);
router.post('/:payment_id/paypal', authenticate, paymentController.processPaypalPayment);

router.get('/my-payments', authenticate, paymentController.getMyPayments);
router.get('/:id', authenticate, paymentController.getPaymentById);
router.get('/', authenticate, authorize('admin'), paymentController.getAllPayments);

module.exports = router;
