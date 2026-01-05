import { db } from "../models/db.js";
import { LocalSpotSpec } from "../models/joi-schemas.js";

export const dashboardController = {
  index: {
    handler: async (request, h) => h.redirect("/dashboard/localspots"),
  },
};