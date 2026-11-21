// 404 এবং সব Error এক জায়গায় সামলায়
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    status = 400;
    message = `${Object.keys(err.keyValue || {})[0] || 'Value'} already exists`;
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.message;
  }

  if (process.env.NODE_ENV !== 'production' && status === 500) console.error(err);
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
