import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { aboutController } from "./controllers/about-controller.js";    
import { localspotController } from "./controllers/localspot-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },

  { method: "GET", path: "/dashboard", config: dashboardController.index },            // redirect
  { method: "GET", path: "/dashboard/localspots", config: localspotController.index },
  { method: "POST", path: "/dashboard/addlocalspot", config: localspotController.addLocalSpot },
  { method: "GET", path: "/dashboard/deletelocalspot/{id}", config: localspotController.deleteLocalSpot },

  { method: "GET", path: "/about", config: aboutController.index },
  { method: "POST", path: "/localspot/{id}/uploadimage", config: localspotController.uploadImage },

  { method: "GET", path: "/{param*}", handler: { directory: { path: "./public" } }, options: { auth: false } },

  { method: "POST", path: "/localspot/{id}/deleteimage", config: localspotController.deleteImage },
];