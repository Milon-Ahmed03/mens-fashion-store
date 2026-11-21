const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/reviews/product/:productId  (শুধু অনুমোদিত রিভিউ)
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// POST /api/reviews  body: { product, rating, comment }  (আগে রিভিউ দিলে আপডেট হয়)
const createReview = asyncHandler(async (req, res) => {
  const { product, rating, comment } = req.body;
  const review = await Review.findOneAndUpdate(
    { product, user: req.user._id },
    { rating, comment, isApproved: true },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  await Review.recalculate(product);
  res.status(201).json(review);
});

// ---------- Admin ----------
const getAllReviews = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 15;
  const total = await Review.countDocuments();
  const items = await Review.find()
    .populate('product', 'name slug')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
});

const toggleApprove = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  review.isApproved = !review.isApproved;
  await review.save();
  await Review.recalculate(review.product);
  res.json(review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  await review.deleteOne();
  await Review.recalculate(review.product);
  res.json({ message: 'Review deleted' });
});

module.exports = { getProductReviews, createReview, getAllReviews, toggleApprove, deleteReview };
