const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar, handleUploadError } = require('../middleware/upload');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/avatar', authenticate, uploadAvatar, handleUploadError, userController.updateAvatar);
router.get('/dashboard', authenticate, userController.getCustomerDashboard);

module.exports = router;
