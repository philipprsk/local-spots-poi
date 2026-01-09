import { assert } from "chai";
import bcrypt from "bcrypt";
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
    // Don't check password field directly
    assert.isDefined(newUser._id);
    assert.equal(newUser.email, maggie.email);
    assert.equal(newUser.firstName, maggie.firstName);
  });

  test("password is hashed", async () => {
    const newUser = await db.userStore.addUser(maggie);
    // Password should not be stored in plaintext
    assert.notEqual(newUser.password, maggie.password);
    // Password should be a valid bcrypt hash
    assert.isTrue(newUser.password.startsWith("$2b$"));
    assert.equal(newUser.password.length, 60);
  });

  test("bcrypt compare with correct password", async () => {
  const newUser = await db.userStore.addUser(maggie);
  console.log("Plain password:", maggie.password);
  console.log("Hashed password:", newUser.password);
  const isValid = await bcrypt.compare(maggie.password, newUser.password);
  console.log("Is valid:", isValid);
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
  });

  test("get a user - bad params", async () => {
    assert.isNull(await db.userStore.getUserById(""));
    assert.isNull(await db.userStore.getUserById());
    assert.isNull(await db.userStore.getUserByEmail(""));
    assert.isNull(await db.userStore.getUserByEmail());
  });

  test("delete One User - fail", async () => {
    await db.userStore.deleteUserById("bad-id");
    await db.userStore.deleteUserById("");
  });
});