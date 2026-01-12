import Mongoose from "mongoose";
import { User as UserType } from "../../types/localspot-types";
import bcrypt from "bcrypt";

const { Schema } = Mongoose;

const userSchema = new Schema<UserType>({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: false },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export const User = Mongoose.model<UserType>("User", userSchema);