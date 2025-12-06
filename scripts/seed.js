// scripts/seed.js - Script to seed the database with initial data
const mongoose = require('mongoose');
require('dotenv').config();

const Jutsu = require('../models/jutsu');
const TimelineEvent = require('../models/Timeline');
const User = require('../models/user');

// Sample Jutsu Data
const sampleJutsus = [
  {
    name: "Wind Release: Cast Net",
    japaneseName: "Fūton: Kamaitachi",
    type: "Ninjutsu",
    nature: ["Wind"],
    rank: "B",
    classification: "Offensive",
    description: "A destructive jutsu that uses a giant fan to create violent gusts of wind capable of slicing through opponents. The wind is powerful enough to knock down trees and destroy rock formations.",
    handSeals: [],
    users: ["Temari"],
    firstAppearance: {
      manga: "Chapter 71",
      anime: "Episode 42"
    },
    powerLevel: 8,
    chakraCost: "High",
    animationData: {
      particleCount: 500,
      windDirection: "forward",
      intensity: 8,
      color: "#a8d8ea",
      duration: 3000
    },
    isSignature: true,
    tags: ["wind", "offensive", "fan-technique", "long-range"]
  },
  {
    name: "Wind Release: Great Cast Net",
    japaneseName: "Fūton: Daikamaitachi",
    type: "Ninjutsu",
    nature: ["Wind"],
    rank: "A",
    classification: "Offensive",
    description: "An advanced version of Cast Net that creates an even more devastating cyclone. This technique is powerful enough to level entire forests and can be used to counter large-scale attacks.",
    handSeals: [],
    users: ["Temari"],
    firstAppearance: {
      manga: "Chapter 214",
      anime: "Episode 125"
    },
    powerLevel: 9,
    chakraCost: "Very High",
    animationData: {
      particleCount: 1000,
      windDirection: "360",
      intensity: 10,
      color: "#7ec8e3",
      duration: 5000
    },
    isSignature: true,
    tags: ["wind", "offensive", "fan-technique", "devastating"]
  },
  {
    name: "Summoning: Quick Beheading Dance",
    japaneseName: "Kuchiyose: Kirikiri Mai",
    type: "Ninjutsu",
    nature: ["Wind"],
    rank: "B",
    classification: "Offensive",
    description: "Temari summons Kamatari, a one-eyed weasel wielding a giant sickle. The weasel creates whirlwinds with its sickle that can cut through anything in its path.",
    handSeals: ["Tiger", "Horse", "Boar", "Ram"],
    users: ["Temari"],
    firstAppearance: {
      manga: "Chapter 214",
      anime: "Episode 125"
    },
    powerLevel: 9,
    chakraCost: "High",
    animationData: {
      particleCount: 750,
      windDirection: "spiral",
      intensity: 9,
      color: "#ffffff",
      duration: 4000
    },
    isSignature: true,
    tags: ["summoning", "wind", "kamatari", "offensive"]
  },
  {
    name: "Wind Release: Dust Cloud Technique",
    japaneseName: "Fūton: Mugen Sajin Daitoppa",
    type: "Ninjutsu",
    nature: ["Wind"],
    rank: "B",
    classification: "Supplementary",
    description: "Creates a massive dust storm that blinds and disorients opponents while Temari remains unaffected. Often used to set up for a more devastating attack.",
    handSeals: [],
    users: ["Temari"],
    firstAppearance: {
      manga: "Chapter 555",
      anime: "Episode 313"
    },
    powerLevel: 6,
    chakraCost: "Medium",
    animationData: {
      particleCount: 2000,
      windDirection: "omnidirectional",
      intensity: 6,
      color: "#d4a574",
      duration: 6000
    },
    isSignature: false,
    tags: ["wind", "supplementary", "dust", "crowd-control"]
  },
  {
    name: "Wind Release: Sickle Weasel Technique",
    japaneseName: "Fūton: Kamaitachi no Jutsu",
    type: "Collaboration",
    nature: ["Wind"],
    rank: "A",
    classification: "Offensive",
    description: "A collaboration technique where Temari's wind combines with Kamatari's sickle slashes to create vacuum blades that can slice through virtually anything.",
    handSeals: [],
    users: ["Temari", "Kamatari"],
    firstAppearance: {
      manga: "Chapter 555",
      anime: "Episode 313"
    },
    powerLevel: 10,
    chakraCost: "Very High",
    animationData: {
      particleCount: 800,
      windDirection: "cutting-spiral",
      intensity: 10,
      color: "#e8f4f8",
      duration: 3500
    },
    isSignature: true,
    tags: ["wind", "collaboration", "kamatari", "vacuum-blade"]
  }
];

