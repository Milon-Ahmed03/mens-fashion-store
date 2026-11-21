const Brand = require('../models/Brand');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const crud = require('./crudFactory')(Brand, { sort: { name: 1 }, label: 'Brand' });

const remove = asyncHandler(async (req, res) => {
  if (await Product.exists({ brand: req.params.id })) {
    res.status(400);
    throw new Error('Cannot delete: products are using this brand');
  }
  return crud.remove(req, res);
});

module.exports = { ...crud, remove };
