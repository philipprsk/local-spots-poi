import Mongoose from "mongoose";
import { Localspot } from "./localspot.js";

export const localspotMongoStore = {
  async getAllLocalSpots() {
    return Localspot.find().lean();
  },

  async getLocalSpot(id) {
    if (Mongoose.isValidObjectId(id)) {
      return Localspot.findOne({ _id: id }).lean();
    }
    return null;
  },

  async getLocalSpotById(id) {
    return this.getLocalSpot(id);
  },

  async addLocalSpot(localspot) {
    const newLocalspot = new Localspot(localspot);
    const localspotObj = await newLocalspot.save();
    return this.getLocalSpot(localspotObj._id);
  },

  async getUserLocalSpots(id) {
    return Localspot.find({ userid: id }).lean();
  },

  async updateLocalSpot(id, update) {
    return Localspot.findByIdAndUpdate(id, update, { new: true }).lean();
  },

  async deleteLocalSpot(id) {
    try {
      await Localspot.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteLocalSpotById(id) {
    return this.deleteLocalSpot(id);
  },

  async deleteAllLocalSpots() {
    await Localspot.deleteMany({});
  },
};