const express = require('express');
const { body } = require('express-validator');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/contact  (যে কেউ মেসেজ পাঠাতে পারবে)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().isLength({ min: 5 }).withMessage('Message is too short'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;
    await Message.create({ name, email, subject, message });
    res.status(201).json({ message: 'Thanks! We received your message.' });
  })
);

// Admin: মেসেজ দেখা, পড়া হয়েছে চিহ্নিত করা, মুছে ফেলা
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => res.json(await Message.find().sort({ createdAt: -1 }))));
router.put('/:id/read', protect, adminOnly, asyncHandler(async (req, res) => res.json(await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true }))));
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Message deleted' });
}));

module.exports = router;
