const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/authController');

const router = express.Router();

router.post('/firebase-login', [body('idToken').notEmpty().withMessage('Firebase token is required')], validate, c.firebaseLogin);
router.post(
  '/admin-login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  c.adminLogin
);
router.get('/me', protect, c.getMe);
router.put('/profile', protect, c.updateProfile);
router.put(
  '/password',
  protect,
  [body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')],
  validate,
  c.changePassword
);

module.exports = router;
