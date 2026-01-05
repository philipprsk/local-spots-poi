import { userApi } from "./api/user-api.js";
import { localspotApi } from "./api/localspot-api.js";
import { categoryApi } from "./api/category-api.js";

export const apiRoutes = [
  { method: "POST", path: "/api/users", config: userApi.create },
  { method: "GET", path: "/api/users", config: userApi.find },
  { method: "DELETE", path: "/api/users", config: userApi.deleteAll },
  { method: "GET", path: "/api/users/{id}", config: userApi.findOne },

  { method: "POST", path: "/api/localspots", config: localspotApi.create },
  { method: "DELETE", path: "/api/localspots", config: localspotApi.deleteAll },
  { method: "GET", path: "/api/localspots", config: localspotApi.find },
  { method: "GET", path: "/api/localspots/{id}", config: localspotApi.findOne },
  { method: "DELETE", path: "/api/localspots/{id}", config: localspotApi.deleteOne },
  { method: "POST", path: "/api/localspots/{id}/image", config: localspotApi.uploadImage },
  { method: "DELETE", path: "/api/localspots/{id}/image", config: localspotApi.deleteImage },

  { method: "GET", path: "/api/categories", config: categoryApi.find },
  { method: "GET", path: "/api/categories/{id}", config: categoryApi.findOne },
  { method: "POST", path: "/api/categories", config: categoryApi.create },
  { method: "DELETE", path: "/api/categories/{id}", config: categoryApi.deleteOne },
  { method: "DELETE", path: "/api/categories", config: categoryApi.deleteAll },

  { method: "POST", path: "/api/users/authenticate", config: userApi.authenticate },
];