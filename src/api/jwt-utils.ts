import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "@hapi/hapi";
import dotenv from "dotenv";
import { db } from "../models/db.js";
import { User } from "../types/localspot-types.js";
;


dotenv.config();


if (!process.env.COOKIE_PASSWORD) {
  throw new Error("FATAL ERROR: COOKIE_PASSWORD is not defined. Check your .env file!");
}


const JWT_SECRET: string = process.env.COOKIE_PASSWORD;



export function createToken(user: User): string {
  const payload = {
    id: user._id, 
    email: user.email,
    isAdmin: user.isAdmin,
    scope: user.isAdmin ? ["admin"] : [] 
  };
  
  const options: jwt.SignOptions = {
    algorithm: "HS256",
    expiresIn: "24h", 
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      scope: decoded.scope,
    } as JwtPayload;
  } catch (e: any) {
    console.error("Token decode failed:", e.message);
  }
  return null;
}

export async function validate(decoded: JwtPayload, request: Request, h: any) {
  console.log("--- JWT Validation Start ---");
  console.log("1. Decoded Token ID:", decoded.id);


  const user = await db.userStore.getUserById(decoded.id); 
  
  if (!user) {
    console.error("2. ERROR: User not found in DB for ID:", decoded.id);
    return { isValid: false };
  }
  
  console.log("2. Success: User found:", user.email);
  console.log("--- JWT Validation End ---");
  
  return { isValid: true, credentials: user };
}


export function getUserIdFromRequest(request: Request): string | null {
  let userId = null;
  try {
    const { authorization } = request.headers;
    if (authorization) {
        const token = authorization.split(" ")[1];
       
        const decodedToken = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        userId = decodedToken.id;
    }
  } catch (e) {
    userId = null;
  }
  return userId;
}