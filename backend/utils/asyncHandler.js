// async ফাংশনের Error সরাসরি errorHandler-এ পাঠায় (প্রতিবার try/catch লিখতে হয় না)
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
