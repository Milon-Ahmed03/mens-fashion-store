const Coupon = require('../models/Coupon');

// কুপন যাচাই করে কত ডিসকাউন্ট হবে তা হিসাব করে
const applyCoupon = async (code, subtotal) => {
  if (!code) return { coupon: null, discount: 0 };

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
  if (!coupon) throw new Error('Invalid coupon code');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error('This coupon has expired');
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) throw new Error('This coupon usage limit is over');
  if (subtotal < coupon.minOrder) throw new Error(`Minimum order amount for this coupon is ${coupon.minOrder}`);

  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.type === 'percent' && coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(Math.round(discount), subtotal);

  return { coupon, discount };
};

module.exports = { applyCoupon };
