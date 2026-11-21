// Admin Dashboard Overview ও Sales Report
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const ACTIVE = { $nin: ['cancelled', 'returned'] }; // বাতিল/ফেরত অর্ডার হিসাবে ধরা হয় না
const TZ = 'Asia/Dhaka';
const dayKey = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

// ঘুরে ঘুরে প্রতিটি দিনের জন্য সারি বানায় (বিক্রি না থাকলেও 0 দেখাবে)
const fillDays = (rows, from, to) => {
  const map = Object.fromEntries(rows.map((r) => [r._id, r]));
  const out = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const key = dayKey(d);
    out.push({ date: key, orders: map[key]?.orders || 0, sales: map[key]?.sales || 0 });
  }
  return out;
};

const dailyGroup = [
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } }, orders: { $sum: 1 }, sales: { $sum: '$total' } } },
];

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [totalOrders, pendingOrders, totalCustomers, totalProducts, lowStock, outOfStock] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    Product.countDocuments({ stock: 0 }),
  ]);

  const [revenue] = await Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$total' } } }]);
  const [sales] = await Order.aggregate([{ $match: { status: ACTIVE } }, { $group: { _id: null, total: { $sum: '$total' } } }]);

  const from = new Date();
  from.setDate(from.getDate() - 13);
  from.setHours(0, 0, 0, 0);
  const rows = await Order.aggregate([{ $match: { createdAt: { $gte: from }, status: ACTIVE } }, ...dailyGroup]);

  const statusCounts = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const topProducts = await Order.aggregate([
    { $match: { status: ACTIVE } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, image: { $first: '$items.image' }, sold: { $sum: '$items.quantity' } } },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ]);
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name');

  res.json({
    totalOrders,
    pendingOrders,
    totalCustomers,
    totalProducts,
    lowStock,
    outOfStock,
    deliveredRevenue: revenue ? revenue.total : 0,
    totalSales: sales ? sales.total : 0,
    salesByDay: fillDays(rows, from, new Date()),
    statusCounts,
    topProducts,
    recentOrders,
  });
});

// GET /api/admin/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
const getSalesReport = asyncHandler(async (req, res) => {
  const to = req.query.to ? new Date(`${req.query.to}T23:59:59.999Z`) : new Date();
  const from = req.query.from ? new Date(`${req.query.from}T00:00:00.000Z`) : new Date(to.getTime() - 29 * 86400000);
  const match = { createdAt: { $gte: from, $lte: to }, status: ACTIVE };

  const [summary] = await Order.aggregate([
    { $match: match },
    { $group: { _id: null, orders: { $sum: 1 }, sales: { $sum: '$total' }, discount: { $sum: '$discount' }, shipping: { $sum: '$shippingCharge' } } },
  ]);
  const rows = await Order.aggregate([{ $match: match }, ...dailyGroup]);
  const topProducts = await Order.aggregate([
    { $match: match },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { sold: -1 } },
    { $limit: 10 },
  ]);

  const s = summary || { orders: 0, sales: 0, discount: 0, shipping: 0 };
  res.json({
    summary: { ...s, average: s.orders ? Math.round(s.sales / s.orders) : 0 },
    daily: fillDays(rows, from, to),
    topProducts,
  });
});

module.exports = { getStats, getSalesReport };
