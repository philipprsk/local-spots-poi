import axios from "axios";
import { serviceUrl } from "../fixtures.js";

export const localspotService = {
    localspotURL: serviceUrl,

  async createUser(user) {
    const res = await axios.post(`${this.localspotURL}/api/users`, user);
    return res.data;
  },

  async getUser(id) {
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

  async createLocalSpot(localspot) {
    const res = await axios.post(`${this.localspotURL}/api/localspots`, localspot);
    return res.data;
  },

  async deleteAllLocalSpots() {
    const response = await axios.delete(`${this.localspotURL}/api/localspots`);
    return response.data;
  },

  async deleteLocalSpot(id) {
    const response = await axios.delete(`${this.localspotURL}/api/localspots/${id}`);
    return response;
  },

  async getAllLocalSpots() {
    const res = await axios.get(`${this.localspotURL}/api/localspots`);
    return res.data;
  },

  async getLocalSpot(id) {
    const res = await axios.get(`${this.localspotURL}/api/localspots/${id}`);
    return res.data;
  },
};
