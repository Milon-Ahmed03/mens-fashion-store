const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/couponController');

const router = express.Router();

router.post('/validate', protect, c.validateCoupon); // Customer কুপন যাচাই করে
router.get('/', protect, adminOnly, c.list);
router.post(
  '/',
  protect,
  adminOnly,
  [body('code').trim().notEmpty().withMessage('Coupon code is required'), body('value').isFloat({ min: 0 }).withMessage('Coupon value is required')],
  validate,
  c.create
);
router.put('/:id', protect, adminOnly, c.update);
router.delete('/:id', protect, adminOnly, c.remove);

module.exports = router;
