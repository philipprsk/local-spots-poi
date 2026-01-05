import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { UserSpec, UserSpecPlus, IdSpec, UserArray, UserCredentialsSpec, JwtAuthSpec } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { createToken } from "./jwt-utils.js";
 

const requireAdmin = (request) => {
  if (!request.auth?.credentials?.isAdmin) throw Boom.forbidden("Admin only");
};

export const userApi = {
   authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserByEmail(request.payload.email);
        if (!user) {
          return Boom.unauthorized("User not found");
        }
        if (user.password !== request.payload.password) {
          return Boom.unauthorized("Invalid password");
        }
        const token = createToken(user);
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Authenticate a User",
    notes: "Returns a JWT token if credentials are valid",
    validate: { 
      payload: UserCredentialsSpec, 
      failAction: validationError 
    },
    response: { 
      schema: JwtAuthSpec, 
      failAction: validationError 
    },
  },
  
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        requireAdmin(request);
        const users = await db.userStore.getAllUsers();
        return users;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all userApi",
    notes: "Returns details of all userApi",
    response: { schema: UserArray, failAction: validationError },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        requireAdmin(request);
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err) {
        return Boom.serverUnavailable("No User with this id");
      }
    },
    tags: ["api"],
    description: "Get a specific user",
    notes: "Returns user details",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  create: {
    auth: false,
    handler: async function (request, h) {
      try {
        // Der User wird in der Datenbank gespeichert
        const user = await db.userStore.addUser(request.payload);
        if (user) {
          // Es wird nur das User-Objekt (mit id und __v) zurückgegeben
          return h.response(user).code(201);
        }
        return Boom.badImplementation("error creating user");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a User",
    notes: "Returns the newly created user",
    validate: { payload: UserSpec, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },
  
  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        requireAdmin(request);
        await db.userStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all userApi",
    notes: "All userApi removed from Playtime",
  },

  deleteOne: {
    auth: { strategy: "jwt" },
    handler: async (request, h) => {
      requireAdmin(request);
      await db.userStore.deleteUserById(request.params.id);
      return h.response().code(204);
    },
  
  },
};
