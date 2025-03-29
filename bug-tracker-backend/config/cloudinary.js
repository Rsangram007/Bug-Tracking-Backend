const cloudinary = require('cloudinary').v2;
const { config } = require('dotenv');
config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto', // Automatically detect file type (image/audio)
      folder: 'bug-tracker', // Store in 'bug-tracker' folder
    });
    return result.secure_url; // Return the secure URL
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

module.exports = { uploadToCloudinary };