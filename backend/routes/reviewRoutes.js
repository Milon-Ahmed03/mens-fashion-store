const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/reviewController');

const router = express.Router();

router.get('/product/:productId', c.getProductReviews);
router.post(
  '/',
  protect,
  [body('product').notEmpty().withMessage('Product is required'), body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1 to 5')],
  validate,
  c.createReview
);
router.get('/', protect, adminOnly, c.getAllReviews);
router.put('/:id/approve', protect, adminOnly, c.toggleApprove);
router.delete('/:id', protect, adminOnly, c.deleteReview);

module.exports = router;
