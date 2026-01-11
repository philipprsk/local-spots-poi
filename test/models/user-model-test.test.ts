import { assert } from "chai";
import { db } from "../../src/models/db";
import bcrypt from "bcrypt";
import { maggie, testUsers } from "../fixtures.test";
import { assertSubset } from "../test-utils.test";
import { User } from "../../src/types/localspot-types";

describe("User Model tests", () => {
  let users: User[] = [];

  beforeEach(async () => {
    await db.userStore.deleteAll();
    users = [];
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      users[i] = await db.userStore.addUser(testUsers[i]);
    }
    assert.equal(users.length, testUsers.length);
  });

  it("create a user", async () => {
    const newUser = await db.userStore.addUser(maggie);
    assert.isDefined(newUser._id);
    assert.equal(newUser.email, maggie.email);
    assert.equal(newUser.firstName, maggie.firstName);
  });

  it("password is hashed", async () => {
    const newUser = await db.userStore.addUser(maggie);
    assert.notEqual(newUser.password, maggie.password);
    assert.isTrue(newUser.password.startsWith("$2b$"));
    assert.equal(newUser.password.length, 60);
  });

  it("bcrypt compare with correct password", async () => {
    const newUser = await db.userStore.addUser(maggie);
    const isValid = await bcrypt.compare(maggie.password, newUser.password);
    assert.isTrue(isValid);
  });

  it("bcrypt compare with incorrect password", async () => {
    const newUser = await db.userStore.addUser(maggie);
    const isValid = await bcrypt.compare("wrongpassword", newUser.password);
    assert.isFalse(isValid);
  });

  it("delete all users", async () => {
    let returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length);
    await db.userStore.deleteAll();
    returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, 0);
  });

  it("get a user - success", async () => {
    const user = await db.userStore.addUser(maggie);
    const byId = await db.userStore.getUserById(user._id);
    const byEmail = await db.userStore.getUserByEmail(user.email);
    assert.equal(byId._id.toString(), user._id.toString());
    assert.equal(byEmail._id.toString(), user._id.toString());
  });

  it("delete One User - success", async () => {
    const targetId = users[0]._id;
    await db.userStore.deleteUserById(targetId);
  });

  it("get a user - bad params", async () => {
    assert.isNull(await db.userStore.getUserById(""));
    assert.isNull(await db.userStore.getUserById());
    assert.isNull(await db.userStore.getUserByEmail(""));
    assert.isNull(await db.userStore.getUserByEmail());
  });

  it("delete One User - fail", async () => {
    await db.userStore.deleteUserById("bad-id");
    await db.userStore.deleteUserById("");
  });
});