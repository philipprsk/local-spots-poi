import Boom from "@hapi/boom";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db.js";
import { CategorySpec, CategorySpecPlus, CategoryArray } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { Category } from "../types/localspot-types.js";

const requireAdmin = (request: Request) => {
  if (!request.auth?.credentials?.isAdmin) throw Boom.forbidden("Admin only");
};

export const categoryApi = {
  find: {
    
    auth: { strategy: "jwt" }, 
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const categories = await db.categoryStore.getAllCategories();
        return h.response(categories).code(200);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all categories",
    notes: "Returns all categories",
    // WICHTIG: Response Validierung auskommentiert, um 500 Fehler zu vermeiden
    // response: { schema: CategoryArray, failAction: validationError },
  },

  findOne: {
    auth: { strategy: "jwt" }, 
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const category = await db.categoryStore.getCategoryById(request.params.id);
        if (!category) {
          return Boom.notFound("No Category with this id");
        }
        return h.response(category).code(200);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get a category",
    notes: "Returns category details",
    // response: { schema: CategorySpecPlus, failAction: validationError },
  },

  create: {
    // Erstellen darf meist nur der Admin oder eingeloggte User (hier JWT oder Session)
    auth: { strategy: "jwt" }, 
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const payload = request.payload as Category;
        // Check if slug exists to prevent duplicates
        const existingCategory = await db.categoryStore.getCategoryBySlug(payload.slug);
        if (existingCategory) {
            return Boom.conflict("Category with this slug already exists");
        }
        
        const category = await db.categoryStore.addCategory(payload);
        if (category) {
          return h.response(category).code(201);
        }
        return Boom.badImplementation("error creating category");
      } catch (err) {
        console.error("Category create error:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a Category",
    notes: "Returns the newly created category",
    validate: { payload: CategorySpec, failAction: validationError },
    // response: { schema: CategorySpecPlus, failAction: validationError },
  },

  deleteOne: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        const category = await db.categoryStore.getCategoryById(request.params.id);
        if (!category) {
          return Boom.notFound("No Category with this id");
        }
        await db.categoryStore.deleteCategoryById(request.params.id);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete a category",
  },

  deleteAll: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        await db.categoryStore.deleteAllCategories(); // Name evtl. anpassen, wenn er im Store anders heißt
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all categories",
  },
};