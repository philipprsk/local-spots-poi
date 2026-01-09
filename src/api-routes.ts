import { userApi } from "./api/user-api";
import { localspotApi } from "./api/localspot-api";
import { categoryApi } from "./api/category-api";
import { ServerRoute } from "@hapi/hapi";


export const apiRoutes: ServerRoute[] = [
  { method: "post", path: "/api/users", options: userApi.create },
  { method: "get", path: "/api/users", options: userApi.find },
  { method: "delete", path: "/api/users", options: userApi.deleteAll },
  { method: "get", path: "/api/users/{id}", options: userApi.findOne },
  { method: "delete", path: "/api/users/{id}", options: userApi.deleteOne },

  { method: "post", path: "/api/localspots", options: localspotApi.create },
  { method: "delete", path: "/api/localspots", options: localspotApi.deleteAll },
  { method: "get", path: "/api/localspots", options: localspotApi.find },
  { method: "get", path: "/api/localspots/{id}", options: localspotApi.findOne },
  { method: "delete", path: "/api/localspots/{id}", options: localspotApi.deleteOne },
  { method: "post", path: "/api/localspots/{id}/image", options: localspotApi.uploadImage },
  { method: "delete", path: "/api/localspots/{id}/image", options: localspotApi.deleteImage },

  { method: "get", path: "/api/categories", options: categoryApi.find },
  { method: "get", path: "/api/categories/{id}", options: categoryApi.findOne },
  { method: "post", path: "/api/categories", options: categoryApi.create },
  { method: "delete", path: "/api/categories/{id}", options: categoryApi.deleteOne },
  { method: "delete", path: "/api/categories", options: categoryApi.deleteAll },

  { method: "post", path: "/api/users/authenticate", options: userApi.authenticate },
];