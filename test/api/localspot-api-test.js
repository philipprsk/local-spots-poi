import { EventEmitter } from "events";
import { assert } from "chai";
import { localspotService } from "./localspot-service.js";
import { assertSubset } from "../test-utils.js";
import { maggie, harbourCafe, testLocalSpots, maggieCredentials } from "../fixtures.js";
import { setupTestDatabase } from "./test-helpers.js";

EventEmitter.setMaxListeners(25);

suite("Localspot API tests", () => {
  let user = null;

  setup(async () => {
    await setupTestDatabase();
    user = await localspotService.createUser(maggie);
    await localspotService.authenticate(maggieCredentials);
    harbourCafe.userid = user._id;
  });

  test("create localspot", async () => {
    const returnedLocalspot = await localspotService.createLocalSpot(harbourCafe);
    assert.isNotNull(returnedLocalspot);
    assertSubset(harbourCafe, returnedLocalspot);
  });

  test("delete a localspot", async () => {
    const localspot = await localspotService.createLocalSpot(harbourCafe);
    const response = await localspotService.deleteLocalSpot(localspot._id);
    assert.equal(response.status, 204);
    try {
      await localspotService.getLocalSpot(localspot.id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No LocalSpot with this id");
    }
  });

  test("create multiple localspots", async () => {
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      testLocalSpots[i].userid = user._id;
      // eslint-disable-next-line no-await-in-loop
      await localspotService.createLocalSpot(testLocalSpots[i]);
    }
    let returnedLists = await localspotService.getAllLocalSpots();
    assert.equal(returnedLists.length, testLocalSpots.length);
    await localspotService.deleteAllLocalSpots();
    returnedLists = await localspotService.getAllLocalSpots();
    assert.equal(returnedLists.length, 0);
  });

  test("remove non-existant localspot", async () => {
    try {
      await localspotService.deleteLocalSpot("not an id");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No LocalSpot with this id", "Incorrect Response Message");
    }
  });
});