import Mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./user";
import { User as UserType } from "../../types/models";

export const userMongoStore = {
  async getAllUsers(): Promise<UserType[]> {
    return User.find().lean();
  },

  async getUserById(id: string): Promise<UserType | null> {
    if (id && Mongoose.isValidObjectId(id)) {
      return User.findOne({ _id: id }).lean();
    }
    return null;
  },

  async addUser(userData: Partial<UserType>): Promise<UserType> {
    try {
      const user = { ...userData };
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      const newUser = new User(user);
      const userObj = await newUser.save();
      return userObj.toObject();
    } catch (error: any) {
      console.error("Error adding user:", error.message);
      throw error;
    }
  },

  async getUserByEmail(email: string): Promise<UserType | null> {
    if (!email) return null;
    return User.findOne({ email: email }).lean();
  },

  async deleteUserById(id: string): Promise<void> {
    try {
      if (id && Mongoose.isValidObjectId(id)) {
        await User.deleteOne({ _id: id });
      }
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll(): Promise<void> {
    await User.deleteMany({});
  }
};