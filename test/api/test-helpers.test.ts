import { localspotService } from "./localspot-service.test";
import { adminUser, adminCredentials } from "../fixtures.test";

export async function setupTestDatabase() {
  localspotService.clearAuth();
  try {
    await localspotService.authenticate(adminCredentials);
  } catch {
    await localspotService.createUser(adminUser);
    await localspotService.authenticate(adminCredentials);
  }
  await localspotService.deleteAllLocalSpots();
  await localspotService.deleteAllCategories(); // <- Kategorien auch leeren
  await localspotService.deleteAllUsers();
  await localspotService.createUser(adminUser);
  await localspotService.authenticate(adminCredentials);
}