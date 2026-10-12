const router = require('express').Router();
const controller = require('../controllers/adminController');
const { authenticate, adminOnly } = require('../middleware/auth');
const vehicles = require('../controllers/vehicleController');
router.get('/stats', authenticate, adminOnly, controller.stats);
router.get('/vehicles', authenticate, adminOnly, vehicles.listAllForAdmin);
module.exports = router;
