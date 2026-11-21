const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const crud = require('./crudFactory')(Category, { sort: { name: 1 }, label: 'Category' });

// Category মুছতে গেলে আগে দেখে নেয় এর ভিতরে Product বা Subcategory আছে কিনা
const remove = asyncHandler(async (req, res) => {
  const hasChildren = await Category.exists({ parent: req.params.id });
  const hasProducts = await Product.exists({ category: req.params.id });
  if (hasChildren || hasProducts) {
    res.status(400);
    throw new Error('Cannot delete: this category has subcategories or products');
  }
  return crud.remove(req, res);
});

module.exports = { ...crud, remove };
