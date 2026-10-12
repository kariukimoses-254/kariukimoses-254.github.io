const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

router.get('/properties/pending', adminController.getPendingProperties);
router.put('/properties/:id/approve', adminController.approveProperty);
router.put('/properties/:id/reject', adminController.rejectProperty);
router.put('/properties/:id/feature', adminController.toggleFeaturedProperty);

router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);
router.get('/email-templates', adminController.getEmailTemplates);
router.get('/activity-logs', adminController.getActivityLogs);

module.exports = router;
