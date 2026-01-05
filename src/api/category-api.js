import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { CategorySpec, CategorySpecPlus, CategoryArray } from "../models/joi-schemas.js";

export const categoryApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
      const categories = await db.categoryStore.getAllCategories();
      return categories;
    },
    tags: ["api"],
    response: { schema: CategoryArray, failAction: "log" },
    description: "Get all categories",
    notes: "Returns all categories",
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
      const category = await db.categoryStore.getCategoryById(request.params.id);
      if (!category) {
        return Boom.notFound("No Category with this id");
      }
      return category;
    },
    tags: ["api"],
    response: { schema: CategorySpecPlus, failAction: "log" },
    description: "Get a category",
    notes: "Returns category details",
  },

  create: {
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
      const category = await db.categoryStore.addCategory(request.payload);
      if (category) {
        return h.response(category).code(201);
      }
      return Boom.badImplementation("error creating category");
    },
    tags: ["api"],
    description: "Create a Category",
    notes: "Returns the newly created category",
    validate: { payload: CategorySpec, failAction: "log" },
    response: { schema: CategorySpecPlus, failAction: "log" },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
      await db.categoryStore.deleteCategoryById(request.params.id);
      return h.response().code(204);
    },
    tags: ["api"],
    description: "Delete a category",
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async (request, h) => {
      await db.categoryStore.deleteAll();
      return h.response().code(204);
    },
    tags: ["api"],
    description: "Delete all categories",
  },
};