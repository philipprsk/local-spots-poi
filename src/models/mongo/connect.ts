import * as dotenv from "dotenv";
import Mongoose from "mongoose";
import * as mongooseSeeder from "mais-mongoose-seeder";
import { seedData } from "./seed-data";
import { categoryMongoStore } from "./category-mongo-store";
import { userMongoStore } from "./user-mongo-store";
import { localspotMongoStore } from "./localspot-mongo-store";

async function seed(mongoose: typeof Mongoose) {
  try {
    await categoryMongoStore.getAllCategories();
    await userMongoStore.getAllUsers();
    await localspotMongoStore.getAllLocalSpots();

    const seedLib = mongooseSeeder.default;
    const seeder = seedLib(mongoose);
    const dbData = await seeder.seed(seedData, { dropDatabase: false, dropCollections: true });
    console.log("Seeding completed:", dbData);
  } catch (err) {
    console.log("Seeding error:", err);
  }
}

export function connectMongo() {
  dotenv.config({ path: ".env" });

  Mongoose.set("strictQuery", true);
  Mongoose.connect(process.env.db as string);
  const db = Mongoose.connection;

  db.on("error", (err) => {
    console.log(`database connection error: ${err}`);
  });

  db.on("disconnected", () => {
    console.log("database disconnected");
  });

  db.once("open", function (this: typeof db) {
    console.log(`database connected to ${this.name} on ${this.host}`);
    seed(Mongoose); 
  });
}