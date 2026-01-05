import { assert } from "chai";
import { localspotService } from "./localspot-service.js";
import { maggie, maggieCredentials } from "../fixtures.js";

const adminUser = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  password: "admin",
};

suite("Admin API tests", () => {
  setup(async () => {
    localspotService.clearAuth();
    await localspotService.createUser(adminUser);
    await localspotService.createUser(maggie);
  });

  teardown(async () => {
    localspotService.clearAuth();
  });

  test("admin can list all users", async () => {
    await localspotService.authenticate(adminUser);
    const users = await localspotService.getAllUsers();
    assert.isAtLeast(users.length, 2);
  });

  test("non-admin cannot list users", async () => {
    await localspotService.authenticate(maggieCredentials);
    try {
      await localspotService.getAllUsers();
      assert.fail("Should not allow non-admin");
    } catch (error) {
      assert.equal(error.response.status, 403);
    }
  });

  test("admin can delete user", async () => {
    await localspotService.authenticate(adminUser);
    const newUser = await localspotService.createUser({
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: "test",
    });
    const response = await localspotService.deleteUser(newUser._id);
    assert.equal(response.status, 204);
  });

  test("non-admin cannot delete user", async () => {
    await localspotService.authenticate(maggieCredentials);
    const users = await localspotService.getAllUsers();
    try {
      await localspotService.deleteUser(users[0]._id);
      assert.fail("Should not allow non-admin");
    } catch (error) {
      assert.equal(error.response.status, 403);
    }
  });
});