// Category, Brand, Banner, Coupon-এর মতো সহজ Resource-এর জন্য একই CRUD কোড
const asyncHandler = require('../utils/asyncHandler');

module.exports = (Model, { sort = { createdAt: -1 }, label = 'Item' } = {}) => ({
  list: asyncHandler(async (req, res) => res.json(await Model.find().sort(sort))),

  create: asyncHandler(async (req, res) => res.status(201).json(await Model.create(req.body))),

  update: asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error(`${label} not found`);
    }
    doc.set(req.body); // save() ব্যবহার করায় slug ইত্যাদি Hook ঠিকমতো চলে
    await doc.save();
    res.json(doc);
  }),

  remove: asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error(`${label} not found`);
    }
    await doc.deleteOne();
    res.json({ message: `${label} deleted` });
  }),
});
