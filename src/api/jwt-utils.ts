import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../models/db";
import { User } from "../types/models";

dotenv.config();

const secret = process.env.COOKIE_PASSWORD || "secret-password-longer-than-32-chars";

export function createToken(user: User): string {
  const payload = {
    id: user._id,
    email: user.email,
    isAdmin: user.isAdmin,
  };
  const options = {
    algorithm: "HS256" as const,
    expiresIn: 3600,
  };
  return jwt.sign(payload, secret, options);
}

export function decodeToken(token: string): any | null {
  try {
    return jwt.verify(token, secret);
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
}

export async function validate(decoded: any, request: any) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  }
  return { isValid: true, credentials: user };
}