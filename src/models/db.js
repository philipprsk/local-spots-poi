import { userMemStore } from "./mem/user-mem-store.js";
import { localspotMemStore } from "./mem/localspot-mem-store.js";
import { userJsonStore } from "./json/user-json-store.js"; 
import { localspotJsonStore } from "./json/localspot-json-store.js";
import { connectMongo } from "./mongo/connect.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";
import { localspotMongoStore } from "./mongo/localspot-mongo-store.js";


export const db = {
  userStore: null,
  localspotStore: null,

  init(storeType) {
    switch (storeType) {
      case "json":
        this.userStore = userJsonStore;
        this.localspotStore = localspotJsonStore;
        break;
      case "mongo":
        this.userStore = userMongoStore;
        this.localspotStore = localspotMongoStore;
        connectMongo();
        break;
      case "mem":
        this.userStore = userMemStore;
        this.localspotStore = localspotMemStore;
        break;
      default:
        throw new Error(`Invalid store type: ${storeType}`);
    }
  },
};