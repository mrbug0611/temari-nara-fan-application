//scripts/strategist-seed.js

const mongoose = require('mongoose');
require('dotenv').config();

const StrategistPost = require('../models/StrategistPost');
const User = require('../models/User');

// sample Strategist Posts data
const samplePosts = [
  {
    title: "Temari's Wind Release Combinations: Building the Perfect Team",
    category: 'Team Strategy',
    content: `Temari is one of the most versatile wind-style users in the series. When building a team around her, consider these key combinations:

1. **Complementary Jutsu Users**: Pair Temari with elemental users who can benefit from wind amplification. Her wind release can amplify fire-style jutsu (creating more devastating flames) and water-style for precision control.

2. **Tank and Damage Dealer Balance**: Temari works best as a mid-to-long range damage dealer. Pair her with a strong tank like Choji or Kiba to control the frontline while she handles ranged devastation.

3. **Synergy with Shikamaru**: The shadow binding + wind cutting combo is legendary. Shikamaru immobilizes enemies while Temari unleashes her wind attacks. Nearly impossible to counter!

4. **Speed and Agility**: Consider adding fast ninja like Lee or Naruto (in his later forms) to quickly reposition Temari if enemies close in.

The key is leveraging her superior battle sense and strategic mind - Temari isn't just about raw power, she's about smart positioning.`,
    tags: ['wind-release', 'team-composition', 'temari', 'strategy'],
    relatedCharacters: ['Temari', 'Shikamaru', 'Choji', 'Kiba'],
    teamLineup: [
      {
        character: 'Temari',
        role: 'Mid-Range DPS',
        reasoning: 'Primary damage dealer with control effects'
      },
      {
        character: 'Shikamaru',
        role: 'Support/Control',
        reasoning: 'Shadow binding immobilizes enemies for follow-up attacks'
      },
      {
        character: 'Choji',
        role: 'Tank',
        reasoning: 'Absorbs damage and controls the frontline'
      }
    ],
    featured: true,
    pinned: true,
    likes: 245,
    views: 1850
  },
  {
    title: 'Battle Analysis: Temari vs Tenten - Chunin Exams Round 1',
    category: 'Battle Analysis',
    content: `This was one of the most decisive matches in the Chunin Exams preliminary rounds. Let's break down why Temari dominated so thoroughly.

**Advantages Temari Had:**
- Range superiority with her fan versus Tenten's weapons
- Elemental advantage (wind vs physical projectiles)
- Battle experience from Sand Village missions
- Psychological edge (confidence vs nervousness)

**Tenten's Mistakes:**
1. She relied too heavily on direct projectile attacks
2. Didn't adapt strategy when initial attacks failed
3. Underestimated the fan's wind cutting capabilities
4. Never got close enough for melee advantage

**What Tenten Could Have Done:**
- Used smoke bombs for close-range engagement
- Mixed in more varied weapon types
- Exploited her precision accuracy differently
- Attempted to damage the fan itself

**Lesson:** This fight shows that raw technique alone isn't enough without strategic thinking and adaptability - something Temari excels at.`,
    tags: ['battle-analysis', 'chunin-exams', 'temari', 'tenten', 'tactics'],
    relatedCharacters: ['Temari', 'Tenten'],
    battleScenario: {
      opponents: ['Tenten'],
      environment: 'Chunin Exam Arena',
      conditions: 'Preliminary round - one-on-one combat',
      strategy: 'Use range and elemental advantage to maintain distance'
    },
    featured: true,
    likes: 189,
    views: 1420
  },
  {
    title: 'Character Analysis: Why Temari is the Underrated Queen of Strategy',
    category: 'Character Analysis',
    content: `Temari often gets overshadowed by heavy-hitters like Naruto and Sasuke, but her strategic mind is unmatched. Here's why she deserves more recognition:

**Intelligence Rank: S-Tier**
- Can read opponents instantly
- Adapts strategies mid-battle
- Understands terrain advantages
- Knows her limits and strengths

**Leadership Qualities:**
- Guides her younger brothers (especially Gaara)
- Commands respect from Sand Village ninjas
- Makes split-second decisions under pressure
- Always thinks ahead

**Combat Effectiveness:**
- Wind release is one of the most versatile elements
- Fan is both weapon and utility tool
- Never wastes chakra
- Knows when to retreat vs. push forward

**Why She's Underrated:**
Most fans focus on flashy transformations and power-ups. Temari wins through smart thinking and precision - not spectacle. That's why she's so impressive in actual combat situations.

In a real war scenario (like we see in later arcs), Temari's strategic brilliance is invaluable. She's the ninja other ninjas should fear most.`,
    tags: ['character-analysis', 'temari', 'intelligence', 'strategy', 'underrated'],
    relatedCharacters: ['Temari', 'Gaara', 'Kankuro'],
    featured: true,
    likes: 312,
    views: 2100
  },
  {
    title: 'Jutsu Deep Dive: Analyzing Wind Release: Cast Net',
    category: 'Jutsu Combos',
    content: `Temari's signature technique - Wind Release: Cast Net (Fūton: Kamaitachi) is deceptively complex. Let's analyze why it's so effective.

**Mechanics:**
- Uses fan to generate and direct wind currents
- Creates multiple cutting trajectories
- Can adjust intensity based on chakra input
- Difficult to predict exact path

**Variations:**
1. **Standard Cast Net**: Basic slashing wind attack
2. **Great Cast Net**: Enlarged version covering wider area
3. **Combination with Summoning**: Works in tandem with Kamatari for enhanced effect
4. **Dust Cloud Version**: Creates obscuring wind clouds instead of direct damage

**Why It's So Effective:**
- Wind is invisible - hard to see and dodge
- Multiple attack angles simultaneously
- Chakra efficient for the damage output
- Works at range (safe for Temari)

**Counter Strategies:**
- Slow-falling jutsu (sand shield, rock armor)
- Speed-based evasion
- Ranged projectiles to intercept wind
- Wind-style jutsu of equal or greater power

**Training Tips:**
If you're practicing wind-style, focus on breath control and hand gestures. Precision beats raw power every time.`,
    tags: ['jutsu-analysis', 'wind-release', 'kamaitachi', 'techniques', 'temari'],
    relatedCharacters: ['Temari'],
    featured: false,
    likes: 156,
    views: 980
  },
  {
    title: 'Historical Discussion: Sand Village Politics and Temari\'s Role',
    category: 'Historical Discussion',
    content: `Temari's character arc is deeply tied to Sand Village politics. Let's examine how she became the political bridge between villages.

**Early Role:**
- Eldest child of the Kazekage
- Expected to represent village interests
- Burdened by family expectations
- Witnessed her father's breakdown and death

**Political Evolution:**
After the village's destruction and rebuilding under Gaara's leadership, Temari stepped into a crucial diplomatic role. She became the ambassador connecting Sand and Leaf villages.

**Her Marriage to Shikamaru:**
This wasn't just romance - it was political strategy. Temari understood that personal relationships could strengthen village bonds. By marrying into the Nara clan (one of Konoha's most influential families), she ensured lasting peace and cooperation.

**Current Position:**
As an elder advisor in the modern era, Temari influences major decisions. She balances:
- Sand Village interests
- Konoha alliance goals
- Her role as mother and wife
- Ninja duties and combat readiness

**Legacy:**
Temari proves that a ninja's value extends beyond combat. Strategic thinking, diplomacy, and vision can change the world just as much as power.`,
    tags: ['history', 'politics', 'sand-village', 'temari', 'diplomacy'],
    relatedCharacters: ['Temari', 'Gaara', 'Shikamaru', 'Fourth Kazekage'],
    featured: false,
    likes: 203,
    views: 1540
  },
  {
    title: 'General Discussion: What Makes Temari Your Favorite Character?',
    category: 'General',
    content: `This is an open discussion thread! Share why you love Temari.

I'll start: For me, it's her character development. She starts as a confident but somewhat arrogant genin, but grows into a wise, compassionate leader. She doesn't need magical power-ups or dramatic transformations - her growth is through experience and wisdom.

Plus, her wind-style jutsu are so cool and underrated in the fan community. And that hair? Iconic.

**What about you?**
- What's your favorite Temari moment?
- Which of her jutsu is the coolest?
- Temari or other female ninjas - who wins?
- Do you ship her with anyone?
- What would you change about her character?

Drop your thoughts below! This is a no-judgment zone for fans.`,
    tags: ['discussion', 'temari', 'favorites', 'community'],
    relatedCharacters: ['Temari'],
    featured: false,
    likes: 87,
    views: 520
  }
];

