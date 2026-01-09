import { accountsController } from "./controllers/accounts-controller";
import { dashboardController } from "./controllers/dashboard-controller";
import { aboutController } from "./controllers/about-controller";
import { localspotController } from "./controllers/localspot-controller";
import { adminController } from "./controllers/admin-controller";
import { ServerRoute } from "@hapi/hapi";

// Optional: Interface importieren, falls verwendet
// import { WebRoute } from "./types/web-route";

export const webRoutes: ServerRoute[] = [
  { method: "get", path: "/", options: accountsController.index },
  { method: "get", path: "/signup", options: accountsController.showSignup },
  { method: "get", path: "/login", options: accountsController.showLogin },
  { method: "get", path: "/logout", options: accountsController.logout },
  { method: "post", path: "/register", options: accountsController.signup },
  { method: "post", path: "/authenticate", options: accountsController.login },

  { method: "get", path: "/dashboard", options: dashboardController.index },
  { method: "get", path: "/dashboard/localspots", options: localspotController.index },
  { method: "post", path: "/dashboard/addlocalspot", options: localspotController.addLocalSpot },
  { method: "get", path: "/dashboard/deletelocalspot/{id}", options: localspotController.deleteLocalSpot },

  { method: "get", path: "/about", options: aboutController.index },
  { method: "post", path: "/localspot/{id}/uploadimage", options: localspotController.uploadImage },

  { method: "get", path: "/{param*}", handler: { directory: { path: "./public" } }, options: { auth: false } },

  { method: "post", path: "/localspot/{id}/deleteimage", options: localspotController.deleteImage },

  { method: "get", path: "/admin", options: adminController.index },
  { method: "post", path: "/admin/users/{id}/delete", options: adminController.deleteUser },
];