const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

router.post('/register', [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().trim()
], validate, authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validate, authController.login);

router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], validate, authController.forgotPassword);

router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validate, authController.resetPassword);

router.post('/change-password', authenticate, [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], validate, authController.changePassword);

router.get('/verify-email/:token', authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
