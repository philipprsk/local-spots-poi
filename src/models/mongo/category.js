import Mongoose from "mongoose";

const { Schema } = Mongoose;

const categorySchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },
  slug: { 
    type: String, 
    required: true,
    unique: true 
  },
  description: String,
  icon: String, // URL or icon name
  image: String, // Category image URL
  color: { 
    type: String, 
    default: "#6B7280"
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

export const Category = Mongoose.model("Category", categorySchema);