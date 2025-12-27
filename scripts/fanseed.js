// scripts/fanseed.js:  Script to seed the database with sample fan art
const mongoose = require('mongoose');
require('dotenv').config();

const FanArt = require('../models/FanArt');

// Sample Fan Art Data
const sampleFanArt = [
  {
    title: "Temari Wind Master",
    artist: {
      name: "TemariFanArt",
      socialLinks: {
        twitter: "https://x.com/ArtTemari54461",
        instagram: "https://www.instagram.com/temari_nara_fanart_bug/"
      }
    },
    imageUrl: "https://pbs.twimg.com/media/G8ogykiXwAAPJ4M?format=jpg&name=small",
    thumbnailUrl: `https://images.weserv.nl/?url=${"https://pbs.twimg.com/media/G8ogykiXwAAPJ4M?format=jpg&name=small"}&w=400&h=300&fit=cover`,
    style: "Digital",
    era: "Shippuden",
    tags: ["wind-release", "temari", "powerful"],
    featuring: ["Temari"],
    isShikaTemari: false,
    description: "Temari channeling her wind release chakra in full power mode",
    likes: 150,
    featured: true,
    approved: true,
    views: 1200
  },
  {
    title: "Shikamaru and Temari Moment",
    artist: {
      name: "TemariFanArt",
      socialLinks: {
        instagram: "https://www.instagram.com/temari_nara_fanart_bug/"
      }
    },
    imageUrl: "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/603939011_17848125363604926_5490080556042013013_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ig_cache_key=Mzc5MTk2MTI3MTAxNzQ3MzAwNA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjgwMHg4MDAuc2RyLkMzIn0%3D&_nc_ohc=0vWjgBhKzzsQ7kNvwHNzDH-&_nc_oc=AdldEfFAviE7XQfK-hHu0DBwxNMyXry5wRpYhn2qjDD2D8REVHMEw-oloVTCpnjURkM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_gid=Rj-K5N939YmyLM0UBLD6Hw&oh=00_Afne8O0LxZsp5YH1o1PQAd-ZLRfM2Ic4FA91l1FRjguipw&oe=6954E705",
    thumbnailUrl: `https://images.weserv.nl/?url=${"https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/603939011_17848125363604926_5490080556042013013_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ig_cache_key=Mzc5MTk2MTI3MTAxNzQ3MzAwNA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjgwMHg4MDAuc2RyLkMzIn0%3D&_nc_ohc=0vWjgBhKzzsQ7kNvwHNzDH-&_nc_oc=AdldEfFAviE7XQfK-hHu0DBwxNMyXry5wRpYhn2qjDD2D8REVHMEw-oloVTCpnjURkM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_gid=Rj-K5N939YmyLM0UBLD6Hw&oh=00_Afne8O0LxZsp5YH1o1PQAd-ZLRfM2Ic4FA91l1FRjguipw&oe=6954E705"}&w=400&h=300&fit=cover`,
    style: "Digital",
    era: "The Last",
    tags: ["shikamaru", "temari", "romance", "couple"],
    featuring: ["Temari", "Shikamaru"],
    isShikaTemari: true,
    description: "A romantic moment between Shikamaru and Temari",
    likes: 280,
    featured: true,
    approved: true,
    views: 2100
  },
  {
    title: "Temari Battle Ready",
    artist: {
      name: "TemariFanArt",
      socialLinks: {
        twitter: "https://x.com/ArtTemari54461",
      }
    },
    imageUrl: "https://pbs.twimg.com/media/G8ok3CXWcAAtZoA?format=jpg&name=medium",
    thumbnailUrl: `https://images.weserv.nl/?url=${"https://pbs.twimg.com/media/G8ok3CXWcAAtZoA?format=jpg&name=medium"}&w=400&h=300&fit=cover`,
    style: "Digital",
    era: "Part 1",
    tags: ["battle", "chunin-exams", "fan"],
    featuring: ["Temari"],
    isShikaTemari: false,
    description: "Temari during the intense Chunin Exams battles",
    likes: 95,
    featured: false,
    approved: true,
    views: 650
  },
  {
    title: "Fan Technique Showcase",
    artist: {
      name: "TemariFanArt",
      socialLinks: {
        deviantArt: "https://www.deviantart.com/temarifanart"
      }
    },
    imageUrl: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c4cedfb6-215f-4462-a1d9-32296acd8eac/dl4leyd-4dd677cf-0332-41b4-b0e8-aff8830ecf6e.jpg/v1/fit/w_800,h_1200,q_70,strp/detailed_artwork_of_temari_s_wind_release_techniqu_by_temarifanart_dl4leyd-414w-2x.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTIwMCIsInBhdGgiOiIvZi9jNGNlZGZiNi0yMTVmLTQ0NjItYTFkOS0zMjI5NmFjZDhlYWMvZGw0bGV5ZC00ZGQ2NzdjZi0wMzMyLTQxYjQtYjBlOC1hZmY4ODMwZWNmNmUuanBnIiwid2lkdGgiOiI8PTgwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.gavPr1oooISIUWf0NB6n4xjDNFaeN9AKTcrN9HqGuGc",
    thumbnailUrl: `https://images.weserv.nl/?url=${"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c4cedfb6-215f-4462-a1d9-32296acd8eac/dl4leyd-4dd677cf-0332-41b4-b0e8-aff8830ecf6e.jpg/v1/fit/w_800,h_1200,q_70,strp/detailed_artwork_of_temari_s_wind_release_techniqu_by_temarifanart_dl4leyd-414w-2x.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTIwMCIsInBhdGgiOiIvZi9jNGNlZGZiNi0yMTVmLTQ0NjItYTFkOS0zMjI5NmFjZDhlYWMvZGw0bGV5ZC00ZGQ2NzdjZi0wMzMyLTQxYjQtYjBlOC1hZmY4ODMwZWNmNmUuanBnIiwid2lkdGgiOiI8PTgwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.gavPr1oooISIUWf0NB6n4xjDNFaeN9AKTcrN9HqGuGc"}&w=400&h=300&fit=cover`,
    style: "Digital",
    era: "Shippuden",
    tags: ["wind-release", "jutsu", "technique"],
    featuring: ["Temari"],
    isShikaTemari: false,
    description: "Detailed artwork of Temari's wind release techniques in action",
    likes: 210,
    featured: true,
    approved: true,
    views: 1850
  },
  {
    title: "Temari Cosplay",
    artist: {
      name: "naruto_cosplay_off",
      socialLinks: {
        instagram: "https://www.instagram.com/naruto_cosplay_off/"
      }
    },
    imageUrl: "https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/527309625_18093113302654451_4469554320847518707_n.webp?_nc_cat=104&ig_cache_key=MzY4OTg5Nzk3MzM4ODkzNjY5MA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwODB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=QEOHCJGYv5MQ7kNvwGTd4KN&_nc_oc=Adm0LqOPl_ayRRbVGZzkCeTLRxxGkEmOykGS7w08RraqoZg-DM535E50Pc1_Jna7EZM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_gid=ws02Tz3dpwcxyFfFRMcnDQ&oh=00_Afl8Bwpfc-ONvCMNml3wSN9s4dT2pSKqrxyxf9mtjCEW5w&oe=6954D8EE",
    thumbnailUrl: `https://images.weserv.nl/?url=${"https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/527309625_18093113302654451_4469554320847518707_n.webp?_nc_cat=104&ig_cache_key=MzY4OTg5Nzk3MzM4ODkzNjY5MA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwODB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=QEOHCJGYv5MQ7kNvwGTd4KN&_nc_oc=Adm0LqOPl_ayRRbVGZzkCeTLRxxGkEmOykGS7w08RraqoZg-DM535E50Pc1_Jna7EZM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_gid=ws02Tz3dpwcxyFfFRMcnDQ&oh=00_Afl8Bwpfc-ONvCMNml3wSN9s4dT2pSKqrxyxf9mtjCEW5w&oe=6954D8EE"}&w=400&h=300&fit=cover`,
    style: "Cosplay",
    era: "Shippuden",
    tags: ["cosplay", "costume", "photoshoot"],
    featuring: ["Temari"],
    isShikaTemari: false,
    description: "Amazing Temari cosplay with detailed fan costume",
    likes: 320,
    featured: true,
    approved: true,
    views: 2500
  },
  {
    title: "Temari Sketch",
    artist: {
      name: "SketchMaster",
      socialLinks: {
        instagram: "https://www.instagram.com/temari_nara_fanart_bug/"
      }
    },
    imageUrl: "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/607759024_17849318436604926_4359388235273075409_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ig_cache_key=Mzc5NjQ0Nzc1MzYzOTkyODY0Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjgwMHg4MDAuc2RyLkMzIn0%3D&_nc_ohc=1zJ8mz8sZUwQ7kNvwHzo3vK&_nc_oc=AdnQpnSKKWmwHnTkiA8qqwpdJY6mUT6Bj-mBNw_8C0VydUXCyP4zaNx2zUTDkkjrAaA&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_gid=3nBs-nQW4CMGqPP8UTMFgA&oh=00_AflOeBor6F67vM1ECOWUvJNSfYd-zwFGcqfZ3_O6P1f_8Q&oe=6954F9AC",
    thumbnailUrl: `https://images.weserv.nl/?url=${"https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/607759024_17849318436604926_4359388235273075409_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ig_cache_key=Mzc5NjQ0Nzc1MzYzOTkyODY0Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjgwMHg4MDAuc2RyLkMzIn0%3D&_nc_ohc=1zJ8mz8sZUwQ7kNvwHzo3vK&_nc_oc=AdnQpnSKKWmwHnTkiA8qqwpdJY6mUT6Bj-mBNw_8C0VydUXCyP4zaNx2zUTDkkjrAaA&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_gid=3nBs-nQW4CMGqPP8UTMFgA&oh=00_AflOeBor6F67vM1ECOWUvJNSfYd-zwFGcqfZ3_O6P1f_8Q&oe=6954F9AC"}&w=400&h=300&fit=cover`,
    style: "Sketch",
    era: "Part 1",
    tags: ["sketch", "character", "study"],
    featuring: ["Temari"],
    isShikaTemari: false,
    description: "Character study sketch of adult Temari",
    likes: 125,
    featured: false,
    approved: true,
    views: 890
  },
  {
    title: "Temari 3D Model",
    artist: {
      name: "TemariFanArt",
      socialLinks: {
        twitter: "https://x.com/ArtTemari54461",
      }
    },
    imageUrl: "https://pbs.twimg.com/media/G8orErjWwAAxJxK?format=png&name=small",
    thumbnailUrl: `https://images.weserv.nl/?url=${"https://pbs.twimg.com/media/G8orErjWwAAxJxK?format=png&name=small"}&w=400&h=300&fit=cover`,
    style: "3D Model",
    era: "Shippuden",
    tags: ["3d-model", "render", "character"],
    featuring: ["Temari"],
    isShikaTemari: false,
    description: "High-quality 3D render of Temari in her combat outfit",
    likes: 380,
    featured: true,
    approved: true,
    views: 3200
  }
];

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB!');
    seedFanArt();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Seed function
async function seedFanArt() {
  try {
    console.log('Starting fan art seeding...');

    // Clear existing fan art
    console.log('Clearing existing fan art...');
    await FanArt.deleteMany({});

    // Insert sample fan art
    console.log('Inserting sample fan art...');
    const created = await FanArt.insertMany(sampleFanArt);
    console.log(`${created.length} fan art pieces created successfully!`);

    // Display summary
    console.log('\nFan Art Seeding Summary:');
    console.log(`  - Total pieces: ${created.length}`);
    console.log(`  - Featured: ${sampleFanArt.filter(f => f.featured).length}`);
    console.log(`  - ShikaTemari: ${sampleFanArt.filter(f => f.isShikaTemari).length}`);
    
    const styles = [...new Set(sampleFanArt.map(f => f.style))];
    console.log(`  - Styles: ${styles.join(', ')}`);
    
    console.log('\nFan art database seeding completed!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding fan art:', error);    await mongoose.connection.close();
    process.exit(1);
  }
}