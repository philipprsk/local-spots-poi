import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { IdSpec, LocalSpotSpec, LocalSpotSpecPlus, LocalSpotArray } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";

export const localspotApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const localspots = await db.localspotStore.getAllLocalSpots();
        return localspots;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all localspots",
    notes: "Returns details of all localspots",
    response: { schema: LocalSpotArray, failAction: validationError },
  },

  findOne: {
    auth: { 
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const localspot = await db.localspotStore.getLocalSpot(request.params.id);
        if (!localspot) {
          return Boom.notFound("No LocalSpot with this id");
        }
        return localspot;
      } catch (err) {
        return Boom.serverUnavailable("No LocalSpot with this id");
      }
    },
    tags: ["api"],
    description: "Get a specific localspot",
    notes: "Returns localspot details",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: LocalSpotSpecPlus, failAction: validationError },
  },

  create: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const localspot = await db.localspotStore.addLocalSpot(request.payload);
        if (localspot) {
          return h.response(localspot).code(201);
        }
        return Boom.badImplementation("error creating localspot");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a localspot",
    notes: "Returns the newly created localspot",
    validate: { payload: LocalSpotSpec, failAction: validationError },
    response: { schema: LocalSpotSpecPlus, failAction: validationError },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const localspot = await db.localspotStore.getLocalSpot(request.params.id);
        if (!localspot) {
          return Boom.notFound("No LocalSpot with this id");
        }
        await db.localspotStore.deleteLocalSpot(localspot._id.toString());
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("No LocalSpot with this id");
      }
    },
    tags: ["api"],
    description: "Delete a localspot",
    notes: "Removes a specific localspot from the database",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        await db.localspotStore.deleteAllLocalSpots();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all localspots",
    notes: "Removes all localspots from the database",
  },
};