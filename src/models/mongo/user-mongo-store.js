import Mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./user.js";

export const userMongoStore = {
  async getAllUsers() {
    const users = await User.find().lean();
    return users;
  },

  async getUserById(id) {
    if (id && Mongoose.isValidObjectId(id)) {
      const user = await User.findOne({ _id: id }).lean();
      return user;
    }
    return null;
  },

  async addUser(userData) {
    try {
      // Create a copy to avoid modifying the original object
      const user = { ...userData };
      // Always hash the password before storing
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      const newUser = new User(user);
      const userObj = await newUser.save();
      // Return lean object
      return userObj.toObject();
    } catch (error) {
      console.error("Error adding user:", error.message);
      throw error;
    }
  },

  async getUserByEmail(email) {
    if (!email) return null;
    const user = await User.findOne({ email: email }).lean();
    return user;
  },

  async deleteUserById(id) {
    try {
      if (id && Mongoose.isValidObjectId(id)) {
        await User.deleteOne({ _id: id });
      }
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll() {
    await User.deleteMany({});
  }
};