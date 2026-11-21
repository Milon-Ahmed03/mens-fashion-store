const express = require('express');
const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => res.json(await Settings.getSettings())));

router.put(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const settings = await Settings.getSettings();
    settings.set(req.body);
    await settings.save();
    res.json(settings);
  })
);

module.exports = router;
