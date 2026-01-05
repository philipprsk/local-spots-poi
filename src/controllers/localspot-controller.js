import { db } from "../models/db.js";
import { LocalSpotSpec } from "../models/joi-schemas.js";
import { imageStore } from "../models/image-store.js";

export const localspotController = {
  index: {
    auth: {
      strategy: "session",
      mode: "required",
    },
    handler: async (request, h) => {
      const user = request.auth.credentials;
      console.log("=== DASHBOARD ===");
      console.log("User:", user.email);
      console.log("isAdmin:", user.isAdmin);
      
      const localspots = await db.localspotStore.getUserLocalSpots(user._id);
      const categories = await db.categoryStore.getAllCategories();
      return h.view("dashboard-view", { 
        title: "Local Spots Dashboard", 
        user: user,
        localspots: localspots, 
        categories: categories 
      });
    },
  },
  
  addLocalSpot: {
    validate: {
      payload: LocalSpotSpec,
      options: { abortEarly: false },
      failAction: async (request, h, error) => {
        const user = request.auth.credentials;
        const localspots = await db.localspotStore.getUserLocalSpots(user._id);
        const categories = await db.categoryStore.getAllCategories();
        return h.view("dashboard-view", { 
          title: "Add local spot error", 
          user, 
          localspots, 
          categories,
          errors: error.details 
        }).takeover().code(400);
      },
    },
    handler: async (request, h) => {
      const user = request.auth.credentials;
      await db.localspotStore.addLocalSpot({
        userid: user._id,
        title: request.payload.title,
        description: request.payload.description,
        latitude: request.payload.latitude,
        longitude: request.payload.longitude,
        category: request.payload.category,
      });
      return h.redirect("/dashboard/localspots");
    },
  },

  deleteLocalSpot: {
    handler: async (request, h) => {
      await db.localspotStore.deleteLocalSpotById(request.params.id);
      return h.redirect("/dashboard/localspots");
    },
  },

  uploadImage: {
    payload: {
      maxBytes: 10 * 1024 * 1024,
      output: "data",
      parse: true,
      allow: "multipart/form-data",
    },
    handler: async (request, h) => {
      try {
        const spot = await db.localspotStore.getLocalSpotById(request.params.id);
        if (!spot) return h.redirect("/dashboard/localspots");
        
        const buffer = request.payload.imagefile;
        if (!buffer) return h.redirect("/dashboard/localspots");
        
        const result = await imageStore.uploadImage(buffer);
        
        await db.localspotStore.updateLocalSpot(spot._id, {
          img: result.url,
          imgPublicId: result.public_id,
        });
        return h.redirect("/dashboard/localspots");
      } catch (error) {
        console.error("Upload error:", error.message);
        return h.redirect("/dashboard/localspots");
      }
    },
  },
   
  deleteImage: {
    handler: async (request, h) => {
      const spot = await db.localspotStore.getLocalSpotById(request.params.id);
      if (!spot) return h.redirect("/dashboard/localspots");
      if (spot.imgPublicId) {
        await imageStore.deleteImage(spot.imgPublicId);
      }
      await db.localspotStore.updateLocalSpot(spot._id, { img: null, imgPublicId: null });
      return h.redirect("/dashboard/localspots");
    },
  },
};