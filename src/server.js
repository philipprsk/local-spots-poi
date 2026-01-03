import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Inert from "@hapi/inert";
import Cookie from "@hapi/cookie";
import HapiSwagger from "hapi-swagger";
import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Joi from "joi";
import { apiRoutes } from "./api-routes.js";
import { webRoutes } from "./web-routes.js";
import { db } from "./models/db.js"; 
import { accountsController } from "./controllers/accounts-controller.js";

const swaggerOptions = {
  info: {
    title: "Localspot API",
    version: "0.1",
  },
};

const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });
  
  await server.register(Cookie);
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
]);


  server.views({
    engines: {
      hbs: Handlebars,
    },
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
    redirectTo: "/",
    validate: accountsController.validate,
  });
  server.auth.default("session");

  server.validator(Joi);

  db.init("mongo");

  server.route({
      method: "GET",
      path: "/public/{param*}", // Serve static files from /public
      handler: {
        directory: {
          path: path.join(__dirname, "../public"), // Adjusted to point to the public directory
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
