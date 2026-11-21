// Category ও Subcategory (parent থাকলে সেটি Subcategory)
const mongoose = require('mongoose');
const { uniqueSlug } = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre('validate', async function () {
  if (this.isNew || this.isModified('name')) this.slug = await uniqueSlug(this.constructor, this.name, this._id);
});

module.exports = mongoose.model('Category', categorySchema);
