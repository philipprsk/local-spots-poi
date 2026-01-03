import { db } from "../models/db.js";
import { LocalSpotSpec } from "../models/joi-schemas.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const localspots = await db.localspotStore.getUserLocalSpots(loggedInUser._id);
      const viewData = {
        title: "Local Spots Dashboard",
        user: loggedInUser,
        localspots: localspots,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addLocalSpot: {
    validate: {
      payload: LocalSpotSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("dashboard-view", { title: "Add local spot error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const newLocalspot = {
        userid: loggedInUser._id, 
        title: request.payload.title,
        description: request.payload.description, 
        latitude: request.payload.latitude,       
        longitude: request.payload.longitude,     
      };
      
      await db.localspotStore.addLocalSpot(newLocalspot);
      return h.redirect("/dashboard");
    },
  },

  deleteLocalSpot: { 
    handler: async function (request, h) {
      const localspot = await db.localspotStore.getLocalSpotById(request.params.id);
      await db.localspotStore.deleteLocalSpotById(localspot._id);
      return h.redirect("/dashboard");
    },
  },
};