const express = require('express');
const { chat } = require('../controllers/chatController');

const router = express.Router();

// ---- সুরক্ষা: কেউ বেশি মেসেজ পাঠিয়ে খরচ/Quota শেষ করতে না পারে ----
const WINDOW_MS = 10 * 60 * 1000; // ১০ মিনিট
const MAX_PER_WINDOW = 20; // প্রতি IP থেকে ১০ মিনিটে সর্বোচ্চ ২০ মেসেজ
const MAX_PER_DAY = Number(process.env.CHAT_DAILY_LIMIT) || 300; // পুরো সাইটের জন্য দিনে সর্বোচ্চ

const hits = new Map(); // ip -> সময়ের তালিকা
let today = new Date().toDateString();
let todayCount = 0;

const limiter = (req, res, next) => {
  const now = Date.now();
  if (today !== new Date().toDateString()) {
    today = new Date().toDateString();
    todayCount = 0;
  }
  if (todayCount >= MAX_PER_DAY) {
    res.status(429);
    return next(new Error('The assistant has reached its daily limit. Please try again tomorrow or use the Contact page.'));
  }
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    res.status(429);
    return next(new Error('Too many messages. Please wait a few minutes and try again.'));
  }
  recent.push(now);
  hits.set(req.ip, recent);
  todayCount += 1;
  if (hits.size > 5000) hits.clear(); // Memory বেশি ভরে গেলে পরিষ্কার
  next();
};

router.post('/', limiter, chat);

module.exports = router;
