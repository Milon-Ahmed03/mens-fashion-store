const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/adminController');

const router = express.Router();
router.use(protect, adminOnly);
router.get('/stats', c.getStats);
router.get('/reports/sales', c.getSalesReport);

module.exports = router;
