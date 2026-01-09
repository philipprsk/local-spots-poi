import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db";
import { LocalSpotSpec } from "../models/joi-schemas";

export const dashboardController = {
  index: {
    handler: async (request: Request, h: ResponseToolkit) => h.redirect("/dashboard/localspots"),
  },
};