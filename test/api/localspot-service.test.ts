// test/api/localspot-service.test.ts
import axios from "axios";
import { serviceUrl } from "../fixtures.test.js";
import { User, LocalSpot } from "../../src/types/localspot-types.js";

export const localspotService = {
  localspotURL: serviceUrl,

  async authenticate(user: any) {
  // Add a safety check: if user is missing, don't try to access properties
  if (!user) {
    throw new Error("Authentication failed: No user data provided to service");
  }
  
  const credentials = {
    email: user.email,
    password: user.password
  };

  const response = await axios.post(`${this.localspotURL}/api/users/authenticate`, credentials);
  if (response.data.success && response.data.token) {
    axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
  }
  return response.data;
},

  async clearAuth() {
    axios.defaults.headers.common.Authorization = "";
  },

  // ... restliche Methoden bleiben gleich ...
  async createUser(user: User) {
    const res = await axios.post(`${this.localspotURL}/api/users`, user);
    return res.data;
  },
  
  async getUser(id: string) {
    const res = await axios.get(`${this.localspotURL}/api/users/${id}`);
    return res.data;
  },

  async getAllUsers() {
    const res = await axios.get(`${this.localspotURL}/api/users`);
    return res.data;
  },

  async deleteAllUsers() {
    const res = await axios.delete(`${this.localspotURL}/api/users`);
    return res.data;
  },

  async createLocalSpot(localspot: LocalSpot) {
    const res = await axios.post(`${this.localspotURL}/api/localspots`, localspot);
    return res.data;
  },

  async deleteAllLocalSpots() {
    const response = await axios.delete(`${this.localspotURL}/api/localspots`);
    return response.data;
  },

  async deleteLocalSpot(id: string) {
    const response = await axios.delete(`${this.localspotURL}/api/localspots/${id}`);
    return response;
  },

  async getAllLocalSpots() {
    const res = await axios.get(`${this.localspotURL}/api/localspots`);
    return res.data;
  },

  async getLocalSpot(id: string) {
    const res = await axios.get(`${this.localspotURL}/api/localspots/${id}`);
    return res.data;
  },

  // test/api/localspot-service.test.ts

  async createCategory(category: any) {
    const payload = {
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      color: category.color,
      // Hast du vielleicht 'isActive' im Schema, aber hier vergessen?
    };
    
    try {
      const res = await axios.post(`${this.localspotURL}/api/categories`, payload);
      return res.data;
    } catch (e: any) {
      // DIESER LOG RETTET UNS:
      console.log("CATEGORY ERROR DETAILS:", e.response?.data); 
      throw e;
    }
  },

  async getAllCategories() {
    const res = await axios.get(`${this.localspotURL}/api/categories`);
    return res.data;
  },

  async getCategory(id: string) {
    const res = await axios.get(`${this.localspotURL}/api/categories/${id}`);
    return res.data;
  },

  async deleteCategory(id: string) {
    const res = await axios.delete(`${this.localspotURL}/api/categories/${id}`);
    return res.data;
  },

  async deleteAllCategories() {
    const res = await axios.delete(`${this.localspotURL}/api/categories`);
    return res.data;
  },

  async uploadImage(localspotId: string, imageBuffer: Buffer) {
    const FormData = (await import("form-data")).default;
    const formData = new FormData();
    formData.append("imagefile", imageBuffer, "test.jpg");

    const res = await axios.post(
      `${this.localspotURL}/api/localspots/${localspotId}/image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    return res.data;
  },

  async deleteImage(localspotId: string) {
    const res = await axios.delete(`${this.localspotURL}/api/localspots/${localspotId}/image`);
    return res.data;
  },

  async deleteUser(id: string) {
    const response = await axios.delete(`${this.localspotURL}/api/users/${id}`);
    return response;
  }
};