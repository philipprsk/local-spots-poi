import { assert } from "chai";
import fs from "fs";
import path from "path";
import { localspotService } from "./localspot-service.js";
import { maggie, maggieCredentials } from "../fixtures.js";

suite("Image API tests", () => {
  let user;
  let localspot;

  setup(async () => {
    localspotService.clearAuth();
    await localspotService.createUser(maggie);
    await localspotService.authenticate(maggieCredentials);
    await localspotService.deleteAllLocalSpots();
    
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
    
    const updatedSpot = await localspotService.uploadImage(localspot._id, imageBuffer);
    assert.isDefined(updatedSpot.img);
    assert.isDefined(updatedSpot.imgPublicId);
    assert.isTrue(updatedSpot.img.includes("cloudinary"));
  });

  test("delete image from localspot", async () => {
    const imagePath = path.join(process.cwd(), "test", "fixtures", "test-image.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    
    await localspotService.uploadImage(localspot._id, imageBuffer);
    const deletedSpot = await localspotService.deleteImage(localspot._id);
    
    assert.isNull(deletedSpot.img);
    assert.isNull(deletedSpot.imgPublicId);
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