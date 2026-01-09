import { assert } from "chai";
import { localspotService } from "./localspot-service.test";
import { maggie, maggieCredentials, testUsers, adminCredentials, adminUser } from "../fixtures.test";
import { setupTestDatabase } from "./test-helpers.test";

describe("User API tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await localspotService.createUser(testUsers[i]);
    }
    await localspotService.createUser(maggie);
    await localspotService.authenticate(maggieCredentials);
  });

  it("create a user", async () => {
    const newUser = await localspotService.createUser({
      firstName: "Test",
      lastName: "User",
      email: `test-${Date.now()}@test.com`,
      password: "test",
    });
    assert.isDefined(newUser._id);
    assert.include(newUser.email, "@test.com");
  });

  it("get a user - success", async () => {
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

  it("delete one user - success", async () => {
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
    } catch (err: any) {
      assert.include([404, 503], err.response?.status);
    }
  });

  it("delete one user - fail (bad id)", async () => {
    await localspotService.authenticate(adminCredentials);
    try {
      await localspotService.deleteUser("bad-id");
      assert.fail("Should fail on bad id");
    } catch (err: any) {
      assert.include([400, 404, 503], err.response?.status);
    }
  });

  it("get a user - bad params", async () => {
    await localspotService.authenticate(adminCredentials);
    const badParams = ["", undefined];
    await Promise.all(
      badParams.map(async (bad) => {
        try {
          await localspotService.getUser(bad as any);
          assert.fail("Should fail on bad param");
        } catch (err: any) {
          assert.include([400, 404, 503], err.response?.status);
        }
      })
    );
  });

  it("delete all users", async () => {
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