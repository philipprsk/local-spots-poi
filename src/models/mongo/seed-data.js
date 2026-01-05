export const seedData = {
  categories: {
    _model: "Category",
    nature: {
      name: "Nature",
      slug: "nature",
      icon: "🌳",
      description: "Natural spots and parks"
    },
    food: {
      name: "Food & Drink",
      slug: "food-drink",
      icon: "🍴",
      description: "Restaurants and cafes"
    },
    culture: {
      name: "Culture",
      slug: "culture",
      icon: "🏛️",
      description: "Museums and cultural sites"
    },
    nightlife: {
      name: "Nightlife",
      slug: "nightlife",
      icon: "🍸",
      description: "Bars and clubs"
    }
  },
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
  localspots: {
    _model: "Localspot",
    harbourCafe: {
      title: "Harbour Cafe",
      description: "Best coffee by the docks with a great view of the ships.",
      latitude: 48.1372,
      longitude: 11.5819,
      userid: "->users.bart",
      category: "->categories.food"
    },
    englishGarden: {
      title: "English Garden",
      description: "A huge city park, perfect for a sunny afternoon.",
      latitude: 48.1641,
      longitude: 11.5833,
      userid: "->users.lisa",
      category: "->categories.nature"
    },
    moesTavern: {
      title: "Moe's Tavern",
      description: "Where everybody knows your name and the beer is cold.",
      latitude: 48.1351,
      longitude: 11.5823,
      userid: "->users.homer",
      category: "->categories.nightlife"
    },
    springfieldMuseum: {
      title: "Springfield Museum",
      description: "Discover the rich history of our town.",
      latitude: 48.1442,
      longitude: 11.5761,
      userid: "->users.marge",
      category: "->categories.culture"
    }
  }
};