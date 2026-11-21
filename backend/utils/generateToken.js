const jwt = require('jsonwebtoken');

// ইউজারের জন্য JWT তৈরি করে
module.exports = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
