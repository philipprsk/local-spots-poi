import Mongoose from "mongoose";

const { Schema } = Mongoose;

const localspotSchema = new Schema({
  title: String,
  description: String, 
  latitude: Number,    
  longitude: Number,

  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  img: String,
  imgPublicId: String,
});

export const Localspot = Mongoose.model("Localspot", localspotSchema);