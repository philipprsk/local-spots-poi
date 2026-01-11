import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Inert from "@hapi/inert";
import Cookie from "@hapi/cookie";
import HapiSwagger from "hapi-swagger";
import * as jwt from "hapi-auth-jwt2";
import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Joi from "joi";
import { apiRoutes } from "./api-routes";
import { webRoutes } from "./web-routes";
import { validate as jwtValidate } from "./api/jwt-utils";
import { db } from "./models/db";
import { validate as accountsValidate } from "./controllers/accounts-controller";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

// Safety Check: Ensure the secret is loaded before starting
if (!process.env.cookie_password) {
  throw new Error("FATAL ERROR: process.env.cookie_password is not defined.");
}

async function init() {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    routes: {
      payload: {
        maxBytes: 10 * 1024 * 1024,
        multipart: true,
      },
      timeout: {
        server: 60000,
        socket: 60000,
      },
      cors: {
        origin: ["http://localhost:5173"], 
        credentials: true,
        additionalHeaders: ["cache-control", "x-requested-with"]
      }
    },
  });

  await server.register(Cookie);
  await server.register(jwt);
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

  server.views({
    engines: { hbs: Handlebars },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  // Session Strategy (Cookie based)
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name,
      password: process.env.cookie_password, // matches .env
      isSecure: false,
    },
    redirectTo: false,
    validate: accountsValidate,
  });

  server.validator(Joi);

  // JWT Strategy (Token based)
  server.auth.strategy("jwt", "jwt", {
    // FIX: Changed from COOKIE_PASSWORD to cookie_password to match env and utils
    key: process.env.cookie_password, 
    validate: jwtValidate,
    verifyOptions: { algorithms: ["HS256"] }
  });

  server.auth.default({
    strategies: ["session", "jwt"]
  });

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
    options: { auth: false }
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