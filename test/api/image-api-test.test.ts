import { assert } from "chai";
import fs from "fs";
import path from "path";
import { localspotService } from "./localspot-service.test";
import { maggie, maggieCredentials } from "../fixtures.test";
import { User } from "../../src/types/localspot-types";
import { LocalSpot } from "../../src/types/localspot-types";

describe("Image API tests", function() {
  this.timeout(15000); // globaler Timeout für diese Suite

  let user: User;
  let localspot: LocalSpot;

  beforeEach(async () => {
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

  it("upload image to localspot", async () => {
    const imagePath = path.join(process.cwd(), "test", "fixtures", "test-image.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    
   if (!localspot._id) throw new Error("localspot._id is undefined");
    const updatedSpot = await localspotService.uploadImage(localspot._id, imageBuffer);
    assert.isDefined(updatedSpot.img);
    assert.isDefined(updatedSpot.imgPublicId);
    assert.isTrue(updatedSpot.img.includes("cloudinary"));
  });

  it("delete image from localspot", async function() {
    this.timeout(15000); // Test-spezifischer Timeout
    
    const imagePath = path.join(process.cwd(), "test", "fixtures", "test-image.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    
    if (!localspot._id) throw new Error("localspot._id is undefined");
    const updatedSpot = await localspotService.uploadImage(localspot._id, imageBuffer);
    const deletedSpot = await localspotService.deleteImage(localspot._id);
    
    assert.isNull(deletedSpot.img);
    assert.isNull(deletedSpot.imgPublicId);
  });

  it("upload image - bad localspot id", async () => {
    const imagePath = path.join(process.cwd(), "test", "fixtures", "test-image.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    
    try {
      await localspotService.uploadImage("bad-id", imageBuffer);
      assert.fail("Should not upload image");
    } catch (error) {
      assert.isDefined(error);
    }
  });

  it("delete image - bad localspot id", async () => {
    try {
      await localspotService.deleteImage("bad-id");
      assert.fail("Should not delete image");
    } catch (error: any) {
      assert.isDefined(error.response);
    }
  });
});