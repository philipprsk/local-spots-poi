import { assert } from "chai";
import { localspotService } from "./localspot-service.js";
import { maggie, maggieCredentials, adminCredentials, adminUser } from "../fixtures.js";
import { setupTestDatabase } from "./test-helpers.js";

suite("Admin API tests", () => {
  setup(async () => {
    await setupTestDatabase();
    try { await localspotService.createUser(adminUser); } catch {}
    try { await localspotService.createUser(maggie); } catch {}
    await localspotService.authenticate(adminCredentials);
  });

  teardown(async () => {
    localspotService.clearAuth();
  });

  test("admin can list all users", async () => {
    await localspotService.authenticate(adminCredentials);
    const users = await localspotService.getAllUsers();
    assert.isArray(users);
    assert.isAtLeast(users.length, 2);
  });

  test("non-admin cannot list users", async () => {
    await localspotService.authenticate(maggieCredentials);
    try {
      await localspotService.getAllUsers();
      assert.fail("Should not allow non-admin");
    } catch (error) {
      assert.include([401, 403, 503], error.response?.status);
    }
  });

  test("admin can delete user", async () => {
    await localspotService.authenticate(adminCredentials);
    const newUser = await localspotService.createUser({
      firstName: "Test",
      lastName: "User",
      email: `test-${Date.now()}@test.com`,
      password: "test",
    });
    const response = await localspotService.deleteUser(newUser._id ?? newUser.id);
    assert.equal(response.status, 204);
  });

  test("non-admin cannot delete user", async () => {
    await localspotService.authenticate(adminCredentials);
    const users = await localspotService.getAllUsers();
    const victim = users.find((u) => (u.email ?? "").toLowerCase() !== adminUser.email.toLowerCase());
    await localspotService.authenticate(maggieCredentials);
    try {
      await localspotService.deleteUser((victim._id ?? victim.id));
      assert.fail("Should not allow non-admin");
    } catch (error) {
      assert.include([401, 403, 503], error.response?.status);
    }
  });

  test("admin delete user - bad id", async () => {
    await localspotService.authenticate(adminCredentials);
    try {
      await localspotService.deleteUser("bad-id");
      assert.fail("Should fail");
    } catch (err) {
      assert.include([400, 404, 503], err.response?.status);
    }
  });
});