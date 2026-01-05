import { assert } from "chai";
import { localspotService } from "./localspot-service.js";
import { assertSubset } from "../test-utils.js";
import { maggie, maggieCredentials } from "../fixtures.js";

const testCategory = {
  name: "Restaurant",
  slug: "restaurant",
  icon: "🍽️",
  color: "#FF5733",
};

suite("Category API tests", () => {
  setup(async () => {
    localspotService.clearAuth();
    await localspotService.createUser(maggie);
    await localspotService.authenticate(maggieCredentials);
    await localspotService.deleteAllCategories();
  });

  test("create a category", async () => {
    const newCategory = await localspotService.createCategory(testCategory);
    assertSubset(testCategory, newCategory);
    assert.isDefined(newCategory._id);
  });

  test("get all categories", async () => {
    await localspotService.createCategory(testCategory);
    await localspotService.createCategory({ ...testCategory, name: "Cafe", slug: "cafe" });
    const categories = await localspotService.getAllCategories();
    assert.equal(categories.length, 2);
  });

  test("get category by id", async () => {
    const created = await localspotService.createCategory(testCategory);
    const retrieved = await localspotService.getCategory(created._id);
    assertSubset(testCategory, retrieved);
  });

  test("delete category", async () => {
    const created = await localspotService.createCategory(testCategory);
    await localspotService.deleteCategory(created._id);
    const categories = await localspotService.getAllCategories();
    assert.equal(categories.length, 0);
  });
});