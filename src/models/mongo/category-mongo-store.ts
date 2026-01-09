import { Category } from "./category";
import { Category as CategoryType } from "../../types/models"; // Importiere den Typ

export const categoryMongoStore = {
  async getAllCategories(): Promise<CategoryType[]> {
  const docs = await Category.find().lean();
  return docs.map((doc: any) => ({
    ...doc,
    _id: doc._id.toString(),
  }));
},

async getCategoryById(id: string): Promise<CategoryType | null> {
  const doc = await Category.findById(id).lean();
  return doc ? { ...doc, _id: doc._id.toString() } : null;
},

async getCategoryBySlug(slug: string): Promise<CategoryType | null> {
  const doc = await Category.findOne({ slug }).lean();
  return doc ? { ...doc, _id: doc._id.toString() } : null;
},

async addCategory(category: Partial<CategoryType>): Promise<CategoryType> {
  const newCategory = new Category(category);
  const savedCategory = await newCategory.save();
  const obj = savedCategory.toObject ? savedCategory.toObject() : savedCategory;
  return { ...obj, _id: obj._id.toString() };
},

async updateCategory(id: string, category: Partial<CategoryType>): Promise<CategoryType | null> {
  const doc = await Category.findByIdAndUpdate(id, category, { new: true }).lean();
  return doc ? { ...doc, _id: doc._id.toString() } : null;
},

  async deleteCategoryById(id: string): Promise<any> {
    return Category.findByIdAndDelete(id);
  },

  async deleteAll(): Promise<any> {
    return Category.deleteMany({});
  },
};