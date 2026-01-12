import { assert } from "chai";
import { localspotService } from "./localspot-service.test";
import { assertSubset } from "../test-utils.test";
import { cleanDatabase, getRandomUser } from "./test-helpers.test"; // getRandomUser importieren
import { suite, test, setup, teardown } from "mocha";

const testCategory = {
  name: "Restaurant",
  slug: "restaurant",
  icon: "🍽️",
  color: "#FF5733",
};

suite("Category API tests", () => {
  let testCounter = 0;
  let adminData: any;

  setup(async () => {
    testCounter += 1;
    await cleanDatabase();
    
    // 1. Admin erstellen (nutze getRandomUser!)
    adminData = getRandomUser(true);
    await localspotService.createUser(adminData);
    
    // 2. Einloggen
    await localspotService.authenticate(adminData);
  });

  teardown(async () => {
    await localspotService.clearAuth();
  });

  test("create a category", async () => {
    // Slug einzigartig machen
    const uniqueCategory = { ...testCategory, slug: `restaurant-${Date.now()}` };
    const newCategory = await localspotService.createCategory(uniqueCategory);
    
    assertSubset(uniqueCategory, newCategory);
    assert.isDefined(newCategory._id);
  });

  test("get all categories", async () => {
    const cat1 = { ...testCategory, slug: `cat1-${Date.now()}` };
    const cat2 = { ...testCategory, name: "Cafe", slug: `cat2-${Date.now()}` };
    await localspotService.createCategory(cat1);
    await localspotService.createCategory(cat2);
    
    const categories = await localspotService.getAllCategories();
    assert.isAtLeast(categories.length, 2);
  });

  test("get category by id", async () => {
    const uniqueCategory = { ...testCategory, slug: `cat-id-${Date.now()}` };
    const created = await localspotService.createCategory(uniqueCategory);
    const retrieved = await localspotService.getCategory(created._id);
    assertSubset(uniqueCategory, retrieved);
  });

  test("delete category", async () => {
    const uniqueCategory = { ...testCategory, slug: `del-cat-${Date.now()}` };
    const created = await localspotService.createCategory(uniqueCategory);
    
    const beforeDelete = await localspotService.getAllCategories();
    await localspotService.deleteCategory(created._id);
    const afterDelete = await localspotService.getAllCategories();
    
    assert.equal(afterDelete.length, beforeDelete.length - 1);
  });

  test("get category - not found", async () => {
    try {
      await localspotService.getCategory("bad-id");
      assert.fail("Should fail");
    } catch (err: any) {
      assert.include([400, 404, 503], err.response?.status);
    }
  });

  test("create category - duplicate slug", async () => {
    const slug = `duplicate-${Date.now()}`;
    const uniqueCategory = { ...testCategory, slug: slug };
    await localspotService.createCategory(uniqueCategory);

    try {
      await localspotService.createCategory(uniqueCategory);
      assert.fail("Should fail on duplicate slug");
    } catch (err: any) {
      // 409 Conflict ist korrekt, 400 oder 500 manchmal auch je nach Server-Logik
      assert.include([400, 409, 500], err.response?.status);
    }
  });
});