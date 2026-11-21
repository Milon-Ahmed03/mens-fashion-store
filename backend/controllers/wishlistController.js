const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    match: { isActive: true },
    populate: [{ path: 'category', select: 'name slug' }, { path: 'brand', select: 'name slug' }],
  });
  res.json(user.wishlist);
});

// POST /api/wishlist/:productId  (আছে হলে সরায়, না থাকলে যোগ করে)
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const id = req.params.productId;
  const exists = user.wishlist.some((p) => p.toString() === id);
  user.wishlist = exists ? user.wishlist.filter((p) => p.toString() !== id) : [...user.wishlist, id];
  await user.save();
  res.json({ wishlist: user.wishlist.map((p) => p.toString()), added: !exists });
});

// GET /api/wishlist/ids  (শুধু ID তালিকা, হার্ট আইকনের জন্য)
const getWishlistIds = asyncHandler(async (req, res) => {
  res.json(req.user.wishlist.map((p) => p.toString()));
});

module.exports = { getWishlist, toggleWishlist, getWishlistIds };
