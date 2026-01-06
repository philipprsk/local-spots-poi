import { localspotService } from "./localspot-service.js";
import { adminUser, adminCredentials } from "../fixtures.js";

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