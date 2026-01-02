import { assert } from "chai";
import { db } from "../src/models/db.js";
import { harbourCafe, testLocalSpots } from "./fixtures.js";

suite("LocalSpots API tests", () => {

  setup(async () => {
    db.init("json");
    await db.localspotStore.deleteAllLocalSpots();
  });

  test("create a localspot", async () => {
    const newLocalspot = await db.localspotStore.addLocalSpot(harbourCafe);
    assert.deepEqual(harbourCafe, newLocalspot)
  });


  test("delete all localspots", async () => {
    for(let i=0; i< testLocalSpots.length; i+= 1) {
        // eslint-disable-next-line no-await-in-loop
        await db.localspotStore.addLocalSpot(testLocalSpots[i]);
    }
    let returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal( returnedLocalspots.length, 3);
    await db.localspotStore.deleteAllLocalSpots();
    returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(returnedLocalspots.length, 0);
    });

  test("get a localspot - success", async () => {
    const localspot = await db.localspotStore.addLocalSpot(harbourCafe);
    const returnedLocalspot1 = await db.localspotStore.getLocalSpotById(localspot._id);
    assert.deepEqual(localspot, returnedLocalspot1);
  });



  test("delete One localspot - success", async () => {
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testLocalSpots[i] = await db.localspotStore.addLocalSpot(testLocalSpots[i]);
    }
    await db.localspotStore.deleteLocalSpotById(testLocalSpots[0]._id);
    const returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(returnedLocalspots.length, testLocalSpots.length - 1);
    const deletedLocalspot = await db.localspotStore.getLocalSpotById(testLocalSpots[0]._id);
    assert.isNull(deletedLocalspot);
  });

  test("get a localspot - failures", async () => {
    const noLocalspotWithId = await db.localspotStore.getLocalSpotById("123");
    assert.isNull(noLocalspotWithId);
  });

  test("get a localspot - bad params", async () => {
    let nullLocalspot = await db.localspotStore.getLocalSpotById("");
    assert.isNull(nullLocalspot);
    nullLocalspot = await db.localspotStore.getLocalSpotById();
    assert.isNull(nullLocalspot);
  });

  test("delete One localspot - fail", async () => {
    // 1. Erstmal Daten zum Testen laden
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      await db.localspotStore.addLocalSpot(testLocalSpots[i]);
    }
    // 2. Versuchen eine ID zu löschen, die es nicht gibt
    await db.localspotStore.deleteLocalSpotById("bad-id");
    
    // 3. Prüfen, ob noch alle da sind
    const allLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(allLocalspots.length, testLocalSpots.length);
  });
 });