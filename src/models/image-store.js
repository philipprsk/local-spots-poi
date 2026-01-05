import * as dotenv from "dotenv";
import * as cloudinary from "cloudinary";
import { writeFileSync } from "fs";
import streamifier from "streamifier";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_key,
  api_secret: process.env.cloudinary_secret,
});

export const imageStore = {
  async getAllImages() {
    const result = await cloudinary.v2.api.resources();
    return result.resources;
  },

  async uploadImage(buffer) {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.v2.uploader.upload_stream((err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, public_id: result.public_id });
      });
      streamifier.createReadStream(buffer).pipe(upload);
    });
  },

  async deleteImage(publicId) {
    await cloudinary.v2.uploader.destroy(publicId);
  },
};