import Mongoose from "mongoose";
import { Localspot } from "./localspot";
import { LocalSpot as LocalSpotType } from "../../types/models";

export const localspotMongoStore = {
  async getAllLocalSpots(): Promise<LocalSpotType[]> {
    return Localspot.find().lean();
  },

  async addLocalSpot(localspot: Partial<LocalSpotType>): Promise<LocalSpotType | null> {
    const newSpot = new Localspot(localspot);
    const saved = await newSpot.save();
    return this.getLocalSpotById(saved._id);
  },

  async getLocalSpot(id: string): Promise<LocalSpotType | null> {
    if (!id || !Mongoose.isValidObjectId(id)) return null;
    return Localspot.findById(id).populate("category").lean();
  },

  async getLocalSpotById(id: string): Promise<LocalSpotType | null> {
    if (!id || !Mongoose.isValidObjectId(id)) return null;
    return Localspot.findById(id).populate("category").lean();
  },

  async getUserLocalSpots(id: string): Promise<LocalSpotType[]> {
    return Localspot.find({ userid: id }).populate("category").lean();
  },

  async updateLocalSpot(id: string, update: Partial<LocalSpotType>): Promise<LocalSpotType | null> {
    return Localspot.findByIdAndUpdate(id, update, { new: true }).lean();
  },

  async deleteLocalSpot(id: string): Promise<void> {
    if (!id || !Mongoose.isValidObjectId(id)) return;
    await Localspot.deleteOne({ _id: id });
  },

  async deleteLocalSpotById(id: string): Promise<void> {
    return this.deleteLocalSpot(id);
  },

  async deleteAllLocalSpots(): Promise<void> {
    await Localspot.deleteMany({});
  },
};