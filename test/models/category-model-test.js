import { assert } from "chai";
import { EventEmitter } from "events";
import { db } from "../../src/models/db.js";
import { assertSubset } from "../test-utils.js";

const testCategory = {
  name: "Restaurant",
  slug: "restaurant",
  icon: "🍽️",
  color: "#FF5733",
};

suite("Category Model tests", () => {
  EventEmitter.setMaxListeners(25);

  suiteSetup(async () => {
    await db.init("mongo");
  });

  setup(async () => {
    await db.categoryStore.deleteAll();
  });

  test("create a category", async () => {
    try {
    const newCategory = await db.categoryStore.addCategory(testCategory);
    assertSubset(testCategory, newCategory);
    assert.isDefined(newCategory._id);
    } catch (err) {
  console.error("Category create error:", err);
  
  assert.fail(err.message);
  }
});

  test("get all categories", async () => {
    await db.categoryStore.addCategory(testCategory);
    await db.categoryStore.addCategory({ ...testCategory, name: "Cafe", slug: "cafe" });
    const categories = await db.categoryStore.getAllCategories();
    assert.equal(categories.length, 2);
  });

  test("get category by id", async () => {
    const created = await db.categoryStore.addCategory(testCategory);
    const retrieved = await db.categoryStore.getCategoryById(created._id);
    assertSubset(testCategory, retrieved);
  });

  test("delete category", async () => {
    const created = await db.categoryStore.addCategory(testCategory);
    await db.categoryStore.deleteCategoryById(created._id);
    const categories = await db.categoryStore.getAllCategories();
    assert.equal(categories.length, 0);
  });

  test("delete all categories", async () => {
    await db.categoryStore.addCategory(testCategory);
    await db.categoryStore.addCategory({ ...testCategory, name: "Cafe", slug: "cafe" });
    await db.categoryStore.deleteAll();
    const categories = await db.categoryStore.getAllCategories();
    assert.equal(categories.length, 0);
  });

   test("get category by slug", async () => {
    const created = await db.categoryStore.addCategory(testCategory);
    const retrieved = await db.categoryStore.getCategoryBySlug(testCategory.slug);
    assertSubset(testCategory, retrieved);
  });

  test("update category", async () => {
    const created = await db.categoryStore.addCategory(testCategory);
    const updated = await db.categoryStore.updateCategory(created._id, {
      name: "Fine Dining",
      color: "#000000",
    });
    assert.equal(updated.name, "Fine Dining");
    assert.equal(updated.color, "#000000");
  });
  
});