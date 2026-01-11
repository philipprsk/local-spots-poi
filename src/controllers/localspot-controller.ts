import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db";
import { LocalSpotSpec } from "../models/joi-schemas";
import { imageStore } from "../models/image-store";
import { User } from "../types/localspot-types";
import { LocalSpot } from "../types/localspot-types";


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
      maxBytes: 10 * 1024 * 1024,
      output: "data",
      parse: true,
      allow: "multipart/form-data",
    },
    handler: async (request: Request, h: ResponseToolkit) => {
  try {
    const spot = await db.localspotStore.getLocalSpotById(request.params.id);
    if (!spot) return h.redirect("/dashboard/localspots");
    const { imagefile } = request.payload as { imagefile?: Buffer };
    if (!imagefile) return h.redirect("/dashboard/localspots");
    const result = await imageStore.uploadImage(imagefile);
    await db.localspotStore.updateLocalSpot(spot._id, {
      img: result.url,
      imgPublicId: result.public_id,
    });
    return h.redirect("/dashboard/localspots");
  } catch (error: any) {
    console.error("Upload error:", error.message);
    return h.redirect("/dashboard/localspots");
  }
},
  },

  deleteImage: {
    handler: async (request: Request, h: ResponseToolkit) => {
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