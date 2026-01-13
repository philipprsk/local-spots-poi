import bcrypt from "bcrypt";
import Boom from "@hapi/boom";
import { Request, ResponseToolkit, RouteOptions } from "@hapi/hapi";
import { db } from "../models/db.js";
import { UserSpec, UserSpecPlus, IdSpec, UserArray, UserCredentialsSpec, JwtAuthSpec } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { createToken } from "./jwt-utils.js";


const requireAdmin = (request: Request) => {
  if (!request.auth.credentials.isAdmin) {
    throw Boom.forbidden("Admin only");
  }             
};

export const userApi: { [key: string]: RouteOptions } = {
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

  githubLogin: {
    auth: "github-oauth",
    handler: async function (request: Request, h: ResponseToolkit) {
      if (!request.auth.isAuthenticated) {
        return Boom.unauthorized("Authentication failed: " + request.auth.error.message);
      }

      // Type-Cast zu 'any', um den 'unknown' Fehler zu beheben
      const credentials = request.auth.credentials as any;
      const profile = credentials.profile;

      // GitHub User haben manchmal keine öffentliche E-Mail
      const email = profile.email || `${profile.username}@github.com`;

      try {
        // 1. User suchen oder neu anlegen
        let user = await db.userStore.getUserByEmail(email);
        if (!user) {
          user = await db.userStore.addUser({
            firstName: profile.displayName || profile.username || "GitHub",
            lastName: "User",
            email: email,
            password: "", // Leeres Passwort für OAuth
          });
        }

        // 2. JWT Token für deine App generieren
        const token = createToken(user);

        // 3. Weiterleitung ans Frontend
        // Der Token wird als Query-Parameter angehängt
        return h.redirect(`https://local-spot-poi.netlify.app/dashboard?token=${token}`);
      } catch (err) {
        console.error("GitHub OAuth Error:", err);
        return Boom.serverUnavailable("Database Error during GitHub Login");
      }
    },
    tags: ["api"],
    description: "GitHub Login",
    notes: "Authenticates user via GitHub and redirects to home with JWT",
  },

  googleLogin: {
  auth: "google-oauth",
  handler: async function (request: Request, h: ResponseToolkit) {
    if (!request.auth.isAuthenticated) {
      return Boom.unauthorized("Google authentication failed");
    }

    const credentials = request.auth.credentials as any;
    const profile = credentials.profile;
    
    // Google liefert die E-Mail zuverlässiger als GitHub
    const email = profile.email;

    try {
      let user = await db.userStore.getUserByEmail(email);
      
      if (!user) {
        // Google Profile nutzt oft displayName oder splitte den Namen
        user = await db.userStore.addUser({
          firstName: profile.name?.first || profile.displayName?.split(" ")[0] || "Google",
          lastName: profile.name?.last || profile.displayName?.split(" ")[1] || "User",
          email: email,
          password: "", // Wichtig: User-Model muss password optional haben!
        });
      }

      const token = createToken(user);
      // Zurück zum Frontend
      return h.redirect(`https://local-spot-poi.netlify.app/dashboard?token=${token}`);
    } catch (err) {
      console.error(err);
      return Boom.serverUnavailable("Database error during Google login");
    }
  },
  tags: ["api"],
  description: "Google Login",
},

  find: {
    auth: "jwt",
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        const users = await db.userStore.getAllUsers();
        return users;
      } catch (err: any) {
        if (err.isBoom) throw err;
        console.error("Find users error:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all users",
    notes: "Returns details of all users",
    response: { schema: UserArray, failAction: validationError },
  },

  findOne: {
    auth: "jwt",
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err: any) {
        if (err.isBoom) throw err;
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
    auth: false, // WICHTIG: Kein extra "options" Objekt hier drin!
    handler: async (request: Request, h: ResponseToolkit) => {
      console.log(`--- API CALL: Create User for ${(request.payload as any).email} ---`);
      try {
        const user = await db.userStore.addUser(request.payload);
        return h.response(user).code(201);
      } catch (err: any) {
        console.log(`--- DB ERROR: ${err.message} ---`);
        if (err.message.includes("already exists") || err.code === 11000) {
          return Boom.conflict("User with this email already exists");
        }
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
    auth: "jwt",
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        await db.userStore.deleteAll();
        return h.response().code(204);
      } catch (err: any) {
        if (err.isBoom) throw err;
        console.error("Delete all error:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all users",
    notes: "All users removed",
  },

  deleteOne: {
    auth: "jwt",
    handler: async (request: Request, h: ResponseToolkit) => {
      try {
        requireAdmin(request);
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        await db.userStore.deleteUserById(user._id);
        return h.response().code(204);
      } catch (err: any) {
        if (err.isBoom) throw err;
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