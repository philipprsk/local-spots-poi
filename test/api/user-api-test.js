import { assert } from "chai";
import { localspotService } from "./localspot-service.js";
import { maggie, maggieCredentials, testUsers, adminCredentials, adminUser } from "../fixtures.js";
import { setupTestDatabase } from "./test-helpers.js";

suite("User API tests", () => {
  setup(async () => {
    await setupTestDatabase();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await localspotService.createUser(testUsers[i]);
    }
    await localspotService.createUser(maggie);
    await localspotService.authenticate(maggieCredentials);
  });

  test("create a user", async () => {
    const newUser = await localspotService.createUser({
      firstName: "Test",
      lastName: "User",
      email: `test-${Date.now()}@test.com`,
      password: "test",
    });
    assert.isDefined(newUser._id);
    assert.include(newUser.email, "@test.com");
  });

  test("get a user - success", async () => {
    const setupUser = await localspotService.createUser({
      firstName: "Get",
      lastName: "Tester",
      email: `gettester-${Date.now()}@test.com`,
      password: "test",
    });
    const userId = setupUser._id ?? setupUser.id;
    await localspotService.authenticate(adminCredentials);
    const returnedUser = await localspotService.getUser(userId);
    assert.equal((returnedUser._id ?? returnedUser.id).toString(), userId.toString());
    assert.equal(returnedUser.email, setupUser.email);
  });

  test("delete one user - success", async () => {
    const u = await localspotService.createUser({
      firstName: "Del",
      lastName: "User",
      email: `del-${Date.now()}@test.com`,
      password: "test",
    });
    await localspotService.authenticate(adminCredentials);
    const res = await localspotService.deleteUser(u._id ?? u.id);
    assert.equal(res.status, 204);
    try {
      await localspotService.getUser(u._id ?? u.id);
      assert.fail("Should not find deleted user");
    } catch (err) {
      assert.include([404, 503], err.response?.status);
    }
  });

  test("delete one user - fail (bad id)", async () => {
    await localspotService.authenticate(adminCredentials);
    try {
      await localspotService.deleteUser("bad-id");
      assert.fail("Should fail on bad id");
    } catch (err) {
      assert.include([400, 404, 503], err.response?.status);
    }
  });

  test("get a user - bad params", async () => {
    await localspotService.authenticate(adminCredentials);
    const badParams = ["", undefined];
    await Promise.all(
      badParams.map(async (bad) => {
        try {
          await localspotService.getUser(bad);
          assert.fail("Should fail on bad param");
        } catch (err) {
          assert.include([400, 404, 503], err.response?.status);
        }
      })
    );
  });

  test("delete all users", async () => {
    await localspotService.authenticate(adminCredentials);
    await localspotService.createUser({ firstName: "A", lastName: "X", email: `a-${Date.now()}@t.com`, password: "x" });
    await localspotService.createUser({ firstName: "B", lastName: "Y", email: `b-${Date.now()}@t.com`, password: "x" });
    const res = await localspotService.deleteAllUsers();
    // Nach deleteAll ist Admin evtl. weg: Admin neu anlegen + einloggen
    localspotService.clearAuth();
    await localspotService.createUser(adminUser);
    await localspotService.authenticate(adminCredentials);
    const users = await localspotService.getAllUsers();
    assert.isAtMost(users.length, 1); // nur Admin sollte übrig sein
  });

});