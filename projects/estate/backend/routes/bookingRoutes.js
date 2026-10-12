const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

router.post('/', authenticate, authorize('customer'), [
  body('property_id').isInt().withMessage('Property ID is required'),
  body('booking_date').isDate().withMessage('Valid booking date is required'),
  body('booking_time').notEmpty().withMessage('Booking time is required')
], validate, bookingController.createBooking);

router.get('/my-bookings', authenticate, bookingController.getMyBookings);
router.get('/', authenticate, authorize('admin'), bookingController.getAllBookings);
router.put('/:id/status', authenticate, authorize('agent', 'admin'), bookingController.updateBookingStatus);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
