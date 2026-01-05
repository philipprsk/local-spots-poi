import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Inert from "@hapi/inert";
import Cookie from "@hapi/cookie";
import HapiSwagger from "hapi-swagger";
import jwt from "hapi-auth-jwt2";
import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Joi from "joi";
import { apiRoutes } from "./api-routes.js";
import { webRoutes } from "./web-routes.js";
import { validate } from "./api/jwt-utils.js";
import { db } from "./models/db.js"; 
import { accountsController } from "./controllers/accounts-controller.js";

// --- FIX 1: Load dotenv ONLY if the file exists (Local) ---
dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  // --- FIX 2: Dynamic Port and Host for Render ---
  const server = Hapi.server({
    port: process.env.PORT || 3000,     // Render provides the PORT env variable
    host: "0.0.0.0",                   // MUST be 0.0.0.0 on Render to be accessible
    routes: { cors: true }             // Good practice for APIs
  });
  
  await server.register(Cookie);
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: { title: "Localspot API", version: "0.1" },
        securityDefinitions: { jwt: { type: "apiKey", name: "Authorization", in: "header" } },
        security: [{ jwt: [] }]
      },
    },
  ]);
  await server.register(jwt);

  server.views({
    engines: { hbs: Handlebars },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.COOKIE_NAME || "localspots-cookie", // Fallback if env missing
      password: process.env.COOKIE_PASSWORD || "secret-password-longer-than-32-chars",
      isSecure: false, // Set to true if using HTTPS (Render provides HTTPS)
    },
    redirectTo: "/",
    validate: accountsController.validate,
  });
  server.auth.default("session");

  server.validator(Joi);

  server.auth.strategy("jwt", "jwt", {
    key: process.env.COOKIE_PASSWORD || "secret-password-longer-than-32-chars",
    validate: validate,
    verifyOptions: { algorithms: ["HS256"] }
  });

  db.init("mongo");

  server.route({
      method: "GET",
      path: "/public/{param*}",
      handler: {
        directory: {
          path: path.join(__dirname, "../public"),
          redirectToSlash: true,
          index: true,
        },
      },
      config: { auth: false } 
  });

  server.route(webRoutes);
  server.route(apiRoutes);

  await server.start();
  console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();