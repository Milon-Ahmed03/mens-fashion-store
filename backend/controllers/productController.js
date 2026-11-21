const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Review = require('../models/Review');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { deleteImage } = require('../utils/cloudinaryUpload');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toArray = (v) => (Array.isArray(v) ? v : String(v || '').split(',')).map((s) => String(s).trim()).filter(Boolean);

// Search, Category, Brand, Price, Size, Color Filter তৈরি করে
const buildFilter = async (q, isAdmin) => {
  const filter = {};
  if (!isAdmin) filter.isActive = true;

  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search.trim()), 'i');
    const brands = await Brand.find({ name: rx }).select('_id');
    filter.$or = [{ name: rx }, { description: rx }, { brand: { $in: brands.map((b) => b._id) } }];
  }
  if (q.category) {
    const cat = mongoose.isValidObjectId(q.category)
      ? await Category.findById(q.category)
      : await Category.findOne({ slug: q.category });
    if (!cat) filter.category = null; // কিছুই মিলবে না
    else {
      const ids = (await Category.find({ $or: [{ _id: cat._id }, { parent: cat._id }] }).select('_id')).map((c) => c._id);
      filter.category = { $in: ids }; // Subcategory-র Product-ও দেখাবে
    }
  }
  if (q.brand) {
    const slugs = toArray(q.brand);
    const brands = await Brand.find({ $or: [{ slug: { $in: slugs } }, { _id: { $in: slugs.filter(mongoose.isValidObjectId) } }] }).select('_id');
    filter.brand = { $in: brands.map((b) => b._id) };
  }
  if (q.minPrice || q.maxPrice) {
    filter.finalPrice = {};
    if (q.minPrice) filter.finalPrice.$gte = Number(q.minPrice);
    if (q.maxPrice) filter.finalPrice.$lte = Number(q.maxPrice);
  }
  if (q.size) filter.sizes = { $in: toArray(q.size) };
  if (q.color) filter.colors = { $in: toArray(q.color) };
  if (q.inStock === 'true') filter.stock = { $gt: 0 };
  if (q.featured === 'true') filter.isFeatured = true;
  if (q.onSale === 'true') filter.discountPrice = { $gt: 0 };
  if (q.lowStock === 'true') filter.stock = { $lte: 5 };
  return filter;
};

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { finalPrice: 1 },
  price_desc: { finalPrice: -1 },
  rating: { ratingAvg: -1, numReviews: -1 },
  name: { name: 1 },
  stock_asc: { stock: 1 },
};

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const isAdmin = req.query.admin === 'true' && req.user && req.user.role === 'admin';
  const filter = await buildFilter(req.query, isAdmin);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 1000);

  const total = await Product.countDocuments(filter);
  const items = await Product.find(filter)
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .sort(SORTS[req.query.sort] || SORTS.newest)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
});

// GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug parent')
    .populate('brand', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// GET /api/products/id/:id  (Admin Edit পেজের জন্য)
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug').populate('brand', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// শুধু অনুমোদিত Field নেয় (বাইরে থেকে ratingAvg ইত্যাদি বদলানো ঠেকাতে)
const pickFields = (b) => {
  const data = {};
  ['name', 'description', 'price', 'discountPrice', 'category', 'brand', 'stock', 'isFeatured', 'isActive'].forEach((k) => {
    if (b[k] !== undefined) data[k] = b[k];
  });
  if (b.brand === '') data.brand = undefined;
  if (b.images !== undefined) data.images = b.images;
  if (b.sizes !== undefined) data.sizes = toArray(b.sizes);
  if (b.colors !== undefined) data.colors = toArray(b.colors);
  return data;
};

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(pickFields(req.body));
  res.status(201).json(product);
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const data = pickFields(req.body);
  // যে ছবি বাদ দেওয়া হয়েছে সেগুলো Cloudinary থেকেও মুছি
  if (data.images) {
    const keep = data.images.map((i) => i.publicId);
    for (const old of product.images) if (old.publicId && !keep.includes(old.publicId)) await deleteImage(old.publicId);
  }
  product.set(data);
  await product.save();
  res.json(product);
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  for (const img of product.images) await deleteImage(img.publicId);
  await Review.deleteMany({ product: product._id });
  await User.updateMany({}, { $pull: { wishlist: product._id } });
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

// POST /api/products/bulk-discount  body: { category: 'all' | categoryId, percent: 0-90 }  (percent 0 = ডিসকাউন্ট তুলে দেওয়া)
const bulkDiscount = asyncHandler(async (req, res) => {
  const percent = Number(req.body.percent);
  if (Number.isNaN(percent) || percent < 0 || percent > 90) {
    res.status(400);
    throw new Error('Percent must be between 0 and 90');
  }
  const filter = {};
  if (req.body.category && req.body.category !== 'all') {
    const ids = (await Category.find({ $or: [{ _id: req.body.category }, { parent: req.body.category }] }).select('_id')).map((c) => c._id);
    filter.category = { $in: ids };
  }
  const products = await Product.find(filter);
  for (const p of products) {
    p.discountPrice = percent === 0 ? 0 : Math.round(p.price * (1 - percent / 100));
    await p.save(); // save() করলে finalPrice নিজে হিসাব হয়
  }
  res.json({ message: `Discount updated for ${products.length} products`, count: products.length });
});

module.exports = { getProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct, bulkDiscount };
