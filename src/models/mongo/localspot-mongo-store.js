import Mongoose from "mongoose";
import { Localspot } from "./localspot.js";

export const localspotMongoStore = {
  async getAllLocalSpots() {
    return Localspot.find().lean();
  },

async addLocalSpot(localspot) {
   const newSpot = new Localspot(localspot);
   const saved = await newSpot.save();
  return this.getLocalSpotById(saved._id);
},

 
async getLocalSpot(id) {
  if (!id || !Mongoose.isValidObjectId(id)) return null;
  return Localspot.findById(id).populate("category").lean();
},

async getLocalSpotById(id) {
  if (!id || !Mongoose.isValidObjectId(id)) return null;
  return Localspot.findById(id).populate("category").lean();
},

async getUserLocalSpots(id) {
    return Localspot.find({ userid: id }).populate("category").lean();
  },

  async updateLocalSpot(id, update) {
    return Localspot.findByIdAndUpdate(id, update, { new: true }).lean();
  },

  async deleteLocalSpot(id) {
  if (!id || !Mongoose.isValidObjectId(id)) return;
  await Localspot.deleteOne({ _id: id });
},

  async deleteLocalSpotById(id) {
    return this.deleteLocalSpot(id);
  },

  async deleteAllLocalSpots() {
    await Localspot.deleteMany({});
  },
};