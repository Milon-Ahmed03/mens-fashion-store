const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/uploadController');

const router = express.Router();

router.post('/', protect, adminOnly, upload.array('images', 8), c.uploadImages);
router.delete('/', protect, adminOnly, c.removeImage);

module.exports = router;
