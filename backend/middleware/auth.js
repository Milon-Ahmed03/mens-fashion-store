// Protected Route: JWT যাচাই করে লগইন করা ইউজার খুঁজে বের করে
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not logged in');
  }
  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (e) {
    res.status(401);
    throw new Error('Session expired. Please login again');
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }
  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Please contact support');
  }
  req.user = user;
  next();
});

// শুধু Admin ঢুকতে পারবে
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  next(new Error('Admin access only'));
};

module.exports = { protect, adminOnly };
