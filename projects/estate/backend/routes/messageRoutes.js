const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

router.post('/', authenticate, [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required')
], validate, messageController.sendMessage);

router.get('/my-messages', authenticate, messageController.getMyMessages);
router.get('/inbox', authenticate, messageController.getInbox);
router.get('/:id', authenticate, messageController.getMessageById);
router.put('/:id/read', authenticate, messageController.markAsRead);

module.exports = router;
