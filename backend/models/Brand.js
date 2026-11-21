const mongoose = require('mongoose');
const { uniqueSlug } = require('../utils/slugify');

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

brandSchema.pre('validate', async function () {
  if (this.isNew || this.isModified('name')) this.slug = await uniqueSlug(this.constructor, this.name, this._id);
});

module.exports = mongoose.model('Brand', brandSchema);
