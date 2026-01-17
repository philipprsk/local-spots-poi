import Boom from "@hapi/boom";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db.js";
import { IdSpec, LocalSpotSpec, LocalSpotSpecPlus, LocalSpotArray } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { imageStore } from "../models/image-store.js";
import { User, LocalSpot } from "../types/localspot-types.js";
import { Readable } from "stream";
import { time } from "console";

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
    description: "Upload images",
    
    payload: { 
        multipart: true,       
        output: "data" as const, 
        maxBytes: 104857600,     // 100 MB
        parse: true,
        allow: "multipart/form-data",
        failAction: "ignore" as const 
    },
    
    // KEIN validate Block für Payload!
    validate: { params: { id: IdSpec } },

    handler: async (request: Request, h: ResponseToolkit) => {
        const { id } = request.params;
        const localspot = await db.localspotStore.getLocalSpot(id);
        if (!localspot) return Boom.notFound("No LocalSpot found");

        const payload = request.payload as any;

        // 1. Check: Haben wir überhaupt Payload?
        if (!payload) {
             console.error("❌ API: Payload ist leer");
             return Boom.badRequest("Payload empty");
        }

        // 2. Daten finden (Frontend sendet 'images')
        let files = payload.images;
        
        // Fallback falls Frontend 'imagefile' nutzt (je nach Version)
        if (!files) files = payload.imagefile;

        if (!files) {
             console.error("❌ API: Key 'images' fehlt im Payload. Keys:", Object.keys(payload));
             return Boom.badRequest("No 'images' field in upload");
        }

        // 3. Normalisieren zu Array
        const fileArray = Array.isArray(files) ? files : [files];

        try {
            for (const fileItem of fileArray) {
            
                
                let bufferData: Buffer;

                if (Buffer.isBuffer(fileItem)) {
                    // Fall A: Es ist direkt ein Buffer
                    bufferData = fileItem;
                } else if (fileItem._data && Buffer.isBuffer(fileItem._data)) {
                    // Fall B: Hapi Wrapper Objekt (Standard bei Multipart)
                    bufferData = fileItem._data;
                } else {
                    // Fall C: Irgendwas anderes -> Versuch Konvertierung
                    bufferData = Buffer.from(fileItem);
                }

                console.log(`☁️ Upload zu Cloudinary (${bufferData.length} bytes)...`);

                // 4. Upload (Genau wie in deinem Test!)
                const uploaded = await imageStore.uploadImage(bufferData);
                
                // 5. DB Update
                await db.localspotStore.addImageToSpot(
                    localspot._id.toString(), 
                    { url: uploaded.url, publicId: uploaded.public_id }
                );
            }
            
            // Updated Spot zurückgeben
            const updatedSpot = await db.localspotStore.getLocalSpot(id);
            return h.response(updatedSpot).code(200);

        } catch (err: any) {
            console.error("🔥 API Upload Error:", err);
            return Boom.badImplementation("Upload failed: " + err.message);
        }
    },
  },

  // --- SINGLE IMAGE DELETE ---
  // Route: DELETE /api/localspots/{id}/images/{imageId}
  deleteImage: {
    auth: { strategy: "jwt" },
    tags: ["api"],
    description: "Delete a specific image from localspot",
    notes: "Deletes from Cloudinary and removes from DB array",
    handler: async (request: Request, h: ResponseToolkit) => {
      const { id, imageId } = request.params; // imageId = publicId
      const localspot = await db.localspotStore.getLocalSpot(id);
      
      if (!localspot) return Boom.notFound("No LocalSpot with this id");

      try {
          // 1. Cloudinary Delete
          await imageStore.deleteImage(imageId);
          
          // 2. DB Array Update
          await db.localspotStore.removeImageFromSpot(id, imageId);
          
          return h.response({ success: true }).code(200);
      } catch (err) {
          console.error("Delete Image Error", err);
          return Boom.badImplementation("Failed to delete image");
      }
    },
  },
};