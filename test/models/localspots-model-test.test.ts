import { assert } from "chai";
import { db } from "../../src/models/db.js";
import { testLocalSpots, harbourCafe, maggie, testCategory } from "../fixtures.test.js"; // testCategory importieren!
import { assertSubset } from "../test-utils.test.js";
import { User, Category } from "../../src/types/localspot-types.js";
import { suite, test, setup } from "mocha";

suite("LocalSpots Model tests", () => {
  let user: User;
  let category: Category;

  setup(async () => {
    await db.localspotStore.deleteAllLocalSpots();
    await db.categoryStore.deleteAll();
    await db.userStore.deleteAll();
    
   
    user = await db.userStore.addUser(maggie);
    category = await db.categoryStore.addCategory(testCategory); 
    
    harbourCafe.userid = user._id;
    harbourCafe.category = category._id; 

    for (let i = 0; i < testLocalSpots.length; i += 1) {
      testLocalSpots[i].userid = user._id;
      testLocalSpots[i].category = category._id;
    }
  });

  test("create a localspot", async () => {
  const newSpot = await db.localspotStore.addLocalSpot(harbourCafe);
  assert.equal(newSpot.title, harbourCafe.title);
  assert.equal(newSpot.userid.toString(), (harbourCafe.userid as any).toString());
});

test("get a localspot - success", async () => {
  const spot = await db.localspotStore.addLocalSpot(harbourCafe);
  const retrieved = await db.localspotStore.getLocalSpotById(spot._id);
  assert.equal(retrieved.title, harbourCafe.title);
});

  test("delete all localspots", async () => {
    await db.localspotStore.addLocalSpot(harbourCafe);
    await db.localspotStore.deleteAllLocalSpots();
    const all = await db.localspotStore.getAllLocalSpots();
    assert.equal(all.length, 0);
  });


  test("delete One localspot - success", async () => {
    const spot = await db.localspotStore.addLocalSpot(harbourCafe);
    await db.localspotStore.deleteLocalSpotById(spot._id);
    const retrieved = await db.localspotStore.getLocalSpotById(spot._id);
    assert.isNull(retrieved);
  });

  test("get a localspot - bad params", async () => {
    assert.isNull(await db.localspotStore.getLocalSpotById(""));
    assert.isNull(await db.localspotStore.getLocalSpotById(undefined as any));
  });

  test("delete One localspot - fail", async () => {
    await db.localspotStore.deleteLocalSpotById("bad-id");
  });

  
  test("get localspot with populated category", async () => {
    const spot = await db.localspotStore.addLocalSpot(harbourCafe);
    const retrieved = await db.localspotStore.getLocalSpotById(spot._id);
    
    assert.isNotNull(retrieved.category, "Category should be populated or at least present");
    if (retrieved.category && typeof retrieved.category === 'object') {
        assert.equal(retrieved.category.name, testCategory.name);
    }
  });
  
  test("get user localspots", async () => {
    const spot = await db.localspotStore.addLocalSpot(harbourCafe);
    const userSpots = await db.localspotStore.getLocalSpotsByUserId(user._id);
    assert.equal(userSpots.length, 1);
    assert.equal(userSpots[0].userid.toString(), (user._id as any).toString());
  });
});