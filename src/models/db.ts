import { connectMongo } from "./mongo/connect.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";
import { localspotMongoStore } from "./mongo/localspot-mongo-store.js";
import { categoryMongoStore } from "./mongo/category-mongo-store.js";
import { Db } from "../types/localspot-types.js";

export const db: Db = {
  userStore: userMongoStore,
  localspotStore: localspotMongoStore,
  categoryStore: categoryMongoStore,
};

connectMongo();