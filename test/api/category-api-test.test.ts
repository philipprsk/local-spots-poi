import { assert } from "chai";
import { localspotService } from "./localspot-service.test";
import { assertSubset } from "../test-utils.test";
import { adminUser, adminCredentials } from "../fixtures.test";
import { Category } from "../../src/types/localspot-types";

const testCategory = {
  name: "Restaurant",
  slug: "restaurant",
  icon: "🍽️",
  color: "#FF5733",
  description: "Places to eat",
};

describe("Category API tests", () => {
  let testCounter = 0;

  beforeEach(async () => {
    testCounter += 1;
    try {
      localspotService.clearAuth();
      try {
        await localspotService.createUser(adminUser);
      } catch (err) {
        // User might already exist
      }
      await localspotService.authenticate(adminCredentials);
    } catch (error: any) {
      console.error("Setup error:", error.message);
      throw error;
    }
  });

  afterEach(async () => {
    localspotService.clearAuth();
  });

  it("create a category", async () => {
    const uniqueCategory = { ...testCategory, slug: `restaurant-${testCounter}` };
    console.log("Test slug:", uniqueCategory.slug);
    const newCategory = await localspotService.createCategory(uniqueCategory);
    assertSubset(uniqueCategory, newCategory);
    assert.isDefined(newCategory._id);
  });

  it("get all categories", async () => {
    const cat1 = { ...testCategory, slug: `restaurant-${testCounter}-1` };
    const cat2 = { ...testCategory, name: "Cafe", slug: `cafe-${testCounter}` };
    await localspotService.createCategory(cat1);
    await localspotService.createCategory(cat2);
    const categories = await localspotService.getAllCategories();
    assert.isAtLeast(categories.length, 2);
  });

  it("get category by id", async () => {
    const uniqueCategory = { ...testCategory, slug: `restaurant-${testCounter}` };
    const created = await localspotService.createCategory(uniqueCategory);
    const retrieved = await localspotService.getCategory(created._id);
    assertSubset(uniqueCategory, retrieved);
  });

  it("delete category", async () => {
    const uniqueCategory = { ...testCategory, slug: `restaurant-${testCounter}` };
    const created = await localspotService.createCategory(uniqueCategory);
    const beforeDelete = await localspotService.getAllCategories();
    await localspotService.deleteCategory(created._id);
    const afterDelete = await localspotService.getAllCategories();
    assert.equal(afterDelete.length, beforeDelete.length - 1);
  });

  it("get category - not found", async () => {
    try {
      await localspotService.getCategory("bad-id");
      assert.fail("Should fail");
    } catch (err: any) {
      assert.include([400, 401, 404, 500, 503], err.response?.status);
    }
  });

  it("create category - duplicate slug", async () => {
    const uniqueCategory = { ...testCategory, slug: `restaurant-${testCounter}` };
    console.log("Creating first category with slug:", uniqueCategory.slug);
    const first = await localspotService.createCategory(uniqueCategory);
    console.log("First category created:", first._id);

    try {
      console.log("Attempting to create duplicate...");
      await localspotService.createCategory(uniqueCategory);
      assert.fail("Should fail on duplicate slug");
    } catch (err: any) {
      console.log("Error caught:", err.response?.status, err.message);
      const status = err.response?.status ?? err.status ?? err.statusCode;
      assert.include([400, 401, 409, 500], status);
    }
  });
});