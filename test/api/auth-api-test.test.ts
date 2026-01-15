import { assert } from "chai";
import { localspotService } from "./localspot-service.test.js";
import { decodeToken } from "../../src/api/jwt-utils.js";
import { cleanDatabase, getRandomUser } from "./test-helpers.test.js";
import { suite, test, setup, teardown } from "mocha";

suite("Authentication API tests", () => {
  let userInfo: any;

  setup(async () => {
    await cleanDatabase();
    // 1. Generate a random user
    userInfo = getRandomUser();
    // 2. Create user in DB (so login will work)
    await localspotService.createUser(userInfo);
  });

  teardown(async () => {
    // Clear Auth Header after each test
    await localspotService.clearAuth();
  });

  test("authenticate", async () => {
    // Login with the generated user
    const response = await localspotService.authenticate(userInfo);
    assert.isTrue(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
    const response = await localspotService.authenticate(userInfo);
    // Decode token and check if the email matches
    // 'as any' prevents TypeScript error when accessing .email
    const decoded = decodeToken(response.token) as any;
    assert.equal(decoded.email, userInfo.email);
    assert.equal(decoded.userId, response.userId); // If your API returns userId
  });

  test("check Unauthorized", async () => {
    // Ensure we are logged out
    await localspotService.clearAuth();
    try {
      // Attempt to access a protected route (e.g., deleteAllUsers)
      await localspotService.deleteAllUsers();
      assert.fail("Route not protected");
    } catch (error: any) {
      // We expect 401 Unauthorized
      assert.equal(error.response.status, 401);
    }
  });
});