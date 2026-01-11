import { connectMongo } from "./mongo/connect";
import { userMongoStore } from "./mongo/user-mongo-store";
import { localspotMongoStore } from "./mongo/localspot-mongo-store";
import { categoryMongoStore } from "./mongo/category-mongo-store";
import { Db } from "../types/localspot-types";

export const db: Db = {
  userStore: userMongoStore,
  localspotStore: localspotMongoStore,
  categoryStore: categoryMongoStore,
};

connectMongo();