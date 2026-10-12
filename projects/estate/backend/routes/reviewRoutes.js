const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

router.post('/', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
], validate, reviewController.createReview);

router.get('/property/:propertyId', reviewController.getPropertyReviews);
router.get('/agent/:agentId', reviewController.getAgentReviews);
router.get('/', authenticate, authorize('admin'), reviewController.getAllReviews);
router.put('/:id/approve', authenticate, authorize('admin'), reviewController.approveReview);
router.put('/:id/reject', authenticate, authorize('admin'), reviewController.rejectReview);
router.put('/:id/reply', authenticate, authorize('admin'), reviewController.replyToReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
