import bcrypt from "bcrypt";
import Boom from "@hapi/boom";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db";
import { UserSpec, UserSpecPlus, IdSpec, UserArray, UserCredentialsSpec, JwtAuthSpec } from "../models/joi-schemas";
import { validationError } from "./logger";
import { createToken } from "./jwt-utils";
import { User } from "../types/models";

const requireAdmin = (request: Request) => {
  if (!request.auth?.credentials?.isAdmin) throw Boom.forbidden("Admin only");
};

export const userApi = {
  authenticate: {
    auth: false,
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const credentials = request.payload as { email: string; password: string };
        const user = await db.userStore.getUserByEmail(credentials.email);
        if (!user) {
          return Boom.unauthorized("User not found");
        }
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          return Boom.unauthorized("Invalid password");
        }
        const token = createToken(user);
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        console.error("Authentication error:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Authenticate a User",
    notes: "Returns a JWT token if credentials are valid",
    validate: { payload: UserCredentialsSpec, failAction: validationError },
    response: { schema: JwtAuthSpec, failAction: validationError },
  },

  find: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        const users = await db.userStore.getAllUsers();
        return users;
      } catch (err) {
        console.error("Find users error:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all userApi",
    notes: "Returns details of all userApi",
    response: { schema: UserArray, failAction: validationError },
  },

  findOne: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err) {
        console.error("Find one user error:", err);
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
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const user = await db.userStore.addUser(request.payload);
        if (user) {
          return h.response(user).code(201);
        }
        return Boom.badImplementation("error creating user");
      } catch (err) {
        console.error("User creation error:", err);
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
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        await db.userStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        console.error("Delete all error:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all userApi",
    notes: "All userApi removed from Playtime",
  },

  deleteOne: {
    auth: { strategy: "jwt" },
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        if (!request.auth.credentials.isAdmin) {
          return Boom.unauthorized("Admin access required");
        }
        await db.userStore.deleteUserById(user._id);
        return h.response().code(204);
      } catch (err) {
        console.error("Delete one error:", err);
        return Boom.serverUnavailable("No User with this id");
      }
    },
    tags: ["api"],
    description: "Delete a user (Admin only)",
    notes: "Deletes a user by ID",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },
};