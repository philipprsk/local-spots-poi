import { Category } from "./category.js";

export const categoryMongoStore = {
  async getAllCategories() {
    return Category.find().lean();
  },

  async getCategoryById(id) {
    return Category.findById(id).lean();
  },

  async getCategoryBySlug(slug) {
    return Category.findOne({ slug }).lean();
  },

  async addCategory(category) {
    const newCategory = new Category(category);
    const savedCategory = await newCategory.save();
    // Convert to lean object for consistency
    return savedCategory.toObject ? savedCategory.toObject() : savedCategory;
  },

  async updateCategory(id, category) {
    return Category.findByIdAndUpdate(id, category, { new: true }).lean();
  },

  async deleteCategoryById(id) {
    return Category.findByIdAndDelete(id);
  },

  async deleteAll() {
    return Category.deleteMany({});
  },
};