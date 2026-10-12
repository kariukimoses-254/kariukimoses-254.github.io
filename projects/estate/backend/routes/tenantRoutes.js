const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const tenantController = require('../controllers/tenantController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

// ===== Tenant Profile (authenticated tenant) =====
router.get('/profile', authenticate, tenantController.getMyTenantProfile);
router.put('/profile', authenticate, tenantController.updateMyTenantProfile);

// ===== Leases =====
router.get('/leases', authenticate, tenantController.getMyLeases);
router.get('/leases/active', authenticate, tenantController.getMyActiveLease);

// ===== Rent Payments =====
router.get('/payments', authenticate, tenantController.getMyRentPayments);
router.post('/payments', authenticate, [
  body('lease_id').isInt().withMessage('Lease ID is required'),
  body('amount').isNumeric().withMessage('Amount is required'),
  body('payment_method').isIn(['mpesa', 'bank_transfer', 'cash', 'cheque', 'paypal', 'stripe']).withMessage('Invalid payment method'),
  body('payment_month').notEmpty().withMessage('Payment month is required')
], validate, tenantController.createRentPayment);

// ===== Documents =====
router.get('/documents', authenticate, tenantController.getMyDocuments);

// ===== Dashboard =====
router.get('/dashboard', authenticate, tenantController.getTenantDashboard);

// ===== Admin Routes =====
router.get('/admin/tenants', authenticate, authorize('admin'), tenantController.getAllTenants);
router.get('/admin/tenants/:id', authenticate, authorize('admin'), tenantController.getTenantById);

router.get('/admin/leases', authenticate, authorize('admin'), tenantController.getAllLeases);
router.post('/admin/leases', authenticate, authorize('admin'), [
  body('tenant_id').isInt().withMessage('Tenant ID is required'),
  body('property_id').isInt().withMessage('Property ID is required'),
  body('agent_id').isInt().withMessage('Agent ID is required'),
  body('start_date').notEmpty().withMessage('Start date is required'),
  body('end_date').notEmpty().withMessage('End date is required'),
  body('rent_amount').isNumeric().withMessage('Rent amount is required')
], validate, tenantController.createLease);
router.put('/admin/leases/:id/status', authenticate, authorize('admin'), tenantController.updateLeaseStatus);

router.get('/admin/payments', authenticate, authorize('admin'), tenantController.getAllRentPayments);
router.put('/admin/payments/:id/status', authenticate, authorize('admin'), tenantController.updateRentPaymentStatus);

module.exports = router;
