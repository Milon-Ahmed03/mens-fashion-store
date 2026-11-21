const crud = require('./crudFactory')(require('../models/Coupon'), { label: 'Coupon' });
const asyncHandler = require('../utils/asyncHandler');
const { applyCoupon } = require('../utils/coupon');

// POST /api/coupons/validate  body: { code, subtotal }
const validateCoupon = asyncHandler(async (req, res) => {
  try {
    const { coupon, discount } = await applyCoupon(req.body.code, Number(req.body.subtotal) || 0);
    res.json({ code: coupon.code, discount });
  } catch (e) {
    res.status(400);
    throw e;
  }
});

module.exports = { ...crud, validateCoupon };
