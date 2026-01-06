import { assert } from "chai";
import { decodeToken } from "../../src/api/jwt-utils.js";
import { maggie, maggieCredentials } from "../fixtures.js";
import { localspotService } from "./localspot-service.js";
import { setupTestDatabase } from "./test-helpers.js";

suite("Authentication API tests", () => {
  setup(async () => {
    await setupTestDatabase();
    await localspotService.createUser(maggie);
  });

  test("authenticate", async () => {
    const response = await localspotService.authenticate(maggieCredentials);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
    const response = await localspotService.authenticate(maggieCredentials);
    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, maggie.email);
  });

  test("check Unauthorized", async () => {
    await localspotService.clearAuth();
    try {
      await localspotService.getAllUsers();
      assert.fail("Route not protected");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });
});