const express = require('express');
const { body } = require('express-validator');
const Banner = require('../models/Banner');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const crud = require('../controllers/crudFactory')(Banner, { sort: { order: 1 }, label: 'Banner' });
const { deleteImage } = require('../utils/cloudinaryUpload');

const router = express.Router();

// সবাই শুধু Active ব্যানার দেখে
router.get('/', asyncHandler(async (req, res) => res.json(await Banner.find({ isActive: true }).sort({ order: 1 }))));
// Admin সব ব্যানার দেখে
router.get('/all', protect, adminOnly, crud.list);
router.post(
  '/',
  protect,
  adminOnly,
  [body('title').trim().notEmpty().withMessage('Title is required'), body('image').notEmpty().withMessage('Banner image is required')],
  validate,
  crud.create
);
router.put('/:id', protect, adminOnly, crud.update);
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      res.status(404);
      throw new Error('Banner not found');
    }
    await deleteImage(banner.imagePublicId);
    await banner.deleteOne();
    res.json({ message: 'Banner deleted' });
  })
);

module.exports = router;
