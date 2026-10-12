const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
], validate, contactController.sendContactMessage);

router.post('/newsletter', [
  body('email').isEmail().withMessage('Valid email is required')
], validate, contactController.subscribeNewsletter);

router.get('/', authenticate, authorize('admin'), contactController.getAllContactMessages);
router.put('/:id/read', authenticate, authorize('admin'), contactController.markAsRead);
router.put('/:id/reply', authenticate, authorize('admin'), contactController.replyToMessage);

module.exports = router;
