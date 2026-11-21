// Firebase Admin SDK: Frontend থেকে আসা Firebase Token যাচাই করতে লাগে
const admin = require('firebase-admin');

// .env ফাইলে \n লেখা থাকে, সেটাকে আসল নতুন লাইনে বদলাতে হয়
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
  .replace(/^"|"$/g, '')
  .replace(/\\n/g, '\n');

if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && privateKey.includes('BEGIN PRIVATE KEY')) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
} else if (!admin.apps.length) {
  console.warn('WARNING: Firebase Admin is NOT configured. Set FIREBASE_PRIVATE_KEY in backend/.env');
}

module.exports = admin;
