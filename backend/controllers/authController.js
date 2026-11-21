const User = require('../models/User');
const admin = require('../config/firebaseAdmin');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// Frontend-এ পাঠানোর জন্য ইউজারের নিরাপদ তথ্য
const safeUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  avatar: u.avatar,
  address: u.address,
});

// POST /api/auth/firebase-login  (Customer: Firebase Token -> আমাদের JWT)
const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken, name } = req.body;
  if (!admin.apps.length) {
    res.status(500);
    throw new Error('Firebase Admin is not configured on the server (check FIREBASE_* in backend/.env)');
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (e) {
    res.status(401);
    throw new Error('Invalid Firebase token');
  }
  if (!decoded.email) {
    res.status(400);
    throw new Error('Your Firebase account has no email');
  }

  let user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user) {
    const sameEmail = await User.findOne({ email: decoded.email.toLowerCase() });
    // Admin একাউন্ট Firebase দিয়ে দখল করা যাবে না; অন্য একাউন্টও শুধু verified email হলে যুক্ত হবে
    if (sameEmail && (sameEmail.role === 'admin' || !decoded.email_verified)) {
      res.status(403);
      throw new Error('This email is already registered');
    }
    if (sameEmail) {
      user = sameEmail;
      user.firebaseUid = decoded.uid;
      await user.save();
    } else {
      user = await User.create({
        name: name || decoded.name || decoded.email.split('@')[0],
        email: decoded.email,
        firebaseUid: decoded.uid,
        avatar: decoded.picture || '',
      });
    }
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Please contact support');
  }
  res.json({ token: generateToken(user._id), user: safeUser(user) });
});

// POST /api/auth/admin-login  (Admin: Email + Password)
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.isBlocked) {
    res.status(403);
    throw new Error('This account is blocked');
  }
  res.json({ token: generateToken(user._id), user: safeUser(user) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(safeUser(req.user));
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, address } = req.body;
  const user = req.user;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  if (address) user.address = { ...user.address.toObject(), ...address };
  await user.save();
  res.json(safeUser(user));
});

// PUT /api/auth/password  (শুধু Admin; Customer-এর পাসওয়ার্ড Firebase সামলায়)
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user.password) {
    res.status(400);
    throw new Error('Your password is managed by Firebase. Use "Forgot password" on the login page');
  }
  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is wrong');
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

module.exports = { firebaseLogin, adminLogin, getMe, updateProfile, changePassword };
