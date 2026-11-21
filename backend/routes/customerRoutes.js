const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/customerController');

const router = express.Router();
router.use(protect, adminOnly);
router.get('/', c.getCustomers);
router.put('/:id/block', c.toggleBlock);

module.exports = router;
