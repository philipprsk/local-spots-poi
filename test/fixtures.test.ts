import { LocalSpot } from "../src/types/models";


export const serviceUrl = "http://localhost:3000";

// --- Users ---
export const maggie = {
  firstName: "Maggie",
  lastName: "Simpson",
  email: "maggie@example.com",
  password: "secret",
};

export const maggieCredentials = {
  email: maggie.email,
  password: maggie.password,
};

export const adminUser = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@localspots.com",
  password: "secret",
  isAdmin: true,
};
export const adminCredentials = {
  email: "admin@localspots.com",
  password: "secret",
};

export const testUsers = [
  {
    firstName: "Homer",
    lastName: "Simpson",
    email: "homer@example.com",
    password: "secret",
  },
  {
    firstName: "Marge",
    lastName: "Simpson",
    email: "marge@example.com",
    password: "secret",
  },
  {
    firstName: "Bart",
    lastName: "Simpson",
    email: "bart@example.com",
    password: "secret",
  },
];

// --- Localspots ---

export const harbourCafe: LocalSpot = {
  title: "Harbour Cafe",
  description: "Gemütliches Café am Hafen",
  latitude: 53.5511,
  longitude: 9.9937,
  // userid ist optional und kann später gesetzt werden
};

export const testLocalSpots: LocalSpot[] = [
  {
    title: "Spot 1",
    description: "Beschreibung 1",
    latitude: 53.55,
    longitude: 9.99,
    // userid optional
  },
  
  {
    title: "Spot 2",
    description: "Description 2",
    latitude: 52.5202,
    longitude: 13.4052,
  },
  {
    title: "Spot 3",
    description: "Description 3",
    latitude: 52.5203,
    longitude: 13.4053,
  },
  {
    title: "Spot 4",
    description: "Description 4",
    latitude: 52.5204,
    longitude: 13.4054,
  },
  {
    title: "Spot 5",
    description: "Description 5",
    latitude: 52.5205,
    longitude: 13.4055,
  },
  {
    title: "Spot 6",
    description: "Description 6",
    latitude: 52.5206,
    longitude: 13.4056,
  },
  {
    title: "Spot 7",
    description: "Description 7",
    latitude: 52.5207,
    longitude: 13.4057,
  },
];