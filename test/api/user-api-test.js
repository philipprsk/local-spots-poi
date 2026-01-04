import { assert } from "chai";
import { localspotService } from "./localspot-service.js";
import { assertSubset } from "../test-utils.js";
import { maggie, maggieCredentials, testUsers } from "../fixtures.js";
import { db } from "../../src/models/db.js";

const users = new Array(testUsers.length);

suite("User API tests", () => {
  setup(async () => {
  localspotService.clearAuth();
  await localspotService.createUser(maggie);
  await localspotService.authenticate(maggieCredentials); 
  await localspotService.deleteAllUsers();
  for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      users[0] = await localspotService.createUser(testUsers[i]); 
    }
    await localspotService.createUser(maggie);
    await localspotService.authenticate(maggieCredentials);
  });

  teardown(async () => {});

  test("create a user", async () => {
  const newUser = await localspotService.createUser(maggie);
  assertSubset(maggie, newUser);
  assert.isDefined(newUser._id);
  });

 test("delete all users", async () => {
  // 1. Sicherstellen, dass wir eingeloggt sind (muss im setup oder hier passieren)
  await localspotService.authenticate(maggieCredentials); 
  
  // 2. Alle löschen
  await localspotService.deleteAllUsers();
  
  // 3. Einen neuen User anlegen (damit wir wieder einen Token generieren können, 
  // falls der alte durch das Löschen des Users im Backend ungültig wurde)
  await localspotService.createUser(maggie);
  await localspotService.authenticate(maggieCredentials);
  
  // 4. Prüfen
  const returnedUsers = await localspotService.getAllUsers();
  // Da du gerade maggie erstellt hast, muss die Länge 1 sein!
  assert.equal(returnedUsers.length, 1);
});

  test("get a user - success", async () => {
    const returnedUser = await localspotService.getUser(users[0]._id);
    assert.deepEqual(users[0], returnedUser);
  });

     test("get a user - bad id", async () => {
    try {
      const returnedUser = await localspotService.getUser("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      // assert.equal(error.response.data.statusCode, 503);
    }
  });

  test("get a user - deleted user", async () => {
    await localspotService.deleteAllUsers();
    await localspotService.createUser(maggie);
    await localspotService.authenticate(maggieCredentials);
    try {
      const returnedUser = await localspotService.getUser(users[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });
});
