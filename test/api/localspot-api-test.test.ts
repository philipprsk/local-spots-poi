import { EventEmitter } from "events";
import { assert } from "chai";
import { suite, test, setup } from "mocha"
import { localspotService } from "./localspot-service.test.js";
import { assertSubset } from "../test-utils.test.js";
import { harbourCafe, testLocalSpots, testCategory } from "../fixtures.test.js";
import { cleanDatabase, getRandomUser } from "./test-helpers.test.js";
import { User } from "../../src/types/localspot-types.js";

EventEmitter.setMaxListeners(25);

suite("Localspot API tests", () => {
  let userCredentials: any;
  let user: User;

  setup(async () => {
    await cleanDatabase();
    userCredentials = getRandomUser();
    user = await localspotService.createUser(userCredentials);
    await localspotService.authenticate(userCredentials);
    harbourCafe.userid = user._id;
  });

  test("create localspot", async () => {
    const returnedLocalspot = await localspotService.createLocalSpot(harbourCafe);
    assert.isNotNull(returnedLocalspot);
    assertSubset(harbourCafe, returnedLocalspot);
  });

  test("create multiple localspots", async () => {
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      testLocalSpots[i].userid = user._id;
      await localspotService.createLocalSpot(testLocalSpots[i]);
    }
    let returnedSpots = await localspotService.getAllLocalSpots();
    assert.equal(returnedSpots.length, testLocalSpots.length);
    await localspotService.deleteAllLocalSpots();
    returnedSpots = await localspotService.getAllLocalSpots();
    assert.equal(returnedSpots.length, 0);
  });

  test("get a localspot - success", async () => {
    const spot = await localspotService.createLocalSpot(harbourCafe);
    const retrieved = await localspotService.getLocalSpot(spot._id);
    assert.equal(retrieved.title, harbourCafe.title);
    assertSubset(harbourCafe, retrieved);
  });

  test("delete One localspot - success", async () => {
    const spot = await localspotService.createLocalSpot(harbourCafe);
    await localspotService.deleteLocalSpot(spot._id);
    try {
      await localspotService.getLocalSpot(spot._id);
      assert.fail("Should have thrown 404 error");
    } catch (err: any) {
      assert.equal(err.response.status, 404);
    }
  });

  test("get a localspot - bad id", async () => {
    try {
      await localspotService.getLocalSpot("1234");
      assert.fail("Should have thrown error");
    } catch (err: any) {
      assert.equal(err.response.status, 404);
    }
  });

  test("delete One localspot - fail (bad id)", async () => {
    try {
      await localspotService.deleteLocalSpot("bad-id");
      assert.fail("Should have thrown error");
    } catch (err: any) {
      // Since your Joi validation likely expects a valid Mongo ID,
      // you will probably get a 400 (Bad Request) or 404 here.
      assert.include([400, 404], err.response.status);
    }
  });

  test("get localspot with populated category", async () => {
    // If your fixtures contain a categoryId:
    const spot = await localspotService.createLocalSpot(harbourCafe);
    const retrieved = await localspotService.getLocalSpot(spot._id);
    
    assert.isNotNull(retrieved.category, "Category should be present");
    // Wenn dein Backend 'populate' nutzt, ist category ein Objekt, sonst nur eine ID-String
    if (typeof retrieved.category === 'object') {
      assert.isDefined(retrieved.category.name);
    }
  });
});