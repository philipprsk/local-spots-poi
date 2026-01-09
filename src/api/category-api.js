import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { CategorySpec, CategorySpecPlus, CategoryArray } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";

const requireAdmin = (request) => {
  if (!request.auth?.credentials?.isAdmin) throw Boom.forbidden("Admin only");
};

export const categoryApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
      try {
        const categories = await db.categoryStore.getAllCategories();
        return categories;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    response: { schema: CategoryArray, failAction: validationError },
    description: "Get all categories",
    notes: "Returns all categories",
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
      try {
        const category = await db.categoryStore.getCategoryById(request.params.id);
        if (!category) {
          return Boom.notFound("No Category with this id");
        }
        return category;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    response: { schema: CategorySpecPlus, failAction: validationError },
    description: "Get a category",
    notes: "Returns category details",
  },

  create: {
  auth: { strategy: "jwt" },
  handler: async (request, h) => {
    try {
      console.log("Payload:", request.payload);
      console.log("isAdmin:", request.auth?.credentials?.isAdmin);
      const existingCategory = await db.categoryStore.getCategoryBySlug(request.payload.slug);
      if (existingCategory) {
        return Boom.conflict("Category with this slug already exists");
      }
      const category = await db.categoryStore.addCategory(request.payload);
      console.log("Created category:", category);
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
    response: { schema: CategorySpecPlus, failAction: validationError },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
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
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
      try {
        requireAdmin(request);
        await db.categoryStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all categories",
  },
};