import { assert } from "chai";
import { localspotService } from "./localspot-service.test.js";
import { decodeToken } from "../../src/api/jwt-utils.js";
import { cleanDatabase, getRandomUser } from "./test-helpers.test.js";
import { suite, test, setup, teardown } from "mocha";

suite("Authentication API tests", () => {
  let userInfo: any;

  setup(async () => {
    await cleanDatabase();
    // 1. Frischen User generieren
    userInfo = getRandomUser();
    // 2. User in DB anlegen (damit Login klappen kann)
    await localspotService.createUser(userInfo);
  });

  teardown(async () => {
    // Auth Header nach jedem Test löschen
    await localspotService.clearAuth();
  });

  test("authenticate", async () => {
    // Login mit dem generierten User
    const response = await localspotService.authenticate(userInfo);
    assert.isTrue(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
    const response = await localspotService.authenticate(userInfo);
    // Token dekodieren und prüfen, ob die Email stimmt
    // 'as any' verhindert den TypeScript Fehler beim Zugriff auf .email
    const decoded = decodeToken(response.token) as any;
    assert.equal(decoded.email, userInfo.email);
    assert.equal(decoded.userId, response.userId); // Falls deine API userId zurückgibt
  });

  test("check Unauthorized", async () => {
    // Sicherstellen, dass wir ausgeloggt sind
    await localspotService.clearAuth();
    try {
      // Versuch, eine geschützte Route aufzurufen (z.B. deleteAllUsers)
      await localspotService.deleteAllUsers();
      assert.fail("Route not protected");
    } catch (error: any) {
      // Wir erwarten 401 Unauthorized
      assert.equal(error.response.status, 401);
    }
  });
});