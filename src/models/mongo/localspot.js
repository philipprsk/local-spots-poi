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
});

export const Localspot = Mongoose.model("Localspot", localspotSchema);