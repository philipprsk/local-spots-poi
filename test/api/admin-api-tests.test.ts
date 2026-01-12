import { assert } from "chai";
import { localspotService } from "./localspot-service.test";
import { cleanDatabase, getRandomUser } from "./test-helpers.test";
import { User } from "../../src/types/localspot-types";
import { suite, test, setup, teardown } from "mocha";

suite("Admin API tests", () => {
  // Diese Variablen halten die Daten (Email/Passwort) für den Login
  let adminCredentials: any;
  let regularCredentials: any;
  let createdAdmin: any;

  setup(async () => {
    await cleanDatabase();

    // 1. Admin erstellen & Daten speichern
    adminCredentials = getRandomUser(true); 
    createdAdmin = await localspotService.createUser(adminCredentials);
    
    // 2. Normalen User erstellen & Daten speichern
    regularCredentials = getRandomUser(false);
    await localspotService.createUser(regularCredentials);

    // Standardmäßig als Admin einloggen
    await localspotService.authenticate(adminCredentials);
  });

  teardown(async () => {
    await localspotService.clearAuth();
  });

  test("non-admin cannot list users", async () => {
    // Wechsel zum normalen User
    await localspotService.authenticate(regularCredentials);
    try {
      await localspotService.getAllUsers();
      assert.fail("Should not allow non-admin");
    } catch (error: any) {
      // 401 = Unauthorized, 403 = Forbidden
      assert.include([401, 403], error.response?.status);
    }
  });

  test("non-admin cannot delete user", async () => {
    // 1. Als Admin einloggen, um User-Liste zu sehen
    await localspotService.authenticate(adminCredentials);
    const users = await localspotService.getAllUsers();
    
    // Finde jemanden zum Löschen (der nicht der Admin selbst ist)
    const victim = users.find((u: User) => u.email === regularCredentials.email);

    // 2. Zurück zum normalen User wechseln
    await localspotService.authenticate(regularCredentials);
    try {
      if (victim) {
        await localspotService.deleteUser(victim._id || victim.id);
      }
      assert.fail("Should not allow non-admin to delete");
    } catch (error: any) {
      assert.include([401, 403], error.response?.status);
    }
  });

  test("admin delete user - bad id", async () => {
    await localspotService.authenticate(adminCredentials);
    try {
      await localspotService.deleteUser("bad-id");
      assert.fail("Should fail with 400 or 404");
    } catch (error: any) {
      assert.include([400, 404], error.response?.status);
    }
  });
});