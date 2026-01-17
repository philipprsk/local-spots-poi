import Boom from "@hapi/boom";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db.js";
import { IdSpec, LocalSpotSpec, LocalSpotSpecPlus, LocalSpotArray } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { imageStore } from "../models/image-store.js";
import { User, LocalSpot } from "../types/localspot-types.js";
import { Readable } from "stream";
import { time } from "console";
import Joi from "joi";

export const localspotApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        // 1. Get the logged-in user from the JWT
        const user = request.auth.credentials as User;
        
      
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
      } catch (err: any) { 
        
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
    description: "Upload images (Render Optimized)",
    
    payload: { 
        multipart: true,       
        output: "data" as const,
        maxBytes: 20971520,     
        parse: true,
        allow: "multipart/form-data",
        failAction: "ignore" as const,
        
  
        timeout: false as const 
    },
    
    // Server-Socket Timeout deaktivieren
    timeout: {
        socket: false
    },

    handler: async (request: Request, h: ResponseToolkit) => {
        const { id } = request.params;
        const localspot = await db.localspotStore.getLocalSpot(id);
        if (!localspot) return Boom.notFound("No LocalSpot found");

        const payload = request.payload as any;

        if (!payload || (!payload.images && !payload.imagefile)) {
             return Boom.badRequest("No images found");
        }

        // Array Normalisierung
        let files = payload.images || payload.imagefile;
        if (!Array.isArray(files)) files = [files];
        const validFiles = files.filter((f: any) => f);

        console.log(`🚀 Starte Upload für ${validFiles.length} Bilder (Sequenziell für Render Stabilität)...`);

        try {
      
            
            for (const fileItem of validFiles) {
                // 1. Buffer extrahieren
                let bufferData: Buffer;
                if (Buffer.isBuffer(fileItem)) {
                    bufferData = fileItem;
                } else if (fileItem._data && Buffer.isBuffer(fileItem._data)) {
                    bufferData = fileItem._data;
                } else {
                    bufferData = Buffer.from(fileItem);
                }

                // RAM-Check Logging
                console.log(`   -> Uploading File (${(bufferData.length / 1024 / 1024).toFixed(2)} MB)...`);

                // 2. Upload
                const uploaded = await imageStore.uploadImage(bufferData);
                
                // 3. Sofort Speichern
                await db.localspotStore.addImageToSpot(
                    localspot._id.toString(), 
                    { url: uploaded.url, publicId: uploaded.public_id }
                );
            }

            console.log("✅ Alle Bilder erfolgreich.");
            
            // Updated Spot zurückgeben
            const updatedSpot = await db.localspotStore.getLocalSpot(id);
            return h.response(updatedSpot).code(200);

        } catch (err: any) {
            console.error("🔥 Upload Error:", err);
            return Boom.badGateway("Upload failed: " + err.message);
        }
    },
  },

  // --- SINGLE IMAGE DELETE ---
  // Route: DELETE /api/localspots/{id}/images/{imageId}
  deleteImage: {
    auth: { strategy: "jwt" },
    tags: ["api"],
    description: "Delete image",
    
    
    validate: { params: { id: IdSpec, imageId: Joi.string() } },

    handler: async (request: Request, h: ResponseToolkit) => {
      // HIER IST DER FIX: Wir lesen aus request.params, NICHT query
      const { id, imageId } = request.params; 
      
      console.log(`API: Deleting Image ${imageId} from Spot ${id}`);

      const localspot = await db.localspotStore.getLocalSpot(id);
      if (!localspot) return Boom.notFound("No LocalSpot with this id");

      try {
          await imageStore.deleteImage(imageId);
          await db.localspotStore.removeImageFromSpot(id, imageId);
          return h.response({ success: true }).code(200);
      } catch (err) {
          console.error("Delete Image Error", err);
          return Boom.badImplementation("Failed to delete image");
      }
    },
  },
};