// চালানোর নিয়ম:  npm run seed          -> Admin + Dummy Data (Products না থাকলে)
//                npm run seed -- --reset -> আগের Products/Categories/Brands/Banners মুছে নতুন Dummy Data
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');

const img = (id) => ({ url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`, publicId: '' });

// প্রোডাক্টের ধরন অনুযায়ী ছবি (Unsplash)। কোনো ছবি না এলে Admin থেকে নিজের ছবি আপলোড করুন
const PHOTOS = {
  tshirt: ['photo-1521572163474-6864f9cf17ab', 'photo-1583743814966-8936f5b7be1a'],
  shirt: ['photo-1596755094514-f87e34085b2c', 'photo-1602810318383-e386cc2a3ccf'],
  polo: ['photo-1576566588028-4147f3842f27', 'photo-1625910513413-5fc42d66b1ce'],
  pants: ['photo-1473966968600-fa801b869a1a', 'photo-1624378439575-d8705ad7ae80'],
  jeans: ['photo-1542272604-787c3835535d', 'photo-1541099649105-f69ad21f3246'],
  hoodie: ['photo-1556905055-8f358a7a47b2', 'photo-1578768079052-aa76e52ff62e'],
  jacket: ['photo-1551028719-00167b16eac5', 'photo-1591047139829-d91aecb6caea'],
  sweater: ['photo-1434389677669-e08b4cac3105', 'photo-1608739871923-5d5fba6cfa5d'],
};

const clothSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const waistSizes = ['28', '30', '32', '34', '36'];

const seedCatalog = async () => {
  const cats = {};
  const mk = async (key, name, parent = null) => (cats[key] = await Category.create({ name, parent }));
  await mk('shirts', 'Shirts');
  await mk('tshirts', 'T-Shirts');
  await mk('polo', 'Polo Shirts');
  await mk('pants', 'Pants & Trousers');
  await mk('jeans', 'Jeans');
  await mk('winter', 'Winter Collection');
  await mk('hoodies', 'Hoodies', cats.winter._id);
  await mk('jackets', 'Jackets', cats.winter._id);
  await mk('sweaters', 'Sweaters', cats.winter._id);

  const brands = {};
  for (const n of ['Urban Edge', 'Classic Gentleman', 'Street Wear Co', 'Denim Lab', 'Northfield']) brands[n] = await Brand.create({ name: n });

  // [name, type, category, brand, price, discount, colors, stock, featured, sizes]
  const list = [
    ['Classic Cotton Crew T-Shirt', 'tshirt', 'tshirts', 'Urban Edge', 950, 750, ['White', 'Black', 'Navy'], 60, true, clothSizes],
    ['Oversized Graphic T-Shirt', 'tshirt', 'tshirts', 'Street Wear Co', 1200, 0, ['Black', 'Grey'], 45, false, clothSizes],
    ['Slim Fit Oxford Shirt', 'shirt', 'shirts', 'Classic Gentleman', 2200, 1850, ['Sky Blue', 'White'], 35, true, clothSizes],
    ['Checked Casual Shirt', 'shirt', 'shirts', 'Urban Edge', 1800, 0, ['Red', 'Green'], 28, false, clothSizes],
    ['Pique Polo Shirt', 'polo', 'polo', 'Classic Gentleman', 1400, 1150, ['Navy', 'Maroon', 'White'], 50, true, clothSizes],
    ['Essential Cotton Polo', 'polo', 'polo', 'Northfield', 1250, 0, ['Black', 'Olive'], 40, false, clothSizes],
    ['Formal Slim Trousers', 'pants', 'pants', 'Classic Gentleman', 2800, 2400, ['Charcoal', 'Black'], 30, false, waistSizes],
    ['Cotton Chino Pants', 'pants', 'pants', 'Northfield', 2400, 0, ['Khaki', 'Navy'], 38, true, waistSizes],
    ['Slim Fit Stretch Jeans', 'jeans', 'jeans', 'Denim Lab', 3200, 2700, ['Dark Blue', 'Black'], 42, true, waistSizes],
    ['Relaxed Fit Washed Jeans', 'jeans', 'jeans', 'Denim Lab', 3000, 0, ['Light Blue'], 25, false, waistSizes],
    ['Fleece Pullover Hoodie', 'hoodie', 'hoodies', 'Street Wear Co', 2900, 2400, ['Black', 'Grey', 'Navy'], 55, true, clothSizes],
    ['Zip-Up Winter Hoodie', 'hoodie', 'hoodies', 'Urban Edge', 3100, 0, ['Charcoal', 'Olive'], 33, false, clothSizes],
    ['Faux Leather Biker Jacket', 'jacket', 'jackets', 'Northfield', 6500, 5600, ['Black', 'Brown'], 18, true, clothSizes],
    ['Quilted Puffer Jacket', 'jacket', 'jackets', 'Northfield', 5400, 0, ['Navy', 'Black'], 20, false, clothSizes],
    ['Merino Wool Sweater', 'sweater', 'sweaters', 'Classic Gentleman', 3600, 3100, ['Camel', 'Grey', 'Navy'], 27, true, clothSizes],
    ['Cable Knit Sweater', 'sweater', 'sweaters', 'Classic Gentleman', 3400, 0, ['Cream', 'Forest Green'], 22, false, clothSizes],
  ];
  for (const [name, type, cat, brand, price, discountPrice, colors, stock, isFeatured, sizes] of list) {
    await Product.create({
      name,
      description: `${name} made from premium quality fabric. Comfortable all day, easy to style, and built to last wash after wash. A must-have piece for every man's wardrobe.`,
      price,
      discountPrice,
      category: cats[cat]._id,
      brand: brands[brand]._id,
      images: PHOTOS[type].map(img),
      sizes,
      colors,
      stock,
      isFeatured,
    });
  }

  await Banner.create([
    { title: 'New Season Collection', subtitle: 'Fresh styles for the modern man', image: img('photo-1490114538077-0a7f8cb49891').url, link: '/shop', order: 1 },
    { title: 'Winter Is Coming', subtitle: 'Hoodies, jackets and sweaters up to 25% off', buttonText: 'Explore Winter', image: img('photo-1441984904996-e0b6ba687e04').url, link: '/shop?category=winter-collection', order: 2 },
  ]);
  await Coupon.create({ code: 'WELCOME10', type: 'percent', value: 10, minOrder: 1000, maxDiscount: 500 });
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || 'mens_fashion_store' });
  console.log('Connected to MongoDB');

  await Settings.getSettings();

  // Admin একাউন্ট (.env থেকে ADMIN_EMAIL / ADMIN_PASSWORD)
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) console.log('Admin already exists, skipped');
    else {
      await User.create({ name: ADMIN_NAME || 'Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
      console.log(`Admin created: ${ADMIN_EMAIL}`);
    }
  } else {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set in .env, admin was NOT created');
  }

  if (process.argv.includes('--reset')) {
    await Promise.all([Product.deleteMany(), Category.deleteMany(), Brand.deleteMany(), Review.deleteMany(), Banner.deleteMany(), Coupon.deleteMany({ code: 'WELCOME10' })]);
    console.log('Old catalog removed');
  }
  if ((await Product.countDocuments()) === 0) {
    await seedCatalog();
    console.log('Dummy categories, brands, products, banners and coupon (WELCOME10) added');
  } else console.log('Products already exist, dummy data skipped (use --reset to rebuild)');

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
