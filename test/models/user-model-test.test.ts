import { assert } from "chai";
import bcrypt from "bcrypt";
import { maggie, testUsers } from "../fixtures.test";
import { User } from "../../src/types/localspot-types";
import { suite, test, setup } from "mocha"; // Explicit TDD imports
import { db } from "../../src/models/db";

suite("User Model tests", () => {
  let users: User[] = [];

  // CHANGED: beforeEach -> setup
  setup(async () => {
    // Ensure DB is connected before wiping
    // If you have a separate DB helper for models, call it here
    await db.userStore.deleteAll();
    users = [];
    for (let i = 0; i < testUsers.length; i += 1) {
      const user = await db.userStore.addUser(testUsers[i]);
      users.push(user);
    }
    assert.equal(users.length, testUsers.length);
  });

  test("create a user", async () => {
    const newUser = await db.userStore.addUser(maggie);
    assert.isDefined(newUser._id);
    assert.equal(newUser.email, maggie.email);
    assert.equal(newUser.firstName, maggie.firstName);
  });

  test("password is hashed", async () => {
    const newUser = await db.userStore.addUser(maggie);
    assert.notEqual(newUser.password, maggie.password);
    assert.isTrue(newUser.password.startsWith("$2b$"));
    assert.equal(newUser.password.length, 60);
  });

  test("bcrypt compare with correct password", async () => {
    const newUser = await db.userStore.addUser(maggie);
    const isValid = await bcrypt.compare(maggie.password, newUser.password);
    assert.isTrue(isValid);
  });

  test("bcrypt compare with incorrect password", async () => {
    const newUser = await db.userStore.addUser(maggie);
    const isValid = await bcrypt.compare("wrongpassword", newUser.password);
    assert.isFalse(isValid);
  });

  test("delete all users", async () => {
    let returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length);
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
    const result = await db.userStore.getUserById(targetId);
    assert.isNull(result);
  });

  test("get a user - bad params", async () => {
    assert.isNull(await db.userStore.getUserById(""));
    assert.isNull(await db.userStore.getUserById(undefined as any));
    assert.isNull(await db.userStore.getUserByEmail(""));
    assert.isNull(await db.userStore.getUserByEmail(undefined as any));
  });

  test("delete One User - fail", async () => {
    // Should not throw error, just return/do nothing
    await db.userStore.deleteUserById("bad-id");
    await db.userStore.deleteUserById("");
  });
});