// @ts-ignore
/// <reference types="@hapi/bell" />
// @ts-ignore
/// <reference types="@hapi/cookie" />

import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Inert from "@hapi/inert";
import Cookie from "@hapi/cookie";
import HapiSwagger from "hapi-swagger";
import Bell from "@hapi/bell";
import * as jwt from "hapi-auth-jwt2";
import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Joi from "joi";
import { apiRoutes } from "./api-routes.js";
import { webRoutes } from "./web-routes.js";
import { validate as jwtValidate } from "./api/jwt-utils.js";
import { db } from "./models/db.js";
import { validate as accountsValidate } from "./controllers/accounts-controller.js";




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Safety Check: Ensure the secret is loaded before starting
if (!process.env.COOKIE_PASSWORD) {
  throw new Error("FATAL ERROR: process.env.COOKIE_PASSWORD is not defined.");
}

// Move server declaration outside of init
export const server = Hapi.server({
  port: process.env.port || 3000,
  host: "0.0.0.0",
  routes: {
    timeout: { server: 60000, socket: 60000 },
    cors: {
      origin: ["http://localhost:5173"], 
      credentials: true,
      additionalHeaders: ["cache-control", "x-requested-with"]
    }
  },
});

async function init() {
  await server.register(Cookie);
  await server.register(jwt);
  await server.register([
    Inert, Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: { title: "Localspot API", version: "0.1" },
        securityDefinitions: { jwt: { type: "apiKey", name: "Authorization", in: "header" } },
        security: [{ jwt: [] }]
      },
    },
  ]);

  await server.register(Bell);

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
      name: process.env.COOKIE_NAME,
      password: process.env.COOKIE_PASSWORD,
      isSecure: false,
    },
    redirectTo: false,
    validate: accountsValidate,
  });

  server.validator(Joi);

  server.auth.strategy("jwt", "jwt", {
    key: process.env.COOKIE_PASSWORD, 
    validate: jwtValidate,
    verifyOptions: { algorithms: ["HS256"] }
  });

  
  server.auth.strategy("github-oauth", "bell", {
  provider: "github",
  password: process.env.COOKIE_PASSWORD, // Verschlüsselung für das OAuth-Cookie
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  isSecure: process.env.NODE_ENV === "production", // Nur in Produktion auf true setzen
  location: process.env.URL || `http://localhost:${process.env.PORT || 3000}`
});


server.auth.strategy("google-oauth", "bell", {
  provider: "google",
  password: process.env.COOKIE_PASSWORD,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  isSecure: process.env.NODE_ENV === "production",
  location: process.env.URL || `http://localhost:${process.env.PORT || 3000}`
});


  server.auth.default({ strategies: ["session", "jwt"] });

  server.route({
    method: "GET",
    path: "/public/{param*}",
    handler: { directory: { path: path.join(__dirname, "../public"), redirectToSlash: true, index: true } },
    options: { auth: false }
  });

  server.route({
    method: "GET",
    path: "/public/{param*}",
    handler: { directory: { path: path.join(__dirname, "../public"), redirectToSlash: true, index: true } },
    options: { auth: false }
  });

  server.route(webRoutes);
  server.route(apiRoutes);

  // Initialize the server (prepares it but doesn't open the port yet)
  await server.initialize();

  // ONLY start the server if this file is run directly (not by Mocha)
  if (import.meta.url === `file://${process.argv[1]}`) {
    await server.start();
    console.log("Server running on %s", server.info.uri);
  }
}

// Global Rejection Handler
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

// Run the setup
init();