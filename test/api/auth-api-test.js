import { assert } from "chai";
import { decodeToken } from "../../src/api/jwt-utils.js";
import { maggie, maggieCredentials } from "../fixtures.js";
import { localspotService } from "./localspot-service.js";

suite("Authentication API tests", async () => {
  setup(async () => {
    localspotService.clearAuth();
    await localspotService.createUser(maggie);
    await localspotService.authenticate(maggieCredentials);
    await localspotService.deleteAllUsers();
  });

  test("authenticate", async () => {
    const returnedUser = await localspotService.createUser(maggie);
    const response = await localspotService.authenticate(maggieCredentials);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
    const returnedUser = await localspotService.createUser(maggie);
    const response = await localspotService.authenticate(maggieCredentials);

    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
  });

    test("check Unauthorized", async () => {
    await localspotService.clearAuth();
    try {
      await localspotService.deleteAllUsers();
      assert.fail("Route not protected");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });

});
