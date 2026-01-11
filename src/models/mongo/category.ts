import Mongoose, { Document, Types } from "mongoose";
import { Category as CategoryType } from "../../types/localspot-types";

export interface CategoryDocument extends Omit<CategoryType, "_id">, Document {
  _id: Types.ObjectId;
}

const { Schema } = Mongoose;

const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  icon: String,
  image: String,
  color: { type: String, default: "#6B7280" },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Category = Mongoose.model<CategoryDocument>("Category", categorySchema);