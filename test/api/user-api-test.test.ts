import { assert } from "chai";
import { localspotService } from "./localspot-service.test";
import { cleanDatabase, getRandomUser } from "./test-helpers.test";
import { suite, test, setup, teardown } from "mocha";

suite("User API tests", () => {
  let adminData: any;

  setup(async () => {
    await cleanDatabase();
    
    // 1. Admin-Daten generieren (MIT Klartext-Passwort)
    adminData = getRandomUser(true); 
    
    // 2. Admin anlegen
    await localspotService.createUser(adminData);
    
    // 3. Einloggen mit den Original-Daten (nicht dem Rückgabewert von createUser!)
    await localspotService.authenticate(adminData);
  });

  teardown(async () => {
    await localspotService.clearAuth();
  });

  test("create a user", async () => {
    const newUserParams = getRandomUser();
    const newUser = await localspotService.createUser(newUserParams);
    assert.isDefined(newUser._id);
    assert.equal(newUser.email, newUserParams.email);
  });

  test("get a user - success", async () => {
    // Einen User anlegen, den wir abrufen wollen
    const userParams = getRandomUser();
    const setupUser = await localspotService.createUser(userParams);
    const userId = setupUser._id ?? setupUser.id;
    
    // Als Admin (siehe Setup) den User abrufen
    const returnedUser = await localspotService.getUser(userId);
    
    assert.equal((returnedUser._id ?? returnedUser.id).toString(), userId.toString());
    assert.equal(returnedUser.email, setupUser.email);
  });

  test("delete one user - success", async () => {
    const userParams = getRandomUser();
    const u = await localspotService.createUser(userParams);
    
    const res = await localspotService.deleteUser(u._id ?? u.id);
    assert.equal(res.status, 204);
    
    try {
      await localspotService.getUser(u._id ?? u.id);
      assert.fail("Should not find deleted user");
    } catch (err: any) {
      assert.equal(err.response.status, 404);
    }
  });

  test("delete one user - fail (bad id)", async () => {
    try {
      await localspotService.deleteUser("bad-id");
      assert.fail("Should fail on bad id");
    } catch (err: any) {
      // 400 Bad Request (Validation) oder 404 Not Found
      assert.include([400, 404], err.response?.status);
    }
  });

  test("get a user - bad params", async () => {
    const badParams = ["", "undefined_id"];
    for (const bad of badParams) {
        try {
          await localspotService.getUser(bad);
          assert.fail("Should fail on bad param");
        } catch (err: any) {
          assert.include([400, 404], err.response?.status);
        }
    }
  });

  test("delete all users", async () => {
    // Wir sind als Admin eingeloggt (siehe Setup)
    // Zwei weitere User anlegen
    await localspotService.createUser(getRandomUser());
    await localspotService.createUser(getRandomUser());
    
    await localspotService.deleteAllUsers();
    
    // Nach delete all ist auch der Admin weg -> Neuer Admin nötig für Check
    await localspotService.clearAuth();
    const newAdmin = getRandomUser(true);
    await localspotService.createUser(newAdmin);
    await localspotService.authenticate(newAdmin);
    
    const users = await localspotService.getAllUsers();
    // Nur der neue Admin sollte da sein
    assert.equal(users.length, 1); 
  });
});