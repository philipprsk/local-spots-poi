import { assert } from "chai";
import { decodeToken } from "../../src/api/jwt-utils";
import { maggie, maggieCredentials } from "../fixtures.test";
import { localspotService } from "./localspot-service.test";
import { setupTestDatabase } from "./test-helpers.test";

describe("Authentication API tests", () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await localspotService.createUser(maggie);
  });

  it("authenticate", async () => {
    const response = await localspotService.authenticate(maggieCredentials);
    assert(response.success);
    assert.isDefined(response.token);
  });

  it("verify Token", async () => {
    const response = await localspotService.authenticate(maggieCredentials);
    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, maggie.email);
  });

  it("check Unauthorized", async () => {
    await localspotService.clearAuth();
    try {
      await localspotService.getAllUsers();
      assert.fail("Route not protected");
    } catch (error: any) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });
});