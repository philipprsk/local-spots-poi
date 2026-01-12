// test/api/test-helpers.test.ts
import { db } from "../../src/models/db.js";
import { User } from "../../src/models/mongo/user.js"; // Importiere das Mongoose Model direkt

export async function cleanDatabase() {
  console.log("--- Absolute Clean Start ---");
  // Wir umgehen den Store und löschen direkt via Mongoose
  await User.deleteMany({}); 
  await db.categoryStore.deleteAll();
  await db.localspotStore.deleteAllLocalSpots();
  
  // 150ms Puffer für Atlas Indizes
  await new Promise((resolve) => setTimeout(resolve, 150));
  console.log("--- Absolute Clean Finished ---");
}

// test/api/test-helpers.test.ts
export function getRandomUser(isAdmin = false) {
  const id = Math.floor(Math.random() * 10000);
  return {
    firstName: `Test-${id}`,
    lastName: `User-${id}`,
    email: `user-${id}@test.com`,
    password: "password", // Nutze ein einfaches, festes Passwort für Tests
    isAdmin: isAdmin
  };
}