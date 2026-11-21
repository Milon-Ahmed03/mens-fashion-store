const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/customers  ?search=&page=&limit=
const getCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 15, 5000);
  const filter = { role: 'customer' };
  if (req.query.search) {
    const rx = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-wishlist')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // প্রতিটি Customer-এর অর্ডার সংখ্যা ও মোট খরচ
  const stats = await Order.aggregate([
    { $match: { user: { $in: users.map((u) => u._id) }, status: { $nin: ['cancelled', 'returned'] } } },
    { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$total' } } },
  ]);
  const map = Object.fromEntries(stats.map((s) => [s._id.toString(), s]));
  const items = users.map((u) => ({ ...u, orders: map[u._id]?.orders || 0, spent: map[u._id]?.spent || 0 }));

  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
});

// PUT /api/customers/:id/block  (Block <-> Unblock)
const toggleBlock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'customer') {
    res.status(404);
    throw new Error('Customer not found');
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ _id: user._id, isBlocked: user.isBlocked });
});

module.exports = { getCustomers, toggleBlock };