// Sample Timeline Events
const sampleTimelineEvents = [
  {
    title: "Birth in Sunagakure",
    era: "Pre-Academy",
    date: {
      arc: "Pre-Series"
    },
    description: "Temari is born as the eldest child of the Fourth Kazekage and older sister to Kankuro and Gaara. Growing up in the Sand Village, she witnesses the burden placed on her youngest brother as a jinchūriki.",
    significance: "Major",
    category: "Character Development",
    relatedCharacters: ["Gaara", "Kankuro", "Fourth Kazekage"],
    location: "Sunagakure",
    age: 0,
    order: 1
  },
  {
    title: "Chunin Exams Begin",
    era: "Chunin Exams",
    date: {
      arc: "Chunin Exams",
      episode: 20,
      chapter: 34
    },
    description: "Temari arrives in Konohagakure with her brothers for the Chunin Exams. Her confident demeanor and strategic mind immediately make an impression on the other participants.",
    significance: "Critical",
    category: "Mission",
    relatedCharacters: ["Gaara", "Kankuro", "Naruto", "Shikamaru"],
    location: "Konohagakure",
    age: 15,
    stats: {
      strength: 6,
      intelligence: 8,
      speed: 7,
      chakra: 7,
      taijutsu: 6,
      ninjutsu: 9
    },
    order: 2
  },
  {
    title: "Battle Against Tenten",
    era: "Chunin Exams",
    date: {
      arc: "Chunin Exams",
      episode: 42,
      chapter: 71
    },
    description: "Temari faces Tenten in the preliminary rounds, showcasing her wind release techniques and tactical superiority. She wins decisively, demonstrating why Sand Village ninjas are feared.",
    significance: "Major",
    category: "Battle",
    relatedCharacters: ["Tenten"],
    location: "Chunin Exam Stadium",
    age: 15,
    quotes: [{
      text: "I'll show you the difference between our levels.",
      speaker: "Temari"
    }],
    order: 3
  },
  {
    title: "Strategic Battle with Shikamaru",
    era: "Chunin Exams",
    date: {
      arc: "Chunin Exams",
      episode: 66,
      chapter: 107
    },
    description: "Temari battles Shikamaru Nara in what becomes one of the most tactical fights of the Chunin Exams. Though she technically wins when Shikamaru forfeits, she's impressed by his intelligence and strategy, marking the beginning of their complex relationship.",
    significance: "Critical",
    category: "Battle",
    relatedCharacters: ["Shikamaru"],
    location: "Chunin Exam Stadium",
    age: 15,
    quotes: [{
      text: "He's smarter than he looks. I underestimated him.",
      speaker: "Temari"
    }],
    order: 4
  },
  {
    title: "Assisting Konoha Against Orochimaru",
    era: "Chunin Exams",
    date: {
      arc: "Konoha Crush",
      episode: 77,
      chapter: 135
    },
    description: "Following Gaara's transformation and the invasion of Konoha, Temari witnesses the bond between Naruto and her brother. She begins to see a path toward redemption for Gaara and a better future for Sunagakure.",
    significance: "Critical",
    category: "Character Development",
    relatedCharacters: ["Gaara", "Naruto", "Kankuro"],
    location: "Forest near Konohagakure",
    age: 15,
    order: 5
  },
  {
    title: "Sasuke Recovery Mission",
    era: "Sasuke Retrieval",
    date: {
      arc: "Sasuke Recovery Mission",
      episode: 125,
      chapter: 214
    },
    description: "Temari arrives to help the Konoha ninja in their mission to retrieve Sasuke. She saves Shikamaru from Tayuya using her wind techniques and summoning jutsu, solidifying the alliance between Sand and Leaf villages.",
    significance: "Major",
    category: "Mission",
    relatedCharacters: ["Shikamaru", "Tayuya"],
    location: "Forest of Death",
    age: 15,
    order: 6
  },
  {
    title: "Kazekage Rescue Mission",
    era: "Shippuden",
    date: {
      arc: "Kazekage Rescue Mission",
      episode: 10,
      chapter: 249
    },
    description: "When Gaara is kidnapped by the Akatsuki, Temari shows her deep concern for her brother and works alongside Konoha ninja to rescue him. Her emotional growth is evident as she confronts the possibility of losing Gaara.",
    significance: "Critical",
    category: "Mission",
    relatedCharacters: ["Gaara", "Naruto", "Kankuro", "Chiyo"],
    location: "Land of Rivers",
    age: 18,
    stats: {
      strength: 7,
      intelligence: 9,
      speed: 7,
      chakra: 8,
      taijutsu: 7,
      ninjutsu: 9
    },
    order: 7
  },
  {
    title: "Fourth Shinobi World War",
    era: "War Arc",
    date: {
      arc: "Fourth Shinobi World War",
      episode: 265,
      chapter: 516
    },
    description: "Temari fights as part of the Allied Shinobi Forces, using her wind release to devastating effect against the White Zetsu Army. Her tactical skills prove invaluable in coordinating large-scale operations.",
    significance: "Critical",
    category: "Battle",
    relatedCharacters: ["Allied Shinobi Forces"],
    location: "Battlefield",
    age: 19,
    order: 8
  },
  {
    title: "Marriage to Shikamaru",
    era: "Post-War",
    date: {
      arc: "Post-War"
    },
    description: "Temari marries Shikamaru Nara, bringing together the Sand and Leaf villages through their union. She moves to Konohagakure while maintaining her role as an ambassador for Sunagakure.",
    significance: "Critical",
    category: "Relationship",
    relatedCharacters: ["Shikamaru"],
    location: "Konohagakure",
    age: 21,
    order: 9
  },
  {
    title: "Birth of Shikadai",
    era: "Boruto",
    date: {
      arc: "Boruto: Naruto Next Generations"
    },
    description: "Temari becomes a mother to Shikadai Nara, who inherits his father's intelligence and her wind nature. She balances her roles as a mother, wife, and diplomatic representative with grace.",
    significance: "Major",
    category: "Personal Achievement",
    relatedCharacters: ["Shikamaru", "Shikadai"],
    location: "Konohagakure",
    age: 23,
    order: 10
  },
  {
    title: "Active Diplomatic Work",
    era: "Boruto",
    date: {
      arc: "Boruto: Naruto Next Generations"
    },
    description: "Temari continues her work as a diplomat and advisor, helping maintain peace between the villages. Her experience and strategic mind make her invaluable in the new era of shinobi cooperation.",
    significance: "Moderate",
    category: "Diplomatic",
    relatedCharacters: ["Gaara", "Naruto", "Shikamaru"],
    location: "Various Villages",
    age: 32,
    stats: {
      strength: 7,
      intelligence: 10,
      speed: 7,
      chakra: 8,
      taijutsu: 7,
      ninjutsu: 9
    },
    order: 11
  }
];
// Connect to MongoDB - UPDATED
console.log('Connecting to MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(' Connected to MongoDB Atlas!');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Seed function
async function seedDatabase() {
  try {
    console.log(' Starting database seeding...');

    // Clear existing data
    console.log('Clearing existing data...');
    await Jutsu.deleteMany({});
    await TimelineEvent.deleteMany({});
    await User.deleteMany({});

    // Seed Jutsus
    console.log('Seeding jutsus...');
    await Jutsu.insertMany(sampleJutsus);
    console.log(`${sampleJutsus.length} jutsus created`);

    // Seed Timeline Events
    console.log('Seeding timeline events...');
    await TimelineEvent.insertMany(sampleTimelineEvents);
    console.log(`${sampleTimelineEvents.length} timeline events created`);

    // Create sample admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      username: 'temari_admin',
      email: 'admin@temari-app.com',
      password: 'WindRelease123!',
      profile: {
        bio: 'Official Temari Application Administrator',
        favoriteCharacter: 'Temari',
        favoriteJutsu: 'Wind Release: Cast Net',
        rank: 'Kage',
        village: 'Sunagakure'
      },
      isAdmin: true,
      isModerator: true
    });
    await adminUser.save();
    console.log(' Admin user created (username: temari_admin, password: WindRelease123!)');

    // Create sample regular user
    console.log('Creating sample user...');
    const sampleUser = new User({
      username: 'shikatema_fan',
      email: 'user@temari-app.com',
      password: 'ShikaTemari123!',
      profile: {
        bio: 'Huge fan of Temari and Shikamaru\'s relationship!',
        favoriteCharacter: 'Temari',
        favoriteJutsu: 'Summoning: Quick Beheading Dance',
        rank: 'Chunin',
        village: 'Konohagakure'
      }
    });
    await sampleUser.save();
    console.log(' Sample user created (username: shikatema_fan, password: ShikaTemari123!)');

    console.log('\n Database seeding completed successfully!');
    console.log('\nYou can now start the server with: npm start or npm run dev');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}