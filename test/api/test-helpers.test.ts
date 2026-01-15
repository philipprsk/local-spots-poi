// test/api/test-helpers.test.ts
import { db } from "../../src/models/db.js";
import { User } from "../../src/models/mongo/user.js"; 

export async function cleanDatabase() {
  console.log("--- Absolute Clean Start ---");
  
  await User.deleteMany({}); 
  await db.categoryStore.deleteAll();
  await db.localspotStore.deleteAllLocalSpots();
  

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
    password: "password", 
    isAdmin: isAdmin
  };
}