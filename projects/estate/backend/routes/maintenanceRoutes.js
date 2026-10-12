const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

router.post('/', authenticate, authorize('customer'), [
  body('property_id').isInt().withMessage('Property ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], validate, maintenanceController.createRequest);

router.get('/my-requests', authenticate, maintenanceController.getMyRequests);
router.put('/:id/status', authenticate, maintenanceController.updateRequestStatus);
router.get('/', authenticate, authorize('admin', 'agent'), maintenanceController.getAllRequests);

module.exports = router;
