// scripts/fanseed.js 
const mongoose = require('mongoose');
require('dotenv').config();

const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');

const FanArt = require('../models/FanArt');
const User = require('../models/user');

const THUMB_DIR = path.resolve(__dirname, '..', 'public', 'uploads', 'thumbnails');

// Use weserv.nl as a CORS proxy
function buildWeServURL(srcUrl, opts = { w: 400, h: 300, fit: 'cover' }) {
  if (!srcUrl) return '';
  return `https://images.weserv.nl/?url=${encodeURIComponent(srcUrl)}&w=${opts.w}&h=${opts.h}&fit=${opts.fit}`;
}

async function downloadImageBuffer(url) {
  if (!url) return null;

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 50_000_000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status === 200 && response.data) {
      return Buffer.from(response.data);
    }
    return null;
  } catch (err) {
    console.warn(`Failed to download image from ${url}:`, err.message);
    return null;
  }
}

function makeThumbFilename(titleOrId, ext = 'jpg') {
  const base = slugify(String(titleOrId).slice(0, 60), { lower: true, strict: true }) || 'img';
  const ts = Date.now().toString(36);
  return `${base}-${ts}.${ext}`;
}

async function createThumbnailFromBuffer(buffer, outPath) {
  try {
    await sharp(buffer)
      .resize(400, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(outPath);
    return true;
  } catch (err) {
    console.warn(`Failed to create thumbnail: ${err.message}`);
    return false;
  }
}


const getSampleFanArt = (adminUserId) => {
  return [
    {
      title: "Temari Wind Master",
      artist: {
        name: "TemariFanArt",
        userId: adminUserId,
        socialLinks: {
          twitter: "https://x.com/ArtTemari54461",
          instagram: "https://www.instagram.com/temari_nara_fanart_bug/"
        }
      },
      imageUrl: "https://pbs.twimg.com/media/G8ogykiXwAAPJ4M?format=jpg&name=small",
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
        userId: adminUserId,
        socialLinks: {
          instagram: "https://www.instagram.com/temari_nara_fanart_bug/"
        }
      },
      imageUrl:
        "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/603939011_17848125363604926_5490080556042013013_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ig_cache_key=Mzc5MTk2MTI3MTAxNzQ3MzAwNA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjgwMHg4MDAuc2RyLkMzIn0%3D&_nc_ohc=0vWjgBhKzzsQ7kNvwHNzDH-&_nc_oc=AdldEfFAviE7XQfK-hHu0DBwxNMyXry5wRpYhn2qjDD2D8REVHMEw-oloVTCpnjURkM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_gid=Rj-K5N939YmyLM0UBLD6Hw&oh=00_Afne8O0LxZsp5YH1o1PQAd-ZLRfM2Ic4FA91l1FRjguipw&oe=6954E705",
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
        userId: adminUserId,
        socialLinks: {
          twitter: "https://x.com/ArtTemari54461"
        }
      },
      imageUrl: "https://pbs.twimg.com/media/G8ok3CXWcAAtZoA?format=jpg&name=medium",
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
      title: "Temari Cosplay",
      artist: {
        name: "naruto_cosplay_off",
        userId: adminUserId,
        socialLinks: {
          instagram: "https://www.instagram.com/naruto_cosplay_off/"
        }
      },
      imageUrl:
        "https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/527309625_18093113302654451_4469554320847518707_n.webp?_nc_cat=104&ig_cache_key=MzY4OTg5Nzk3MzM4ODkzNjY5MA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwODB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=QEOHCJGYv5MQ7kNvwGTd4KN&_nc_oc=Adm0LqOPl_ayRRbVGZzkCeTLRxxGkEmOykGS7w08RraqoZg-DM535E50Pc1_Jna7EZM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_gid=ws02Tz3dpwcxyFfFRMcnDQ&oh=00_Afl8Bwpfc-ONvCMNml3wSN9s4dT2pSKqrxyxf9mtjCEW5w&oe=6954D8EE",
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
        userId: adminUserId,
        socialLinks: {
          instagram: "https://www.instagram.com/temari_nara_fanart_bug/"
        }
      },
      imageUrl:
        "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/607759024_17849318436604926_4359388235273075409_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ig_cache_key=Mzc5NjQ0Nzc1MzYzOTkyODY0Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjgwMHg4MDAuc2RyLkMzIn0%3D&_nc_ohc=1zJ8mz8sZUwQ7kNvwHzo3vK&_nc_oc=AdnQpnSKKWmwHnTkiA8qqwpdJY6mUT6Bj-mBNw_8C0VydUXCyP4zaNx2zUTDkkjrAaA&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_gid=3nBs-nQW4CMGqPP8UTMFgA&oh=00_AflOeBor6F67vM1ECOWUvJNSfYd-zwFGcqfZ3_O6P1f_8Q&oe=6954F9AC",
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
        userId: adminUserId,
        socialLinks: {
          twitter: "https://x.com/ArtTemari54461"
        }
      },
      imageUrl: "https://pbs.twimg.com/media/G8orErjWwAAxJxK?format=png&name=small",
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
};

async function seedFanArt() {
  try {
    console.log('Ensuring thumbnail directory exists:', THUMB_DIR);
    await fs.ensureDir(THUMB_DIR);

    console.log('Starting fan art seeding with thumbnails...');
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('Admin user not found. Run seed script first.');
      process.exit(1);
    }

    const items = getSampleFanArt(adminUser._id);

    console.log('Clearing existing fan art...');
    await FanArt.deleteMany({});

    const toInsert = [];

    for (const it of items) {
      console.log(`\nProcessing: ${it.title}`);

      // Try downloading the image
      const buffer = await downloadImageBuffer(it.imageUrl);
      
      if (!buffer) {
        console.log(`Could not download image, using weserv.nl proxy`);
        const proxyUrl = buildWeServURL(it.imageUrl);
        toInsert.push({ ...it, thumbnailUrl: proxyUrl });
        continue;
      }

      // Try creating a local thumbnail
      const filename = makeThumbFilename(it.title, 'jpg');
      const outPath = path.join(THUMB_DIR, filename);
      const publicUrlPath = `/uploads/thumbnails/${filename}`;

      const thumbCreated = await createThumbnailFromBuffer(buffer, outPath);
      
      if (thumbCreated) {
        console.log(`Local thumbnail created: ${publicUrlPath}`);
        toInsert.push({ ...it, thumbnailUrl: publicUrlPath });
      } else {
        // Fallback to weserv.nl proxy if sharp fails
        console.log(`Sharp failed, using weserv.nl proxy as fallback`);
        const proxyUrl = buildWeServURL(it.imageUrl);
        toInsert.push({ ...it, thumbnailUrl: proxyUrl });
      }
    }

    const created = await FanArt.insertMany(toInsert);
    console.log(`\nInserted ${created.length} FanArt records with thumbnails.`);
    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  } finally {
    await mongoose.connection.close();
  }
}

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');
    await seedFanArt();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message || err);
    process.exit(1);
  }
}

runSeed();