import Mongoose from "mongoose";
import { LocalSpot as LocalSpotType } from "../../types/localspot-types.js";
const { Schema } = Mongoose;

const localspotSchema = new Schema<LocalSpotType>({
  title: String,
  description: String, 
  latitude: Number,    
  longitude: Number,
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  
  
  images: [{
    url: String,
    publicId: String
  }],
  
  
  img: String, 
  imgPublicId: String,
});

export const Localspot = Mongoose.model<LocalSpotType>("Localspot", localspotSchema);