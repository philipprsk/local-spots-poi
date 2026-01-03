import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const localspotJsonStore = {
  async getAllLocalSpots() {
    await db.read();
    return db.data.localspots;
  },

  async addLocalSpot(localspot) {
    await db.read();
    localspot._id = v4();
    db.data.localspots.push(localspot);
    await db.write();
    return localspot;
  },

  async getLocalSpot(id) {
    await db.read();
    let u = db.data.localspots.find((localspot) => localspot._id === id);
    if (u === undefined) u = null;
    return u;
  },

  async getUserLocalSpots(userid) {
    await db.read();
    let u = db.data.localspots.filter((localspot) => localspot.userid === userid);
    if (u === undefined) u = null;
    return u;
  },

  async deleteLocalSpot(id) {
    await db.read();
    const index = db.data.localspots.findIndex((localspot) => localspot._id === id);
    if (index !== -1) {
    db.data.localspots.splice(index, 1);
    await db.write();
  }
},

  async deleteAllLocalSpots() {
    db.data.localspots = [];
    await db.write();
  },
};
