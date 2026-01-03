import { assert } from "chai";
import { EventEmitter } from "events";
import { db } from "../../src/models/db.js";
import { harbourCafe, testLocalSpots } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";



suite("LocalSpots Model tests", () => {

  EventEmitter.setMaxListeners(25);

  setup(async () => {
    db.init("mongo");
    await db.localspotStore.deleteAllLocalSpots();
  });

  test("create a localspot", async () => {
    const newLocalspot = await db.localspotStore.addLocalSpot(harbourCafe);
    assertSubset(harbourCafe, newLocalspot)
  });


  test("delete all localspots", async () => {
    for(let i=0; i< testLocalSpots.length; i+= 1) {
        // eslint-disable-next-line no-await-in-loop
        await db.localspotStore.addLocalSpot(testLocalSpots[i]);
    }
    let returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(returnedLocalspots.length, 3);
    await db.localspotStore.deleteAllLocalSpots();
    returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(returnedLocalspots.length, 0);
    });

 

  test("get a localspot - success", async () => {
  const createdLocalspot = await db.localspotStore.addLocalSpot(harbourCafe);
  const returnedLocalspot = await db.localspotStore.getLocalSpot(createdLocalspot._id);
  
  // Vergleiche das Fixture (harbourCafe) mit dem Ergebnis aus der DB
  assertSubset(harbourCafe, returnedLocalspot);
  
  // Die ID prüfst du separat als String
  assert.equal(returnedLocalspot._id.toString(), createdLocalspot._id.toString());
});

  test("delete One localspot - success", async () => {
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testLocalSpots[i] = await db.localspotStore.addLocalSpot(testLocalSpots[i]);
    }
    await db.localspotStore.deleteLocalSpot(testLocalSpots[0]._id);
    const returnedLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(returnedLocalspots.length, testLocalSpots.length - 1);
    const deletedLocalspot = await db.localspotStore.getLocalSpot(testLocalSpots[0]._id);
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
    // 1. Erstmal Daten zum Testen laden
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      await db.localspotStore.addLocalSpot(testLocalSpots[i]);
    }
    // 2. Versuch einen Eintrag zu löschen, der nicht existiert
    await db.localspotStore.deleteLocalSpot("bad-id");

    // 3. Prüfen, ob noch alle da sind
    const allLocalspots = await db.localspotStore.getAllLocalSpots();
    assert.equal(allLocalspots.length, testLocalSpots.length);
  });
 });