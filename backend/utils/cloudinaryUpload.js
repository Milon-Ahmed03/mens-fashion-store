const cloudinary = require('../config/cloudinary');

// Memory-তে থাকা ছবি (buffer) Cloudinary-তে আপলোড করে
const uploadBuffer = (buffer, folder = 'mens-fashion') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });

// Cloudinary থেকে ছবি মুছে ফেলে (ব্যর্থ হলেও প্রধান কাজ থামবে না)
const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn('Cloudinary delete failed:', e.message);
  }
};

module.exports = { uploadBuffer, deleteImage };
