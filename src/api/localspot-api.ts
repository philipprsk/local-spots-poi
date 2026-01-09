import Boom from "@hapi/boom";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db";
import { IdSpec, LocalSpotSpec, LocalSpotSpecPlus, LocalSpotArray } from "../models/joi-schemas";
import { validationError } from "./logger";
import { imageStore } from "../models/image-store";
import { User, LocalSpot } from "../types/models";

export const localspotApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
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
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
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
    tags: ["api"],
    description: "Create a localspot",
    notes: "Returns the newly created localspot",
    validate: { payload: LocalSpotSpec, failAction: validationError },
    response: { schema: LocalSpotSpecPlus, failAction: validationError },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const user = request.auth.credentials as User;
        const userId = typeof user._id === "string" ? user._id : "";        
        const localspotPayload = { ...(request.payload as LocalSpot), userid: userId };
        const localspot = await db.localspotStore.addLocalSpot(localspotPayload);
        if (localspot) return h.response(localspot).code(201);
        return Boom.badImplementation("error creating localspot");
      } catch (err) {
        return Boom.badImplementation("Database error");
      }
    },
  },

  deleteOne: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const localspot = await db.localspotStore.getLocalSpot(request.params.id);
        if (!localspot || !localspot._id) {
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
    handler: async (request: Request, h: ResponseToolkit) => {
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
  handler: async (request: Request, h: ResponseToolkit) => {
    const { id } = request.params;
    const localspot = await db.localspotStore.getLocalSpot(id);
    if (!localspot) return Boom.notFound("No LocalSpot with this id");
    const fileObj = request.payload as { imagefile: any };
    const imageStream = fileObj.imagefile;
    if (!imageStream) return Boom.badRequest("No file uploaded");

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      imageStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      imageStream.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const uploaded = await imageStore.uploadImage(buffer);
          const updated = await db.localspotStore.updateLocalSpot(
            typeof localspot._id === "string" ? localspot._id : "",
            {
              img: uploaded.url,
              imgPublicId: uploaded.public_id,
            }
          );
          if (!updated) {
            return reject(Boom.badImplementation("LocalSpot update failed"));
          }
          resolve(h.response(updated).code(200));
        } catch (err) {
          reject(err);
        }
      });
      imageStream.on("error", reject);
    });
  },
},

  deleteImage: {
    auth: { strategy: "jwt" },
    tags: ["api"],
    description: "Delete image from localspot",
    notes: "Deletes cloud image and clears fields",
    handler: async (request: Request, h: ResponseToolkit) => {
      const { id } = request.params;
      const localspot = await db.localspotStore.getLocalSpot(id);
      if (!localspot) return Boom.notFound("No LocalSpot with this id");

      if (localspot.imgPublicId) {
        await imageStore.deleteImage(localspot.imgPublicId);
      }

      if (!localspot._id) {
        return Boom.badImplementation("LocalSpot update failed");
      }
      const updated = await db.localspotStore.updateLocalSpot(typeof localspot._id === "string" ? localspot._id : "", {
        img: null,
        imgPublicId: null,
      });
      if (!updated) {
        return Boom.badImplementation("LocalSpot update failed");
      }
        return h.response(updated).code(200);
    },
  },
};