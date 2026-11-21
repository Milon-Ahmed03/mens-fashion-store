const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/orderController');

const router = express.Router();

const rules = [
  body('items').isArray({ min: 1 }).withMessage('Your cart is empty'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').trim().isLength({ min: 6 }).withMessage('Valid phone number is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingArea').optional().isIn(['inside_dhaka', 'outside_dhaka']).withMessage('Invalid shipping area'),
];

router.get('/track', c.trackOrder); // /:id এর আগে থাকতে হবে
router.get('/my', protect, c.getMyOrders);
router.post('/', protect, rules, validate, c.createOrder);
router.get('/', protect, adminOnly, c.getAllOrders);
router.get('/:id', protect, c.getOrder);
router.put('/:id/cancel', protect, c.cancelMyOrder);
router.put('/:id/status', protect, adminOnly, c.updateOrderStatus);

module.exports = router;
