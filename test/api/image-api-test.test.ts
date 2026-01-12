import { assert } from "chai";
import fs from "fs";
import path from "path";
import { localspotService } from "./localspot-service.test.js";
import { cleanDatabase, getRandomUser } from "./test-helpers.test.js";
import { LocalSpot } from "../../src/types/localspot-types.js";
import { suite, test, setup } from "mocha";

suite("Image API tests", function() {
  this.timeout(15000); 

  let userData: any;
  let localspot: LocalSpot;

  setup(async () => {
    await cleanDatabase();
    
    // Random User erstellen
    userData = getRandomUser();
    await localspotService.createUser(userData);
    await localspotService.authenticate(userData);
    
    localspot = await localspotService.createLocalSpot({
      title: "Test Spot",
      description: "For image testing",
      latitude: 52.52,
      longitude: 13.405,
    });
  });

  test("upload image to localspot", async () => {
    const imagePath = path.join(process.cwd(), "test", "fixtures", "test-image.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    
    if (!localspot._id) throw new Error("localspot._id is undefined");
    
    const updatedSpot = await localspotService.uploadImage(localspot._id, imageBuffer);
    assert.isDefined(updatedSpot.img);
    assert.isDefined(updatedSpot.imgPublicId);
    assert.isTrue(updatedSpot.img.includes("cloudinary"));
  });


  test("upload image - bad localspot id", async () => {
    const imagePath = path.join(process.cwd(), "test", "fixtures", "test-image.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    
    try {
      await localspotService.uploadImage("bad-id", imageBuffer);
      assert.fail("Should not upload image");
    } catch (error) {
      assert.isDefined(error);
    }
  });
});