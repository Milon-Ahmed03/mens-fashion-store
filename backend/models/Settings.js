// Store Settings, Shipping Charge ও Homepage Content - সব একটি ডকুমেন্টে থাকে
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Men's Fashion Store" },
    tagline: { type: String, default: 'Premium style for modern men' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    currency: { type: String, default: '৳' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    aboutText: {
      type: String,
      default: 'We bring you premium quality menswear at fair prices. Every piece is picked with care for comfort, fit and style.',
    },
    shipping: {
      insideDhaka: { type: Number, default: 60 },
      outsideDhaka: { type: Number, default: 120 },
      freeShippingOver: { type: Number, default: 0 }, // 0 = বন্ধ
    },
    homepage: {
      heroTitle: { type: String, default: 'Dress Sharp. Feel Confident.' },
      heroSubtitle: { type: String, default: 'Discover the new season collection for men.' },
      featuredTitle: { type: String, default: 'Featured Products' },
      newArrivalsTitle: { type: String, default: 'New Arrivals' },
      promoTitle: { type: String, default: 'Winter Collection is Here' },
      promoText: { type: String, default: 'Hoodies, jackets and sweaters. Stay warm in style.' },
      showCategories: { type: Boolean, default: true },
      showFeatured: { type: Boolean, default: true },
      showNewArrivals: { type: Boolean, default: true },
      showPromo: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// একটিই Settings ডকুমেন্ট থাকে; না থাকলে তৈরি করে দেয়
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
