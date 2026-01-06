import { assert } from "chai";
import { db } from "../../src/models/db.js";
import { maggie, testUsers } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";

suite("User Model tests", () => {
  let users = [];

  suiteSetup(async () => {
    await db.init("mongo");
  });

  setup(async () => {
    await db.userStore.deleteAll();
    users = [];
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      users[i] = await db.userStore.addUser(testUsers[i]);
    }
    assert.equal(users.length, testUsers.length);
  });

  test("create a user", async () => {
    const newUser = await db.userStore.addUser(maggie);
    assertSubset(maggie, newUser);
    assert.isDefined(newUser._id);
  });

  test("delete all users", async () => {
    let returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length); // <- vor dem Test
    await db.userStore.deleteAll();
    returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, 0);
  });

  test("get a user - success", async () => {
    const user = await db.userStore.addUser(maggie);
    const byId = await db.userStore.getUserById(user._id);
    const byEmail = await db.userStore.getUserByEmail(user.email);
    assert.equal(byId._id.toString(), user._id.toString());
    assert.equal(byEmail._id.toString(), user._id.toString());
  });

  test("delete One User - success", async () => {
    const targetId = users[0]._id;
    await db.userStore.deleteUserById(targetId);
    const returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length - 1);
    const deleted = await db.userStore.getUserById(targetId);
    assert.isNull(deleted);
  });

  test("get a user - bad params", async () => {
    assert.isNull(await db.userStore.getUserByEmail(""));
    assert.isNull(await db.userStore.getUserById(""));
    assert.isNull(await db.userStore.getUserById());
  });

  test("delete One User - fail", async () => {
    await db.userStore.deleteUserById("bad-id");
    const allUsers = await db.userStore.getAllUsers();
    assert.equal(testUsers.length, allUsers.length);
  });
});