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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    },
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
      name: process.env.COOKIE_NAME || "localspots-cookie",
      password: process.env.COOKIE_PASSWORD || "secret-password-longer-than-32-chars",
      isSecure: false,
    },
    redirectTo: "/",
    validate: accountsValidate,
  });
  server.auth.default("session");

  server.validator(Joi);

  server.auth.strategy("jwt", "jwt", {
    key: process.env.COOKIE_PASSWORD || "secret-password-longer-than-32-chars",
    validate: jwtValidate,
    verifyOptions: { algorithms: ["HS256"] }
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