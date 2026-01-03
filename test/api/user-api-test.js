import { assert } from "chai";
import { localspotService } from "./localspot-service.js";
import { assertSubset } from "../test-utils.js";
import { maggie, testUsers } from "../fixtures.js";


suite("User API tests", () => {
  setup(async () => {
    await localspotService.deleteAllUsers();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testUsers[i] = await localspotService.createUser(testUsers[i]); 
    }
  });

  teardown(async () => {
  });


  test("create a user", async () => {
  const newUser = await localspotService.createUser(maggie);
  
  // Comparing field by field to avoid issues with additional fields like _id
  assert.equal(newUser.firstName, maggie.firstName);
  assert.equal(newUser.lastName, maggie.lastName);
  assert.equal(newUser.email, maggie.email);
  
 
  assert.isDefined(newUser._id);
  });

  test("delete all users", async () => {
    let returnedUsers = await localspotService.getAllUsers();
    assert.equal(returnedUsers.length, 3);
    await localspotService.deleteAllUsers();
    returnedUsers = await localspotService.getAllUsers();
    assert.equal(returnedUsers.length, 0);
  });

  test("get a user - success", async () => {
    const returnedUser = await localspotService.getUser(testUsers[0]._id);
    assert.deepEqual(testUsers[0], returnedUser);
  });

     test("get a user - bad id", async () => {
    try {
      const returnedUser = await localspotService.getUser("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get a user - deleted user", async () => {
    await localspotService.deleteAllUsers();
    try {
      const returnedUser = await localspotService.getUser(testUsers[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });
});
