import Mongoose from "mongoose";
import { Localspot } from "./localspot.js";


export const localspotMongoStore = {
  async getAllLocalSpots() {
    const localspots = await Localspot.find().lean();
    return localspots;
  },

  async getLocalSpot(id) {
    if (Mongoose.isValidObjectId(id)) {
      const localspot = await Localspot.findOne({ _id: id }).lean();
      return localspot;
    }
    return null;
  },

  async addLocalSpot(localspot) {
  const newLocalspot = new Localspot(localspot);
  const localspotObj = await newLocalspot.save();
  return this.getLocalSpot(localspotObj._id);
},

async getUserLocalSpots(id) {
  const localspot = await Localspot.find({ userid: id }).lean();
  return localspot;
},

  async deleteLocalSpot(id) {
    try {
      await Localspot.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAllLocalSpots() {
    await Localspot.deleteMany({});
  }
};
