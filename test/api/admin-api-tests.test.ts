import { assert } from "chai";
import { localspotService } from "./localspot-service.test.js";
import { cleanDatabase, getRandomUser } from "./test-helpers.test.js";
import { User } from "../../src/types/localspot-types.js";
import { suite, test, setup, teardown } from "mocha";

suite("Admin API tests", () => {
  // These will hold user credentials
  let adminCredentials: any;
  let regularCredentials: any;
  let createdAdmin: any;

  setup(async () => {
    await cleanDatabase();

    // 1. Create admin user & save credentials
    adminCredentials = getRandomUser(true); 
    createdAdmin = await localspotService.createUser(adminCredentials);
    
    // 2. Create regular user & save credentials
    regularCredentials = getRandomUser(false);
    await localspotService.createUser(regularCredentials);

    // Default to logging in as admin
    await localspotService.authenticate(adminCredentials);
  });

  teardown(async () => {
    await localspotService.clearAuth();
  });

  test("non-admin cannot list users", async () => {
    // Switch to regular user
    await localspotService.authenticate(regularCredentials);
    try {
      await localspotService.getAllUsers();
      assert.fail("Should not allow non-admin");
    } catch (error: any) {
      // 401 = Unauthorized, 403 = Forbidden
      assert.include([401, 403], error.response?.status);
    }
  });

  test("non-admin cannot delete user", async () => {
    // 1. Log in as admin to see user list
    await localspotService.authenticate(adminCredentials);
    const users = await localspotService.getAllUsers();
    
    // Find someone to delete (not the admin themselves)
    const victim = users.find((u: User) => u.email === regularCredentials.email);

    // 2. Switch back to regular user
    await localspotService.authenticate(regularCredentials);
    try {
      if (victim) {
        await localspotService.deleteUser(victim._id || victim.id);
      }
      assert.fail("Should not allow non-admin to delete");
    } catch (error: any) {
      assert.include([401, 403], error.response?.status);
    }
  });

  test("admin delete user - bad id", async () => {
    await localspotService.authenticate(adminCredentials);
    try {
      await localspotService.deleteUser("bad-id");
      assert.fail("Should fail with 400 or 404");
    } catch (error: any) {
      assert.include([400, 404], error.response?.status);
    }
  });
});