import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db.js";
import { LocalSpotSpec } from "../models/joi-schemas.js";
import { imageStore } from "../models/image-store.js";
import { User } from "../types/localspot-types.js";
import { LocalSpot } from "../types/localspot-types.js";


export const localspotController = {
  index: {
    auth: { strategy: "session" },
    handler: async (request: Request, h: ResponseToolkit) => {
      const user = request.auth.credentials;
      const userId = user._id ?? user.id;
      const [categories, localspots] = await Promise.all([
        db.categoryStore.getAllCategories(),
        db.localspotStore.getUserLocalSpots(userId),
      ]);
      return h.view("dashboard-view", {
        title: "Dashboard",
        user,
        isAdmin: user.isAdmin,
        categories,
        localspots,
      });
    },
  },

  addLocalSpot: {
    validate: {
      payload: LocalSpotSpec,
      options: { abortEarly: false },
      failAction: async (request: Request, h: ResponseToolkit, error: any) => {
        const user = request.auth.credentials;
        const localspots = await db.localspotStore.getUserLocalSpots(user._id);
        const categories = await db.categoryStore.getAllCategories();
        return h.view("dashboard-view", {
          title: "Add local spot error",
          user,
          localspots,
          categories,
          errors: error.details,
        }).takeover().code(400);
      },
    },
    handler: async (request: Request, h: ResponseToolkit) => {
      const user = request.auth.credentials;
      const payload = request.payload as { title: string; description: string; latitude: number; longitude: number; category: string };
      await db.localspotStore.addLocalSpot({
        userid: user._id,
        title: payload.title,
        description: payload.description,
        latitude: payload.latitude,
        longitude: payload.longitude,
        category: payload.category,
      });
      return h.redirect("/dashboard/localspots");
    },
  },

  deleteLocalSpot: {
    handler: async (request: Request, h: ResponseToolkit) => {
      await db.localspotStore.deleteLocalSpotById(request.params.id);
      return h.redirect("/dashboard/localspots");
    },
  },

 uploadImage: {
    payload: {
      maxBytes: 20 * 1024 * 1024, 
      output: "data",
      parse: true,
      allow: "multipart/form-data",
      multipart: true 
    },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const spot = await db.localspotStore.getLocalSpotById(request.params.id);
        if (!spot) return h.redirect("/dashboard/localspots");
        
        const payload = request.payload as any;
        let imageFiles = payload.images; 

        // Hapi Normalisierung: Wenn nur 1 Bild, ist es kein Array -> Array draus machen
        if (!Array.isArray(imageFiles)) {
            imageFiles = imageFiles ? [imageFiles] : [];
        }

        if (imageFiles.length === 0) return h.redirect("/dashboard/localspots");

        // Loop durch alle Dateien
        for (const file of imageFiles) {
            const result = await imageStore.uploadImage(file);
            
             await db.localspotStore.addImageToSpot(spot._id, {
                url: result.url,
                publicId: result.public_id
            });
        }
        
        return h.redirect("/dashboard/localspots");
      } catch (error: any) {
        console.error("Upload error:", error.message);
        return h.redirect("/dashboard/localspots");
      }
    },
  },

  // Löschen eines spezifischen Bildes
  deleteImage: {
    handler: async (request: Request, h: ResponseToolkit) => {
      
      const spotId = request.params.id;
      const imageId = request.params.imageId; 

      const spot = await db.localspotStore.getLocalSpotById(spotId);
      if (!spot) return h.redirect("/dashboard/localspots");

      // 1. Aus Cloudinary löschen
      await imageStore.deleteImage(imageId);

      // 2. Aus der Datenbank entfernen (Pull from Array)
      await db.localspotStore.removeImageFromSpot(spotId, imageId);

      return h.redirect("/dashboard/localspots");
    },
  },
};