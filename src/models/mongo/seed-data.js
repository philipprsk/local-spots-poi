export const seedData = {
    
  // 1. CATEGORIES
  categories: {
    _model: "Category",
    nature: {
      name: "Nature",
      icon: "🌳",
      color: "#2ecc71"
    },
    food: {
      name: "Food & Drink",
      icon: "🍴",
      color: "#e74c3c"
    },
    culture: {
      name: "Culture",
      icon: "🏛️",
      color: "#f1c40f"
    },
    nightlife: {
      name: "Nightlife",
      icon: "🍸",
      color: "#9b59b6"
    }
  },

  // 2. USERS
  users: {
    _model: "User",
    homer: {
      firstName: "Homer",
      lastName: "Simpson",
      email: "homer@simpson.com",
      password: "secretpassword"
    },
    marge: {
      firstName: "Marge",
      lastName: "Simpson",
      email: "marge@simpson.com",
      password: "secretpassword"
    },
    bart: {
      firstName: "Bart",
      lastName: "Simpson",
      email: "bart@simpson.com",
      password: "secretpassword"
    },
    lisa: {
      firstName: "Lisa",
      lastName: "Simpson",
      email: "lisa@simpson.com",
      password: "secretpassword"
    }
  },

  // 3. LOCALSPOTS (Linked to Users and Categories)
  localspots: {
    _model: "Localspot",
    harbourCafe: {
      title: "Harbour Cafe",
      description: "Best coffee by the docks with a great view of the ships.",
      userid: "->users.bart",
      categories: ["->categories.food"],
      images: [{ url: "https://example.com/cafe.jpg", altText: "Coffee cup at the harbor" }]
    },
    englishGarden: {
      title: "English Garden",
      description: "A huge city park, perfect for a sunny afternoon.",
      userid: "->users.lisa",
      categories: ["->categories.nature"],
      images: [{ url: "https://example.com/park.jpg", altText: "Green meadow in the park" }]
    },
    moesTavern: {
      title: "Moe's Tavern",
      description: "Where everybody knows your name and the beer is cold.",
      userid: "->users.homer",
      categories: ["->categories.nightlife", "->categories.food"],
      images: [{ url: "https://example.com/moes.jpg", altText: "The dark interior of the tavern" }]
    },
    springfieldMuseum: {
      title: "Springfield Museum",
      description: "Discover the rich history of our town.",
      userid: "->users.marge",
      categories: ["->categories.culture"],
      images: [{ url: "https://example.com/museum.jpg", altText: "The museum entrance" }]
    }
  }
};