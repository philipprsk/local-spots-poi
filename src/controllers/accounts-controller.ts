import bcrypt from "bcrypt";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db";
import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas";
import { User } from "../types/models";

export const accountsController = {
  index: {
    auth: false,
    handler: (request: Request, h: ResponseToolkit) => {
      return h.view("main", { title: "Welcome to Local Spots" });
    },
  },
  showSignup: {
    auth: false,
    handler: (request: Request, h: ResponseToolkit) => {
      return h.view("signup-view", { title: "Sign up for Local Spots" });
    },
  },
  signup: {
    auth: false,
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: (request: Request, h: ResponseToolkit, error: any) => {
        return h.view("signup-view", { title: "Sign up error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async (request: Request, h: ResponseToolkit) => {
      const user = request.payload as User;
      const existingUser = await db.userStore.getUserByEmail(user.email);
      if (existingUser) {
        const errors = [{ message: "Email already registered. Please login or use a different email." }];
        return h.view("signup-view", { title: "Sign up error", errors: errors }).takeover().code(400);
      }
      await db.userStore.addUser(user);
      return h.redirect("/");
    },
  },
  showLogin: {
    auth: false,
    handler: (request: Request, h: ResponseToolkit) => {
      return h.view("login-view", { title: "Login to Local Spots" });
    },
  },
  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      failAction: (request: Request, h: ResponseToolkit, error: any) => {
        return h.view("login-view", { title: "Login error", errors: error.details }).takeover().code(400);
      }
    },
    handler: async (request: Request, h: ResponseToolkit) => {
      const { email, password } = request.payload as { email: string; password: string };
      const user = await db.userStore.getUserByEmail(email);
      console.log("=== LOGIN ===");
      console.log("User found:", user?.email, "isAdmin:", user?.isAdmin);
      if (!user) {
        return h.redirect("/");
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return h.redirect("/");
      }
      request.cookieAuth.set({ id: user._id });
      return h.redirect("/dashboard");
    },
  },
  logout: {
    handler: (request: Request, h: ResponseToolkit) => {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },
};

export async function validate(request: Request, session: { id: string }) {
  const user = await db.userStore.getUserById(session.id);
  console.log("=== VALIDATE ===");
  console.log("Session ID:", session.id);
  console.log("User found:", user?.email, "isAdmin:", user?.isAdmin);
  if (!user) {
    return { isValid: false };
  }
  return { isValid: true, credentials: user };
}