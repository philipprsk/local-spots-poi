import * as dotenv from "dotenv";
import * as cloudinary from "cloudinary";

dotenv.config();

const config = {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
};

// DEBUG: Sehen, ob Config da ist (ohne Secrets zu loggen)
console.log("Cloudinary Config Check:", { 
    cloud_name: config.cloud_name ? "OK" : "MISSING",
    api_key: config.api_key ? "OK" : "MISSING",
    secret: config.api_secret ? "OK" : "MISSING"
});

cloudinary.v2.config(config);

export const imageStore = {
  // Wir erwarten hier explizit einen Buffer
  async uploadImage(buffer: Buffer): Promise<{ url: string; public_id: string }> {
    console.log("☁️ ImageStore: Upload gestartet...");
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { 
            folder: "localspots", 
            resource_type: "auto" 
        }, 
        (err, result) => {
          if (err) {
              console.error("❌ Cloudinary Error:", err);
              return reject(err);
          }
          if (!result) {
              return reject(new Error("Cloudinary returned no result"));
          }
          console.log("✅ Cloudinary Success:", result.secure_url);
          return resolve({ 
              url: result.secure_url, 
              public_id: result.public_id 
          });
        }
      );
      
      // Den Buffer in den Stream schreiben
      uploadStream.end(buffer);
    });
  },

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;
    try {
        await cloudinary.v2.uploader.destroy(publicId);
    } catch (err) {
        console.error("Cloudinary Delete Error:", err);
    }
  },
};