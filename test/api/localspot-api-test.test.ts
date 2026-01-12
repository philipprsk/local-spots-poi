import { EventEmitter } from "events";
import { assert } from "chai";
import { localspotService } from "./localspot-service.test";
import { assertSubset } from "../test-utils.test";
import { harbourCafe, testLocalSpots } from "../fixtures.test";
import { cleanDatabase, getRandomUser } from "./test-helpers.test";
import { User } from "../../src/types/localspot-types";
import { suite, test, setup } from "mocha";

EventEmitter.setMaxListeners(25);

suite("Localspot API tests", () => {
  let userCredentials: any;
  let user: User;

  setup(async () => {
    await cleanDatabase();
    // 1. User-Daten erstellen
    userCredentials = getRandomUser();
    // 2. User anlegen
    user = await localspotService.createUser(userCredentials);
    // 3. Einloggen mit Original-Daten (Klartext-Passwort)
    await localspotService.authenticate(userCredentials);
    
    harbourCafe.userid = user._id;
  });

  test("create localspot", async () => {
    // Da wir eingeloggt sind, sollte das jetzt klappen (201 oder 200)
    const returnedLocalspot = await localspotService.createLocalSpot(harbourCafe);
    assert.isNotNull(returnedLocalspot);
    assertSubset(harbourCafe, returnedLocalspot);
  });

  // ... restliche Tests können so bleiben wie sie waren, 
  // da das Setup nun den Token korrekt setzt.
  
  test("create multiple localspots", async () => {
    for (let i = 0; i < testLocalSpots.length; i += 1) {
      testLocalSpots[i].userid = user._id;
      await localspotService.createLocalSpot(testLocalSpots[i]);
    }
    let returnedLists = await localspotService.getAllLocalSpots();
    assert.equal(returnedLists.length, testLocalSpots.length);
    await localspotService.deleteAllLocalSpots();
    returnedLists = await localspotService.getAllLocalSpots();
    assert.equal(returnedLists.length, 0);
  });
});