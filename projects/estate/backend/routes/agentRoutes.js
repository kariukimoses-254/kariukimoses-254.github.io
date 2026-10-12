const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', agentController.getAllAgents);

router.get('/dashboard/properties', authenticate, authorize('agent', 'admin'), agentController.getAgentProperties);
router.get('/dashboard/bookings', authenticate, authorize('agent', 'admin'), agentController.getAgentBookings);
router.get('/dashboard/sales', authenticate, authorize('agent', 'admin'), agentController.getAgentSales);
router.put('/dashboard/profile', authenticate, authorize('agent'), agentController.updateAgentProfile);
router.post('/dashboard/schedule-visit', authenticate, authorize('agent'), agentController.scheduleVisit);

router.get('/:id', agentController.getAgentProfile);

module.exports = router;
