import Boom from "@hapi/boom";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db";
import { IdSpec, LocalSpotSpec, LocalSpotSpecPlus, LocalSpotArray } from "../models/joi-schemas";
import { validationError } from "./logger";
import { imageStore } from "../models/image-store";
import { User, LocalSpot } from "../types/localspot-types";

export const localspotApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        // 1. Get the logged-in user from the JWT
        const user = request.auth.credentials as User;
        
        // 2. Use the private method you mentioned earlier
        // Make sure your db.localspotStore has this method exported
        const localspots = await db.localspotStore.getUserLocalSpots(user._id);
        
        return localspots;
      } catch (err) {
        console.error("API Error:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get only the logged-in user's localspots",
    notes: "Returns details of localspots belonging to the authenticated user",
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
        
        // FIX: Safely convert ObjectId to string, or fallback to empty string
        const userId = user._id ? user._id.toString() : "";
        
        // Debug Log: Check if we actually have an ID now
        console.log("Creating LocalSpot for User ID:", userId);

        const localspotPayload = { 
          ...(request.payload as LocalSpot), 
          userid: userId 
        };
        
        const localspot = await db.localspotStore.addLocalSpot(localspotPayload);
        
        if (localspot) {
          return h.response(localspot).code(201);
        }
        return Boom.badImplementation("error creating localspot");
      } catch (err: any) { // Type as 'any' to access .message
        // IMPORTANT: Log the real error to see why the DB failed
        console.error("❌ LocalSpot Create Error:", err.message); 
        return Boom.badImplementation("Database error: " + err.message);
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
  payload: { multipart: true, output: "stream" as const, parse: true, maxBytes: 5 * 1024 * 1024 },
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
        localspot._id.toString(), 
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