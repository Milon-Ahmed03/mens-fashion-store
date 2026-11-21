const mongoose = require('mongoose');
const { uniqueSlug } = require('../utils/slugify');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 }, // 0 মানে কোনো ডিসকাউন্ট নেই
    finalPrice: { type: Number, default: 0 }, // ডিসকাউন্ট থাকলে discountPrice, নইলে price (Filter/Sort-এর জন্য)
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    images: [{ url: String, publicId: { type: String, default: '' } }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratingAvg: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre('validate', async function () {
  if (this.isNew || this.isModified('name')) this.slug = await uniqueSlug(this.constructor, this.name, this._id);
  const hasDiscount = this.discountPrice > 0 && this.discountPrice < this.price;
  this.finalPrice = hasDiscount ? this.discountPrice : this.price;
  if (!hasDiscount) this.discountPrice = 0;
});

module.exports = mongoose.model('Product', productSchema);
