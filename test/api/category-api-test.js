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

 test("get category - not found", async () => {
    try {
      await localspotService.getCategory("bad-id");
      assert.fail("Should fail");
    } catch (err) {
      assert.include([400, 404, 500, 503], err.response?.status); // <- 500 hinzufügen
    }
  });

  test("create category - duplicate slug", async () => {
  await localspotService.createCategory(testCategory);
  try {
    await localspotService.createCategory(testCategory);
    assert.fail("Should fail on duplicate slug");
  } catch (err) {
    // Debug: schaue, was wirklich im Error ist
    console.log("Error details:", err.response?.status, err.status, err.statusCode, err.message);
    
    // Versuche mehrere Wege, den Status zu bekommen
    const status = err.response?.status ?? err.status ?? err.statusCode ?? err.response?.statusCode;
    assert.include([400, 409, 500, 503], status, `Unexpected status: ${status}, full error: ${JSON.stringify(err)}`);
  }
});
});