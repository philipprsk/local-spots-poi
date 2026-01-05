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
        if (err) {
          console.error("Cloudinary upload error:", err);
          return reject(err);
        }
        console.log("Upload successful:", result.public_id);
        resolve({ url: result.secure_url, public_id: result.public_id });
      });
      streamifier.createReadStream(buffer).pipe(upload);
    });
  },

  async deleteImage(publicId) {
    return cloudinary.v2.uploader.destroy(publicId);
  },
};