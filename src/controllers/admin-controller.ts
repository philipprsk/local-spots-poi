import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db";
import { User } from "../types/localspot-types";

export const adminController = {
  index: {
    auth: {
      strategy: "session",
      mode: "required",
    },
    handler: async (request: Request, h: ResponseToolkit) => {
      const loggedInUser = request.auth.credentials;
      console.log("=== ADMIN VIEW ===");
      console.log("User:", loggedInUser);
      console.log("isAdmin:", loggedInUser.isAdmin);

      if (!loggedInUser.isAdmin) {
        return h.view("admin-dashboard", { 
          title: "Admin Dashboard",
          user: loggedInUser,
          isAdmin: false 
        });
      }
      const users = await db.userStore.getAllUsers();
      return h.view("admin-dashboard", { 
        title: "Admin Dashboard",
        user: loggedInUser,
        isAdmin: true,
        users: users,
      });
    },
  },

  deleteUser: {
    auth: {
      strategy: "session",
      mode: "required",
    },
    handler: async (request: Request, h: ResponseToolkit) => {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser.isAdmin) {
        return h.redirect("/");
      }
      const userId = request.params.id;
      await db.userStore.deleteUserById(userId);
      return h.redirect("/admin");
    },
  },
};