async function seedStrategistPosts() {
    try {
        console.log("Starting strategist posts seeding...");

        // find admin user 
        const adminUser = await User.findOne({ isAdmin: true });

        if (!adminUser) {
            console.error("Admin user not found. Please create an admin user first.");
            process.exit(1);
        }

        console.log("Clearing existing strategist posts...");
        await StrategistPost.deleteMany({});

        // create post with author information 
        const postsWithAuthors = samplePosts.map((post) => ({
            ...post,
            author: {
                 userId: adminUser._id, 
                 username: adminUser.username, 
                 avatar: adminUser.profile?.avatar || '', 
                 rank: 'Kage'

                }
        }));
        console.log(`Creating ${postsWithAuthors.length} strategist posts...`);
        const created = await StrategistPost.insertMany(postsWithAuthors);
        console.log("\n Posts Created:");

        created.forEach((post, idx) => {
            console.log(`  ${idx + 1}. "${post.title}"`);
            console.log(`     Category: ${post.category}`);
            console.log(`     Pinned: ${post.pinned ? 'Pinned' : 'Not Pinned'}`);
            console.log(`     Featured: ${post.featured ? 'Featured' : 'Not Featured'}`);
            });
    
        console.log("\n Strategist posts seeding completed successfully.");
        console.log(`Total posts: ${created.length}`);

    } catch (error) {
        console.error("Error seeding strategist posts:", error);
        throw error; 
    }

    finally {
        await mongoose.connection.close();
    };
};

async function runSeed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI); 
        console.log("Connected to MongoDB. \n");
        await seedStrategistPosts();
        process.exit(0);
    }
    catch (error) {
        console.error("Error during seeding process:", error);
        process.exit(1);
    }; 
};

runSeed();