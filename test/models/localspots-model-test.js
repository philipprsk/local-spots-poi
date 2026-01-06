import { assert } from "chai";
import { EventEmitter } from "events";
import { db } from "../../src/models/db.js";
import { harbourCafe, testLocalSpots, maggie } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";

suite("LocalSpots Model tests", () => {
  EventEmitter.setMaxListeners(25);

  let user;
  let category;

  suiteSetup(async () => {
    await db.init("mongo");
  });

  setup(async () => {
    await db.userStore.deleteAll();
    await db.localspotStore.deleteAllLocalSpots();
    await db.categoryStore.deleteAll();

    user = await db.userStore.addUser(maggie);
    category = await db.categoryStore.addCategory({
      name: "Restaurant",
      slug: "restaurant",
      icon: "🍽️",
      color: "#FF5733",
    });

    assert.isNotNull(user, "setup: user should not be null");
    assert.isNotNull(category, "setup: category should not be null");
  });

  test("get localspot with populated category", async () => {
    const spot = await db.localspotStore.addLocalSpot({
      userid: user._id,
      title: "Test Cafe",
      description: "Nice place",
      latitude: 52.52,
      longitude: 13.405,
      category: category._id,
    });

    assert.isNotNull(spot, "addLocalSpot returned null");
    const spotId = spot._id ?? spot.id;
    assert.isOk(spotId, "spot has no _id/id");

    const retrieved = await db.localspotStore.getLocalSpot(spotId);
    assert.isNotNull(retrieved, "getLocalSpot returned null");
    assert.isNotNull(retrieved.category, "retrieved.category is null (populate missing?)");
    assert.equal(retrieved.category.name, "Restaurant");
    assert.equal(retrieved.category.icon, "🍽️");
  });

  test("get user localspots with category", async () => {
    await db.localspotStore.addLocalSpot({
      userid: user._id,
      title: "Spot 1",
      description: "Description 1",
      latitude: 52.52,
      longitude: 13.405,
      category: category._id,
    });
    const spots = await db.localspotStore.getUserLocalSpots(user._id);
    assert.equal(spots.length, 1);
    assert.equal(spots[0].category.name, "Restaurant");
  });

  // ...existing code...

  test("delete all localspots", async () => {
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await db.localspotStore.addLocalSpot({ ...testLocalSpots[i], userid: user._id });
    }

    let returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(returnedLocalspots.length, testLocalSpots.length); // <-- statt 3

    await db.localspotStore.deleteAllLocalSpots();
    returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(returnedLocalspots.length, 0);
  });

// ...existing code...

   test("get a localspot - success", async () => {
    const createdLocalspot = await db.localspotStore.addLocalSpot({ ...harbourCafe, userid: user._id });
    const returnedLocalspot = await db.localspotStore.getLocalSpot(createdLocalspot._id);
    assert.equal(returnedLocalspot.title, harbourCafe.title);
    assert.equal(returnedLocalspot.description, harbourCafe.description);
    assert.equal(returnedLocalspot.latitude, harbourCafe.latitude);
    assert.equal(returnedLocalspot.longitude, harbourCafe.longitude);
    assert.equal(returnedLocalspot.userid.toString(), user._id.toString());
  });

  test("delete One localspot - success", async () => {
    const spots = [];
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      spots[i] = await db.localspotStore.addLocalSpot({ ...testLocalSpots[i], userid: user._id });
    }
    await db.localspotStore.deleteLocalSpot(spots[0]._id);
    const returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(returnedLocalspots.length, testLocalSpots.length - 1);
    const deletedLocalspot = await db.localspotStore.getLocalSpot(spots[0]._id);
    assert.isNull(deletedLocalspot);
  });

  test("get a localspot - failures", async () => {
    const noLocalspotWithId = await db.localspotStore.getLocalSpot("123");
    assert.isNull(noLocalspotWithId);
  });

  test("get a localspot - bad params", async () => {
    let nullLocalspot = await db.localspotStore.getLocalSpot("");
    assert.isNull(nullLocalspot);
    nullLocalspot = await db.localspotStore.getLocalSpot();
    assert.isNull(nullLocalspot);
  });

  test("delete One localspot - fail", async () => {
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await db.localspotStore.addLocalSpot({ ...testLocalSpots[i], userid: user._id });
    }
    await db.localspotStore.deleteLocalSpot("bad-id");
    const allLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(allLocalspots.length, testLocalSpots.length);
  });
});