// express-validator-এর ফলাফল দেখে প্রথম Error ফেরত দেয়
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  res.status(400);
  next(new Error(errors.array()[0].msg));
};
