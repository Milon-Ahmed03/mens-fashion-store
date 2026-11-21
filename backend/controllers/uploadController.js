const asyncHandler = require('../utils/asyncHandler');
const { uploadBuffer, deleteImage } = require('../utils/cloudinaryUpload');

// POST /api/upload  (field name: images)
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please select at least one image');
  }
  const results = [];
  for (const file of req.files) results.push(await uploadBuffer(file.buffer));
  res.status(201).json(results);
});

// DELETE /api/upload  body: { publicId }
const removeImage = asyncHandler(async (req, res) => {
  await deleteImage(req.body.publicId);
  res.json({ message: 'Image removed' });
});

module.exports = { uploadImages, removeImage };
