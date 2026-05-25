# Data Models Reference

This document describes the MongoDB collections and their Mongoose schemas used in the Temari Fan App.

---

## User

**Collection:** `users` | **File:** `models/User.js`

The central model linking all user activity, preferences, and roles.

### Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | String | Yes | 3–20 chars, unique, trimmed |
| `email` | String | Yes | Unique, lowercased |
| `password` | String | Yes | Min 6 chars. Auto-hashed with bcrypt (10 rounds) before save |
| `profile.avatar` | String | No | Filename; default `default-avatar.png` |
| `profile.bio` | String | No | Max 500 chars |
| `profile.favoriteCharacter` | String | No | |
| `profile.favoriteJutsu` | String | No | |
| `profile.rank` | String | No | Enum: `Genin`, `Chunin`, `Jonin`, `ANBU`, `Kage`. Default: `Genin` |
| `profile.village` | String | No | |
| `profile.joinDate` | Date | No | Default: now |
| `preferences.windEffect` | Boolean | No | Default: `true` |
| `preferences.backgroundWeather` | Boolean | No | Default: `true` |
| `preferences.notifications` | Boolean | No | Default: `true` |
| `preferences.theme` | String | No | Enum: `light`, `dark`, `auto`. Default: `auto` |
| `activity.fanArtSubmissions` | Number | No | Counter |
| `activity.forumPosts` | Number | No | Counter |
| `activity.forumReplies` | Number | No | Counter |
| `activity.totalLikes` | Number | No | Counter |
| `activity.lastActive` | Date | No | |
| `achievements` | Array | No | `[{ name, description, unlockedAt, icon }]` |
| `savedContent.fanArt` | `[ObjectId → FanArt]` | No | Saved art references |
| `savedContent.posts` | `[ObjectId → StrategistPost]` | No | Saved post references |
| `savedContent.jutsus` | `[ObjectId → Jutsu]` | No | Saved jutsu references |
| `isAdmin` | Boolean | No | Default: `false` |
| `isModerator` | Boolean | No | Default: `false` |
| `isBanned` | Boolean | No | Default: `false` |
| `banReason` | String | No | Max 500 chars |
| `bannedAt` | Date | No | |
| `bannedBy` | `ObjectId → User` | No | Admin who issued the ban |
| `createdAt` | Date | Auto | Mongoose timestamps |
| `updatedAt` | Date | Auto | Mongoose timestamps |

### Instance Methods

`comparePassword(candidatePassword)` — returns a Promise resolving to `true` if `candidatePassword` matches the stored hash.

### Hooks

`pre('save')` — hashes `password` with bcrypt when the field is modified.

---

## Jutsu

**Collection:** `jutsus` | **File:** `models/Jutsu.js`

Represents a single jutsu (technique) in Temari's repertoire.

### Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | Yes | Trimmed |
| `japaneseName` | String | No | |
| `type` | String | Yes | Enum: `Ninjutsu`, `Genjutsu`, `Taijutsu`, `Kekkei Genkai`, `Collaboration` |
| `nature` | `[String]` | No | Enum values: `Fire`, `Water`, `Earth`, `Wind`, `Lightning`, `Yin`, `Yang`. Default: `['Wind']` |
| `rank` | String | Yes | Enum: `E`, `D`, `C`, `B`, `A`, `S` |
| `classification` | String | Yes | Enum: `Offensive`, `Defensive`, `Supplementary` |
| `description` | String | Yes | |
| `handSeals` | `[String]` | No | Ordered list of hand seals |
| `users` | `[String]` | No | Default: `['Temari']` |
| `firstAppearance.manga` | String | No | Chapter reference |
| `firstAppearance.anime` | String | No | Episode reference |
| `powerLevel` | Number | No | 1–10 scale. Default: `5` |
| `chakraCost` | String | No | Enum: `Low`, `Medium`, `High`, `Very High`. Default: `Medium` |
| `animationData.particleCount` | Number | No | Particles for wind effect |
| `animationData.windDirection` | String | No | Direction string for GSAP animation |
| `animationData.intensity` | Number | No | Effect intensity 1–10 |
| `animationData.color` | String | No | Hex color for particles |
| `animationData.duration` | Number | No | Animation duration in ms |
| `imageUrl` | String | No | |
| `videoClipUrl` | String | No | |
| `tags` | `[String]` | No | |
| `isSignature` | Boolean | No | Default: `false`. `true` for Temari's defining techniques |
| `createdAt` / `updatedAt` | Date | Auto | |

### Indexes

`name`, `type`, `rank`, `isSignature`

---

## Timeline Event

**Collection:** `timelineevents` | **File:** `models/Timeline.js`

A single event in Temari's character arc, displayed on the Timeline page.

### Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | String | Yes | Trimmed |
| `era` | String | Yes | Enum: `Pre-Academy`, `Chunin Exams`, `Sasuke Retrieval`, `Shippuden`, `War Arc`, `Post-War`, `Boruto` |
| `date.arc` | String | No | Arc name |
| `date.episode` | Number | No | Anime episode number |
| `date.chapter` | Number | No | Manga chapter number |
| `description` | String | Yes | |
| `significance` | String | No | Enum: `Minor`, `Moderate`, `Major`, `Critical`. Default: `Moderate` |
| `category` | String | Yes | Enum: `Battle`, `Character Development`, `Relationship`, `Personal Achievement`, `Mission`, `Diplomatic` |
| `relatedCharacters` | `[String]` | No | Default: `[]` |
| `location` | String | No | |
| `age` | Number | No | Temari's age at the event |
| `imageUrl` | String | No | |
| `videoClipUrl` | String | No | |
| `quotes` | Array | No | `[{ text: String, speaker: String }]` |
| `stats.strength` | Number | No | 1–10 scale |
| `stats.intelligence` | Number | No | 1–10 scale |
| `stats.speed` | Number | No | 1–10 scale |
| `stats.taijutsu` | Number | No | 1–10 scale |
| `stats.chakra` | Number | No | 1–10 scale |
| `stats.ninjutsu` | Number | No | 1–10 scale |
| `coordinates.x` | Number | No | For future timeline visualization positioning |
| `coordinates.y` | Number | No | For future timeline visualization positioning |
| `order` | Number | Yes | Chronological sort key |
| `createdAt` / `updatedAt` | Date | Auto | |

### Indexes

`order` (for default sort), compound `{ era: 1, order: 1 }` (for era-filtered views)

---

## Fan Art

**Collection:** `fanarts` | **File:** `models/FanArt.js`

Community-submitted artwork.

### Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | String | Yes | |
| `description` | String | No | |
| `imageUrl` | String | Yes | Relative path to full-size processed image |
| `thumbnailUrl` | String | No | Relative path to generated thumbnail |
| `submittedBy` | `ObjectId → User` | Yes | |
| `tags` | `[String]` | No | |
| `likes` | `[ObjectId → User]` | No | Array of user IDs who have liked — prevents double-likes |
| `isApproved` | Boolean | No | Default: `false`. Set to `true` by moderator/admin |
| `isNSFW` | Boolean | No | Default: `false` |
| `createdAt` / `updatedAt` | Date | Auto | |

---

## Strategist Post

**Collection:** `strategistposts` | **File:** `models/StrategistPost.js`

Forum post in the Strategist's Corner discussion board.

### Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | String | Yes | |
| `content` | String | Yes | |
| `author` | `ObjectId → User` | Yes | |
| `tags` | `[String]` | No | |
| `likes` | `[ObjectId → User]` | No | |
| `replies` | Array | No | Embedded: `[{ content, author (ObjectId), createdAt }]` |
| `isPinned` | Boolean | No | Default: `false`. Pinned posts appear at top |
| `isLocked` | Boolean | No | Default: `false`. Locked posts accept no new replies |
| `createdAt` / `updatedAt` | Date | Auto | |

---

## Report

**Collection:** `reports` | **File:** `models/Report.js`

Bug report or feature request submitted through the in-app reporting tool.

### Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | String | Yes | Enum: `bug`, `feature`, `content`, `other` |
| `title` | String | Yes | |
| `description` | String | Yes | |
| `priority` | String | No | Enum: `low`, `medium`, `high`, `critical`. Default: `medium` |
| `status` | String | No | Enum: `open`, `in-progress`, `resolved`, `closed`. Default: `open` |
| `submittedBy` | `ObjectId → User` | Yes | |
| `page` | String | No | URL path where the issue occurred |
| `browser` | String | No | Browser/OS info from the submitter |
| `steps` | String | No | Reproduction steps |
| `adminNotes` | String | No | Internal notes added by moderator/admin |
| `resolvedAt` | Date | No | Set when status moves to `resolved` or `closed` |
| `createdAt` / `updatedAt` | Date | Auto | |

---

## Relationships Summary

```
User (1) ──── (N) FanArt             (submittedBy)
User (1) ──── (N) StrategistPost     (author)
User (1) ──── (N) Report             (submittedBy)
User (N) ──── (N) FanArt             (likes[])
User (N) ──── (N) StrategistPost     (likes[])
User (1) ──── (N) User               (bannedBy → User)
User (1) ──── (N) FanArt             (savedContent.fanArt[])
User (1) ──── (N) StrategistPost     (savedContent.posts[])
User (1) ──── (N) Jutsu              (savedContent.jutsus[])
```

Jutsus and Timeline Events have no user-facing ownership — they are admin-managed content.