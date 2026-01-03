import { v4 } from "uuid";

let localspots = [];

export const localspotMemStore = {
  async getAllLocalSpots() {
    return localspots;
  },

  async addLocalSpot(localspot) {
    localspot._id = v4();
    localspots.push(localspot);
    return localspot;
  },

  async getLocalSpot(id) {
    return localspots.find((localspot) => localspot._id === id);
  },

  async deleteLocalSpot(id) {
    const index = localspots.findIndex((localspot) => localspot._id === id);
    localspots.splice(index, 1);
  },

  async deleteAllLocalSpots() {
    localspots  = [];
  },

  async getUserLocalSpots(userid) {
    return localspots.filter((localspot) => localspot.userid === userid);
  }
};
