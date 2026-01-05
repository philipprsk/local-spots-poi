import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { IdSpec, LocalSpotSpec, LocalSpotSpecPlus, LocalSpotArray } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { imageStore } from "../models/image-store.js";


export const localspotApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        // Sicherstellen, dass dein Store .populate("categories") nutzt!
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
    auth: { strategy: "jwt" },
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
    auth: { strategy: "jwt" },
    tags: ["api"], // Jetzt korrekt innerhalb des Objekts
    description: "Create a localspot",
    notes: "Returns the newly created localspot",
    validate: { payload: LocalSpotSpec, failAction: validationError },
    response: { schema: LocalSpotSpecPlus, failAction: validationError },
    handler: async (request, h) => {
      try {
        const userId = request.auth.credentials._id;
        const localspotPayload = { ...request.payload, userid: userId };
        const localspot = await db.localspotStore.addLocalSpot(localspotPayload);
        if (localspot) return h.response(localspot).code(201);
        return Boom.badImplementation("error creating localspot");
      } catch (err) {
        return Boom.badImplementation("Database error");
      }
    },
  }, // Hier war der Klammerfehler

  deleteOne: {
    auth: { strategy: "jwt" },
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
    auth: { strategy: "jwt" },
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

uploadImage: {
    auth: { strategy: "jwt" },
    tags: ["api"],
    description: "Upload image to localspot",
    notes: "Stores image and returns updated localspot",
    payload: { multipart: true, output: "stream", parse: true, maxBytes: 5 * 1024 * 1024 },
    handler: async (request, h) => {
      const { id } = request.params;
      const localspot = await db.localspotStore.getLocalSpot(id);
      if (!localspot) return Boom.notFound("No LocalSpot with this id");
      const file = request.payload?.imagefile;
      if (!file) return Boom.badRequest("No file uploaded");

      return new Promise((resolve, reject) => {
        const chunks = [];
        file.on("data", (chunk) => chunks.push(chunk));
        file.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const uploaded = await imageStore.uploadImage(buffer);
            const updated = await db.localspotStore.updateLocalSpot(localspot._id, {
              img: uploaded.url,
              imgPublicId: uploaded.public_id,
            });
            resolve(h.response(updated).code(200));
          } catch (err) {
            reject(err);
          }
        });
        file.on("error", reject);
      });
    },
  },

  deleteImage: {
    auth: { strategy: "jwt" },
    tags: ["api"],
    description: "Delete image from localspot",
    notes: "Deletes cloud image and clears fields",
    handler: async (request, h) => {
      const { id } = request.params;
      const localspot = await db.localspotStore.getLocalSpot(id);
      if (!localspot) return Boom.notFound("No LocalSpot with this id");

      if (localspot.imgPublicId) {
        await imageStore.deleteImage(localspot.imgPublicId);
      }
      const updated = await db.localspotStore.updateLocalSpot(localspot._id, {
        img: null,
        imgPublicId: null,
      });
      return h.response(updated).code(200);
    },
  },
};