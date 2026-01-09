import { assert } from "chai";
import { localspotService } from "./localspot-service.test";
import { maggie, maggieCredentials, adminCredentials, adminUser } from "../fixtures.test";
import { setupTestDatabase } from "./test-helpers.test";
import { User } from "../../src/types/models";

describe("Admin API tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
    try { await localspotService.createUser(adminUser); } catch {}
    try { await localspotService.createUser(maggie); } catch {}
    await localspotService.authenticate(adminCredentials);
  });

  afterEach(async () => {
    localspotService.clearAuth();
  });

  it("admin can list all users", async () => {
    await localspotService.authenticate(adminCredentials);
    const users = await localspotService.getAllUsers();
    assert.isArray(users);
    assert.isAtLeast(users.length, 2);
  });

  it("non-admin cannot list users", async () => {
    await localspotService.authenticate(maggieCredentials);
    try {
      await localspotService.getAllUsers();
      assert.fail("Should not allow non-admin");
    } catch (error: any) {
      assert.include([401, 403, 503], error.response?.status);
    }
  });

  it("admin can delete user", async () => {
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

  it("non-admin cannot delete user", async () => {
    await localspotService.authenticate(adminCredentials);
    const users = await localspotService.getAllUsers();
    const victim = users.find((u: User) => (u.email ?? "").toLowerCase() !== adminUser.email.toLowerCase());
    await localspotService.authenticate(maggieCredentials);
    try {
      await localspotService.deleteUser((victim._id ?? victim.id));
      assert.fail("Should not allow non-admin");
    } catch (error: any) {
      assert.include([401, 403, 503], error.response?.status);
    }
  });

  it("admin delete user - bad id", async () => {
    await localspotService.authenticate(adminCredentials);
    try {
      await localspotService.deleteUser("bad-id");
      assert.fail("Should fail");
    } catch (err: any) {
      assert.include([400, 404, 503], err.response?.status);
    }
  });
});