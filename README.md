# Men's Fashion E-commerce (MERN Stack)

একটি সম্পূর্ণ Men's Fashion E-commerce Website: Customer Store + Admin Dashboard।
**Stack:** MongoDB · Express · React (Create React App) · Node.js · Tailwind CSS · Firebase Auth · JWT · Cloudinary
**Payment:** শুধু Cash on Delivery (কোনো Online Payment নেই)

---

## ১. Folder Structure

```
mens-fashion-store/
├── backend/                  Node + Express API
│   ├── config/               db.js, cloudinary.js, firebaseAdmin.js
│   ├── models/               Database Schema (User, Product, Order ...)
│   ├── controllers/          প্রতিটি Feature-এর আসল লজিক
│   ├── routes/               URL -> Controller সংযোগ
│   ├── middleware/           auth (JWT), error, upload, validate
│   ├── utils/                helper ফাইল + seed.js (Dummy Data)
│   ├── server.js             সার্ভার চালুর ফাইল
│   ├── .env                  আপনার আসল Credentials (GitHub-এ যাবে না)
│   └── .env.example          Placeholder সহ উদাহরণ
└── frontend/                 React অ্যাপ
    ├── public/index.html
    ├── src/
    │   ├── App.js            সব Route
    │   ├── index.js          Provider সেটআপ
    │   ├── components/       Navbar, Footer, ProductCard, Pagination, Modal, ConfirmDialog ...
    │   ├── context/          Auth, Cart, Wishlist, Settings, Catalog (Global State)
    │   ├── pages/            Customer পেজ (Home, Shop, Checkout ...)
    │   ├── admin/            Admin পেজ (Dashboard, Products, Orders ...)
    │   ├── services/api.js   Axios (Backend-এর সাথে যোগাযোগ)
    │   ├── firebase/         Firebase সেটআপ
    │   └── utils/            helper ফাংশন (টাকার ফরম্যাট, CSV Export ...)
    ├── .env                  Frontend কনফিগারেশন
    └── .env.example
```

---

## ২. চালানোর আগে যা লাগবে

- Node.js 18 বা তার উপরে
- MongoDB Atlas (আপনার `MONGO_URI` আগেই `.env`-এ বসানো আছে)
- Firebase Project, Cloudinary Account

### দুটি জিনিস আপনাকে নিজে বসাতে হবে

`.env` ফাইলে এই মানগুলো খালি/TODO আছে, কারণ এগুলো আমাকে দেওয়া হয়নি:

| ফাইল | Key | কোথা থেকে পাবেন |
|---|---|---|
| `backend/.env` | `FIREBASE_PRIVATE_KEY` | Firebase Console → Project settings → Service accounts → "Generate new private key" → JSON ফাইলের `private_key` মান। **ডাবল কোটেশনসহ এক লাইনে** বসান, `\n` যেমন আছে তেমনই রাখুন |
| `backend/.env` | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | আপনার পছন্দের Admin Email ও শক্ত Password |
| `frontend/.env` | `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_APP_ID` | Firebase Console → Project settings → General → Your apps → Web app (না থাকলে একটি Web app যোগ করুন) |

`FIREBASE_PRIVATE_KEY` এর উদাহরণ:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

### Firebase Console সেটিং
1. **Authentication → Sign-in method** এ **Email/Password** চালু করুন।
2. Google Login চাইলে **Google** Provider-ও চালু করুন।
3. **Authentication → Settings → Authorized domains** এ `localhost` আছে কিনা দেখুন (ডিপ্লয়ের পর আপনার ডোমেইনও যোগ করুন)।

---

## ৩. Backend চালানো

```bash
cd backend
npm install
npm run seed      # Admin একাউন্ট + Dummy Products, Categories, Brands, Banners, WELCOME10 কুপন
npm run dev       # http://localhost:3000
```

- `npm run seed` একাধিকবার চালানো নিরাপদ: Admin বা Product থাকলে নতুন করে বানায় না।
- Dummy Data আবার নতুন করে বানাতে চাইলে: `npm run seed -- --reset` (এতে আগের সব Product/Category/Brand/Review/Banner মুছে যায়)।
- MongoDB Atlas-এ **Network Access** এ আপনার IP (বা `0.0.0.0/0` শুধু টেস্টের জন্য) Allow করতে হবে।
- Database-এর নাম `.env`-এর `MONGO_DB_NAME` (ডিফল্ট `mens_fashion_store`)।

## ৪. Frontend চালানো

```bash
cd frontend
npm install
npm start         # http://localhost:5173
```

> Backend `3000` পোর্টে চলে, তাই `frontend/.env`-এ `PORT=5173` দেওয়া আছে। Backend-এর `CLIENT_URL` একই ঠিকানা।

## ৫. লগইন

- **Customer:** `/register` থেকে একাউন্ট খুলুন বা Google দিয়ে লগইন করুন।
- **Admin:** `http://localhost:5173/admin/login`। Email/Password হলো `.env`-এর `ADMIN_EMAIL` / `ADMIN_PASSWORD`।

---

## ৬. Authentication কীভাবে কাজ করে

