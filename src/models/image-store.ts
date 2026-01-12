import * as dotenv from "dotenv";
import * as cloudinary from "cloudinary";
import streamifier from "streamifier";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

console.log("Cloudinary configured:", {
  cloud_name: process.env.CLOUDINARY_NAME ? "✓" : "MISSING",
  api_key: process.env.CLOUDINARY_KEY ? "✓" : "MISSING",
  api_secret: process.env.CLOUDINARY_SECRET ? "✓" : "MISSING",
});

export const imageStore = {
  async uploadImage(buffer: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.v2.uploader.upload_stream((err: any, result: any) => {
        if (err) return reject(err);
        return resolve(result);
      });
      upload.end(buffer);
    });
  },

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;
    await cloudinary.v2.uploader.destroy(publicId);
  },
};