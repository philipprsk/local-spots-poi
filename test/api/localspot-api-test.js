import { EventEmitter } from "events";
import { assert } from "chai";
import { localspotService } from "./localspot-service.js";
import { assertSubset } from "../test-utils.js";
import { maggie, harbourCafe, testLocalSpots } from "../fixtures.js";

EventEmitter.setMaxListeners(25);


suite("Localspot API tests", () => {
    let user = null;

  setup(async () => {
    await localspotService.deleteAllLocalSpots();
    await localspotService.deleteAllUsers();
    user = await localspotService.createUser(maggie);
    harbourCafe.userid = user._id;
  });

  teardown(async () => {});

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
      const returnedLocalspot = await localspotService.getLocalSpot(localspot.id);
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
      const response = await localspotService.deleteLocalSpot("not an id");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No LocalSpot with this id", "Incorrect Response Message");
    }
  });
});