1. Customer Firebase দিয়ে Register/Login করে (Email-Password বা Google)।
2. Frontend Firebase থেকে ID Token নিয়ে `POST /api/auth/firebase-login` এ পাঠায়।
3. Backend Firebase Admin SDK দিয়ে Token যাচাই করে, MongoDB-তে ইউজার খুঁজে/তৈরি করে এবং নিজের **JWT** দেয়।
4. এরপর সব Protected API `Authorization: Bearer <JWT>` দিয়ে চলে।
5. **Admin** Firebase ব্যবহার করে না। MongoDB-তে Hash করা Password (bcrypt) দিয়ে `POST /api/auth/admin-login` এ লগইন করে। তাই কেউ Firebase-এ Admin-এর Email দিয়ে একাউন্ট খুলে Admin হতে পারবে না।
6. Role (`customer` / `admin`) ও Block/Unblock MongoDB-তে থাকে এবং প্রতিটি রিকোয়েস্টে যাচাই হয়।

## ৭. Features

**Customer:** Homepage (Banner Slider, Category, Featured, New Arrivals) · Shop (Search, Category/Subcategory, Brand, Price, Size, Sort, Pagination) · Product Details (Image Gallery, Size/Color, Stock, Reviews, Related) · Cart · Wishlist · Coupon · Checkout (COD, Inside/Outside Dhaka Shipping) · Order Success · Order History · Order Tracking (লগইন সহ এবং ছাড়া) · Cancel Order · Invoice Print · Profile · About · Contact

**Admin:** Dashboard (Analytics Chart) · Product Add/Edit/Delete + Cloudinary Image Upload · Category/Subcategory · Brand · Inventory · Orders + Status Update + Invoice · Customers + Block/Unblock · Coupons · Bulk Discount · Reviews (Hide/Delete) · Banners · Homepage Content · Shipping Charge · Store Settings · Sales Reports · Messages · Profile + Password Change · CSV Export (Products, Orders, Customers, Reports)

**Security ও Logic:**
- Order-এর দাম ও Stock সবসময় Server-এ Database থেকে হিসাব হয় (Frontend-এর দাম বিশ্বাস করা হয় না)
- Stock শর্তসহ কমে, তাই একসাথে দুজন কিনলেও Stock মাইনাসে যায় না
- Order Cancel/Return হলে Stock ফিরে আসে
- Server-side Validation (express-validator), Central Error Handling, JWT, bcrypt, Role-based Route

## ৮. মূল API তালিকা

| Method | URL | কে পারবে |
|---|---|---|
| POST | `/api/auth/firebase-login`, `/api/auth/admin-login` | সবাই |
| GET/PUT | `/api/auth/me`, `/api/auth/profile` | লগইন |
| GET | `/api/products`, `/api/products/:slug` | সবাই |
| POST/PUT/DELETE | `/api/products`, `/api/products/:id` | Admin |
| GET | `/api/categories`, `/api/brands`, `/api/banners`, `/api/settings` | সবাই |
| POST | `/api/orders` | লগইন |
| GET | `/api/orders/my`, `/api/orders/track` | লগইন / সবাই |
| GET/PUT | `/api/orders`, `/api/orders/:id/status` | Admin |
| POST | `/api/coupons/validate` | লগইন |
| GET/POST | `/api/reviews/...` | সবাই দেখতে, লগইন দিতে |
| GET | `/api/admin/stats`, `/api/admin/reports/sales` | Admin |

## ৯. নতুন Feature যোগ করার সহজ নিয়ম

1. `backend/models/` এ Schema বানান → `controllers/` এ লজিক লিখুন → `routes/` এ URL বাঁধুন → `server.js` এ `app.use(...)` যোগ করুন।
2. Simple CRUD হলে `controllers/crudFactory.js` ব্যবহার করুন (Brand/Coupon/Banner যেভাবে করা)।
3. Frontend-এ `src/pages` বা `src/admin` এ পেজ বানিয়ে `App.js` এ Route যোগ করুন।

## ১০. Troubleshooting

| সমস্যা | সমাধান |
|---|---|
| Login-এ "Firebase is not configured" | `frontend/.env` এ `REACT_APP_FIREBASE_API_KEY` বসিয়ে `npm start` আবার চালান (`.env` বদলালে রিস্টার্ট লাগে) |
| "Firebase Admin is not configured" (Backend) | `FIREBASE_PRIVATE_KEY` ঠিকভাবে বসান (কোটেশন + `\n` সহ) |
| MongoDB connection failed | Atlas-এ IP Allow করুন, `MONGO_URI` যাচাই করুন |
| CORS Error | `backend/.env` এর `CLIENT_URL` ও Frontend-এর আসল ঠিকানা এক কিনা দেখুন |
| Image Upload ব্যর্থ | Cloudinary Credentials যাচাই করুন |
| Dummy Product-এর ছবি আসছে না | Dummy ছবি Unsplash লিংক। কোনোটি না এলে "No Image" দেখায়। Admin থেকে নিজের ছবি আপলোড করুন |
| Admin Login হচ্ছে না | `npm run seed` চালিয়েছেন? `backend/.env` এ `ADMIN_EMAIL`/`ADMIN_PASSWORD` দিয়েছেন? |
| Google Login কাজ করছে না | Firebase-এ Google Provider চালু ও `localhost` Authorized কিনা দেখুন |

## ১১. নিরাপত্তা

- `.env` ফাইল `.gitignore`-এ আছে, GitHub-এ যাবে না। কোড বা `.env.example`-এ কোনো আসল Secret নেই।
- এই প্রজেক্টের Credentials চ্যাটে শেয়ার করা হয়েছে, তাই প্রজেক্ট ঠিকমতো চালানোর পর **MongoDB Password, Cloudinary API Secret, JWT Secret এবং Firebase Service Account Key বদলে নেওয়া (rotate) ভালো**।
- Production-এ `NODE_ENV=production` দিন এবং `CLIENT_URL` এ আপনার আসল ডোমেইন বসান।
# mens-fashion-store
