import * as dotenv from "dotenv";
import * as cloudinary from "cloudinary";
import streamifier from "streamifier";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_key,
  api_secret: process.env.cloudinary_secret,
});

console.log("Cloudinary configured:", {
  cloud_name: process.env.cloudinary_name ? "✓" : "MISSING",
  api_key: process.env.cloudinary_key ? "✓" : "MISSING",
  api_secret: process.env.cloudinary_secret ? "✓" : "MISSING",
});

export const imageStore = {
  async uploadImage(buffer) {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.v2.uploader.upload_stream((err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
      upload.end(buffer);
    });
  },

  async deleteImage(publicId) {
    if (!publicId) return;
    await cloudinary.v2.uploader.destroy(publicId);
  },
};