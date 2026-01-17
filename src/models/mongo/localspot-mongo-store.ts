import Mongoose from "mongoose";
import { Localspot } from "./localspot.js";
import { LocalSpot as LocalSpotType } from "../../types/localspot-types.js";

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
  
  async getLocalSpotsByUserId(id: string): Promise<LocalSpotType[]> {
    if (!id) return [];
    return Localspot.find({ userid: id }).populate("category").lean();
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

  // MULTI-IMAGE HELPER

  
  async addImageToSpot(id: string, imageData: { url: string; publicId: string }): Promise<void> {
    if (!id || !Mongoose.isValidObjectId(id)) return;
    await Localspot.findByIdAndUpdate(
      id,
      { 
        $push: { images: imageData }, // Array Push
        
        $set: { img: imageData.url, imgPublicId: imageData.publicId } 
      }
    );
  },


  async removeImageFromSpot(id: string, publicId: string): Promise<void> {
    if (!id || !Mongoose.isValidObjectId(id)) return;
    await Localspot.findByIdAndUpdate(
      id,
      { $pull: { images: { publicId: publicId } } } // Array Pull via publicId
    );
  }
};