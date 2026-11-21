const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const { applyCoupon } = require('../utils/coupon');

// বাতিল/ফেরত হলে স্টক ফিরিয়ে দেয় (একবারের বেশি নয়)
const restoreStock = async (order) => {
  if (order.stockRestored) return;
  for (const item of order.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
  }
  order.stockRestored = true;
};

// POST /api/orders  (Customer অর্ডার দেয়)
// গুরুত্বপূর্ণ: দাম ও স্টক সবসময় Server-এ Database থেকে হিসাব হয়, Frontend-এর পাঠানো দাম বিশ্বাস করা হয় না
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, shippingArea = 'inside_dhaka', couponCode, note } = req.body;

  // ১) প্রতিটি আইটেম যাচাই ও দাম বসানো
  const orderItems = [];
  for (const it of items) {
    const qty = Math.floor(Number(it.quantity));
    const product = await Product.findById(it.product);
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error('A product in your cart is no longer available');
    }
    if (!qty || qty < 1) {
      res.status(400);
      throw new Error('Invalid quantity');
    }
    if (product.sizes.length && !product.sizes.includes(it.size)) {
      res.status(400);
      throw new Error(`Please select a size for ${product.name}`);
    }
    if (product.colors.length && !product.colors.includes(it.color)) {
      res.status(400);
      throw new Error(`Please select a color for ${product.name}`);
    }
    if (product.stock < qty) {
      res.status(400);
      throw new Error(`Only ${product.stock} left in stock for ${product.name}`);
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] ? product.images[0].url : '',
      price: product.finalPrice,
      size: it.size || '',
      color: it.color || '',
      quantity: qty,
    });
  }

  // ২) হিসাব: subtotal, কুপন, shipping
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let couponResult;
  try {
    couponResult = await applyCoupon(couponCode, subtotal);
  } catch (e) {
    res.status(400);
    throw e;
  }
  const { coupon, discount } = couponResult;

  const settings = await Settings.getSettings();
  let shippingCharge = shippingArea === 'outside_dhaka' ? settings.shipping.outsideDhaka : settings.shipping.insideDhaka;
  if (settings.shipping.freeShippingOver > 0 && subtotal - discount >= settings.shipping.freeShippingOver) shippingCharge = 0;
  const total = subtotal - discount + shippingCharge;

  // ৩) স্টক কমানো (শর্তসহ আপডেট, যাতে একসাথে দুজন কিনলেও স্টক মাইনাসে না যায়)
  const reduced = [];
  try {
    for (const item of orderItems) {
      const result = await Product.updateOne({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
      if (result.modifiedCount === 0) throw new Error(`${item.name} is out of stock`);
      reduced.push(item);
    }
  } catch (e) {
    for (const item of reduced) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }); // আগের কমানো ফেরত
    res.status(400);
    throw e;
  }

  // ৪) অর্ডার সেভ
  let order;
  try {
    order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      shippingArea,
      subtotal,
      discount,
      couponCode: coupon ? coupon.code : '',
      shippingCharge,
      total,
      note,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });
  } catch (e) {
    for (const item of orderItems) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    throw e;
  }
  if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });

  res.status(201).json(order);
});

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

// GET /api/orders/:id  (নিজের অর্ডার অথবা Admin)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const ownerId = order.user._id ? order.user._id.toString() : order.user.toString();
  if (req.user.role !== 'admin' && ownerId !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed');
  }
  res.json(order);
});

// GET /api/orders/track?orderNumber=...&phone=...  (লগইন ছাড়াই Order Tracking)
const trackOrder = asyncHandler(async (req, res) => {
  const digits = (s = '') => String(s).replace(/\D/g, '');
  const order = await Order.findOne({ orderNumber: String(req.query.orderNumber || '').trim().toUpperCase() });
  if (!order || !digits(req.query.phone) || digits(order.shippingAddress.phone) !== digits(req.query.phone)) {
    res.status(404);
    throw new Error('No order found with this order number and phone');
  }
  res.json({
    orderNumber: order.orderNumber,
    status: order.status,
    statusHistory: order.statusHistory,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity })),
  });
});

// PUT /api/orders/:id/cancel  (Customer নিজে বাতিল করে, শুধু pending/confirmed থাকলে)
const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!['pending', 'confirmed'].includes(order.status)) {
    res.status(400);
    throw new Error('This order can no longer be cancelled');
  }
  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await restoreStock(order);
  await order.save();
  res.json(order);
});

// ---------- Admin ----------

// GET /api/orders  ?status=&search=&from=&to=&page=&limit=
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, from, to } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 15, 5000);
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ orderNumber: rx }, { 'shippingAddress.fullName': rx }, { 'shippingAddress.phone': rx }];
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
  }
  const total = await Order.countDocuments(filter);
  const items = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
});

// PUT /api/orders/:id/status  body: { status, note }
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!Order.STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (['cancelled', 'returned'].includes(order.status)) {
    res.status(400);
    throw new Error(`A ${order.status} order cannot be changed`);
  }
  order.status = status;
  order.statusHistory.push({ status, note: note || '' });
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.isPaid = true; // COD: ডেলিভারির সময় টাকা পাওয়া যায়
  }
  if (['cancelled', 'returned'].includes(status)) await restoreStock(order);
  await order.save();
  res.json(order);
});

module.exports = { createOrder, getMyOrders, getOrder, trackOrder, cancelMyOrder, getAllOrders, updateOrderStatus };
