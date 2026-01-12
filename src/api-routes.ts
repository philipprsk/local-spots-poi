import { userApi } from "./api/user-api.js";
import { localspotApi } from "./api/localspot-api.js";
import { categoryApi } from "./api/category-api.js";
import { ServerRoute } from "@hapi/hapi";

export const apiRoutes: ServerRoute[] = [
  // --- USERS ---
  { method: "post", path: "/api/users", options: userApi.create },
  { method: "post", path: "/api/users/authenticate", options: userApi.authenticate },
  { method: "get", path: "/api/users", options: userApi.find },
  { method: "get", path: "/api/users/{id}", options: userApi.findOne },
  { method: "delete", path: "/api/users/{id}", options: userApi.deleteOne },
  { method: "delete", path: "/api/users", options: userApi.deleteAll },

  // --- LOCALSPOTS ---
  { method: "post", path: "/api/localspots", options: localspotApi.create }, // Payload Config kommt jetzt aus dem Controller!
  { method: "get", path: "/api/localspots", options: localspotApi.find },
  { method: "get", path: "/api/localspots/{id}", options: localspotApi.findOne },
  { method: "delete", path: "/api/localspots/{id}", options: localspotApi.deleteOne },
  { method: "delete", path: "/api/localspots", options: localspotApi.deleteAll },
  { method: "post", path: "/api/localspots/{id}/image", options: localspotApi.uploadImage },

  // --- CATEGORIES ---
  { method: "get", path: "/api/categories", options: categoryApi.find },
  { method: "get", path: "/api/categories/{id}", options: categoryApi.findOne },
  { method: "post", path: "/api/categories", options: categoryApi.create },
  { method: "delete", path: "/api/categories/{id}", options: categoryApi.deleteOne },
  { method: "delete", path: "/api/categories", options: categoryApi.deleteAll },
];