const express = require('express');
const { protect } = require('../middleware/auth');
const c = require('../controllers/wishlistController');

const router = express.Router();
router.use(protect);
router.get('/', c.getWishlist);
router.get('/ids', c.getWishlistIds);
router.post('/:productId', c.toggleWishlist);

module.exports = router;
