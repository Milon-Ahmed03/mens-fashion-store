const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const c = require('../controllers/productController');

const router = express.Router();

// লগইন থাকলে ইউজার ধরে, না থাকলেও চলবে (Admin তালিকার জন্য লাগে)
const optionalAuth = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (h.startsWith('Bearer ')) {
      const decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (e) {
    /* ignore */
  }
  next();
};

const rules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be 0 or more'),
];

router.get('/', optionalAuth, c.getProducts);
router.post('/bulk-discount', protect, adminOnly, c.bulkDiscount);
router.get('/id/:id', protect, adminOnly, c.getProductById);
router.get('/:slug', c.getProductBySlug);
router.post('/', protect, adminOnly, rules, validate, c.createProduct);
router.put('/:id', protect, adminOnly, c.updateProduct);
router.delete('/:id', protect, adminOnly, c.deleteProduct);

module.exports = router;
