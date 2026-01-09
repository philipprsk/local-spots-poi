import axios from "axios";
import { serviceUrl } from "../fixtures.test";
import { User } from "../../src/types/models";
import { LocalSpot } from "../../src/types/models";

export const localspotService = {
  localspotURL: serviceUrl,

  async authenticate(user: { email: string; password: string }) {
    const response = await axios.post(`${this.localspotURL}/api/users/authenticate`, user);
    axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
    return response.data;
  },

  async clearAuth() {
    axios.defaults.headers.common.Authorization = "";
  },

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

  async createCategory(category: { name: string; description: string }) {
    const res = await axios.post(`${this.localspotURL}/api/categories`, category);
    return res.data;
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
  },


};