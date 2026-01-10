import { userApi } from "./api/user-api";
import { localspotApi } from "./api/localspot-api";
import { categoryApi } from "./api/category-api";
import { ServerRoute } from "@hapi/hapi";

export const apiRoutes: ServerRoute[] = [
  { method: "post", path: "/api/users", options: { ...userApi.create, auth: false } },
  { method: "get", path: "/api/users", options: { ...userApi.find, auth: { strategy: "jwt" } } },
  { method: "delete", path: "/api/users", options: { ...userApi.deleteAll, auth: { strategy: "jwt" } } },
  { method: "get", path: "/api/users/{id}", options: { ...userApi.findOne, auth: { strategy: "jwt" } } },
  { method: "delete", path: "/api/users/{id}", options: { ...userApi.deleteOne, auth: { strategy: "jwt" } } },

  { method: "post", path: "/api/localspots", options: { ...localspotApi.create, auth: { strategy: "jwt" } } },
  { method: "delete", path: "/api/localspots", options: { ...localspotApi.deleteAll, auth: { strategy: "jwt" } } },
  { method: "get", path: "/api/localspots", options: { ...localspotApi.find, auth: { strategy: "jwt" } } },
  { method: "get", path: "/api/localspots/{id}", options: { ...localspotApi.findOne, auth: { strategy: "jwt" } } },
  { method: "delete", path: "/api/localspots/{id}", options: { ...localspotApi.deleteOne, auth: { strategy: "jwt" } } },
  { method: "post", path: "/api/localspots/{id}/image", options: { ...localspotApi.uploadImage, auth: { strategy: "jwt" }, payload: { multipart: true, output: "stream", parse: true, maxBytes: 10485760 } } },
  { method: "delete", path: "/api/localspots/{id}/image", options: { ...localspotApi.deleteImage, auth: { strategy: "jwt" } } },

  { method: "get", path: "/api/categories", options: { ...categoryApi.find, auth: { strategy: "jwt" } } },
  { method: "get", path: "/api/categories/{id}", options: { ...categoryApi.findOne, auth: { strategy: "jwt" } } },
  { method: "post", path: "/api/categories", options: { ...categoryApi.create, auth: { strategy: "jwt" } } },
  { method: "delete", path: "/api/categories/{id}", options: { ...categoryApi.deleteOne, auth: { strategy: "jwt" } } },
  { method: "delete", path: "/api/categories", options: { ...categoryApi.deleteAll, auth: { strategy: "jwt" } } },

  { method: "post", path: "/api/users/authenticate", options: { ...userApi.authenticate, auth: false } },
];