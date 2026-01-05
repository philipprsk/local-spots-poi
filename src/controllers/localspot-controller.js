import { db } from "../models/db.js";
import { LocalSpotSpec } from "../models/joi-schemas.js";
import { imageStore } from "../models/image-store.js";

export const localspotController = {
  index: {
    handler: async (request, h) => {
      const user = request.auth.credentials;
      const localspots = await db.localspotStore.getUserLocalSpots(user._id);
      return h.view("dashboard-view", { title: "Local Spots Dashboard", user, localspots });
    },
  },

  addLocalSpot: {
    validate: {
      payload: LocalSpotSpec,
      options: { abortEarly: false },
      failAction: (request, h, error) =>
        h.view("dashboard-view", { title: "Add local spot error", errors: error.details }).takeover().code(400),
    },
    handler: async (request, h) => {
      const user = request.auth.credentials;
      await db.localspotStore.addLocalSpot({
        userid: user._id,
        title: request.payload.title,
        description: request.payload.description,
        latitude: request.payload.latitude,
        longitude: request.payload.longitude,
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
      console.log("=== Upload Handler Started ===");
      const spot = await db.localspotStore.getLocalSpotById(request.params.id);
      if (!spot) return h.redirect("/dashboard/localspots");
      
      const buffer = request.payload.imagefile;
      if (!buffer) {
        console.log("No buffer");
        return h.redirect("/dashboard/localspots");
      }

      console.log("Buffer size:", buffer.length);
      
      const result = await imageStore.uploadImage(buffer);
      console.log("Cloudinary result:", result);
      
      await db.localspotStore.updateLocalSpot(spot._id, {
        img: result.url,
        imgPublicId: result.public_id,
      });
      console.log("Spot updated");
      return h.redirect("/dashboard/localspots");
    } catch (error) {
      console.error("Upload handler error:", error.message);
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