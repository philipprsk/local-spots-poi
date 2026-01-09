import { assert } from "chai";
import { EventEmitter } from "events";
import { db } from "../../src/models/db";
import { assertSubset } from "../test-utils.test";

const testCategory = {
  name: "Restaurant",
  slug: "restaurant",
  icon: "🍽️",
  color: "#FF5733",
};

EventEmitter.setMaxListeners(25);

describe("Category Model tests", () => {
  beforeEach(async () => {
    await db.categoryStore.deleteAll();
  });

  it("create a category", async () => {
    const newCategory = await db.categoryStore.addCategory(testCategory);
    assertSubset(testCategory, newCategory);
    assert.isDefined(newCategory._id);
  });

  it("get all categories", async () => {
    await db.categoryStore.addCategory(testCategory);
    await db.categoryStore.addCategory({ ...testCategory, name: "Cafe", slug: "cafe" });
    const categories = await db.categoryStore.getAllCategories();
    assert.equal(categories.length, 2);
  });

  it("get category by id", async () => {
    const created = await db.categoryStore.addCategory(testCategory);
    const retrieved = await db.categoryStore.getCategoryById(created._id);
    assertSubset(testCategory, retrieved);
  });

  it("delete category", async () => {
    const created = await db.categoryStore.addCategory(testCategory);
    await db.categoryStore.deleteCategoryById(created._id);
    const categories = await db.categoryStore.getAllCategories();
    assert.equal(categories.length, 0);
  });

  it("delete all categories", async () => {
    await db.categoryStore.addCategory(testCategory);
    await db.categoryStore.addCategory({ ...testCategory, name: "Cafe", slug: "cafe" });
    await db.categoryStore.deleteAll();
    const categories = await db.categoryStore.getAllCategories();
    assert.equal(categories.length, 0);
  });

  it("get category by slug", async () => {
    const created = await db.categoryStore.addCategory(testCategory);
    const retrieved = await db.categoryStore.getCategoryBySlug(testCategory.slug);
    assertSubset(testCategory, retrieved);
  });

  it("update category", async () => {
    const created = await db.categoryStore.addCategory(testCategory);
    const updated = await db.categoryStore.updateCategory(created._id, {
      name: "Fine Dining",
      color: "#000000",
    });
    assert.equal(updated.name, "Fine Dining");
    assert.equal(updated.color, "#000000");
  });
});