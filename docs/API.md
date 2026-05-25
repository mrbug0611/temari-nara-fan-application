# API Reference

All endpoints are prefixed with `/api`. The server runs on port `5000` by default.

**Base URL (development):** `http://localhost:5000/api`

---

## Table of Contents

- [Health Check](#health-check)
- [Authentication & Users](#authentication--users)
- [Jutsus](#jutsus)
- [Timeline](#timeline)
- [Fan Art](#fan-art)
- [Strategist's Corner](#strategists-corner)
- [Reports](#reports)
- [Contact](#contact)
- [Weather](#weather)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)

---

## Health Check

### `GET /api/health`

Returns the current server status.

**Auth required:** No

**Response `200`:**
```json
{
  "status": "active",
  "message": "Server is healthy",
  "time": "2024-01-15T12:00:00.000Z"
}
```

---

## Authentication & Users

### `POST /api/user/register`

Register a new user account. Sets an HTTP-only `token` cookie on success.

**Auth required:** No

**Request body:**
```json
{
  "username": "WindStyle99",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Constraints:**
- `username`: 3–20 characters, unique
- `email`: valid email format, unique
- `password`: minimum 6 characters

**Response `201`:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "username": "WindStyle99",
    "email": "user@example.com",
    "profile": { "rank": "Genin", ... }
  }
}
```

**Error `409`** — username or email already in use.

---

### `POST /api/user/login`

Authenticate an existing user. Sets an HTTP-only `token` cookie on success.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response `200`:**
```json
{
  "message": "Login successful",
  "user": { "_id": "...", "username": "WindStyle99", ... }
}
```

**Error `401`** — invalid credentials.

---

### `POST /api/user/logout`

Clear the auth cookie and log the user out.

**Auth required:** Yes

**Response `200`:**
```json
{ "message": "Logged out successfully" }
```

---

### `GET /api/user/profile`

Get the authenticated user's full profile.

**Auth required:** Yes

**Response `200`:**
```json
{
  "_id": "...",
  "username": "WindStyle99",
  "profile": {
    "avatar": "default-avatar.png",
    "bio": "...",
    "favoriteCharacter": "Temari",
    "favoriteJutsu": "Wind Release: Great Sickle Weasel",
    "rank": "Chunin",
    "village": "Sand Village",
    "joinDate": "2024-01-01T00:00:00.000Z"
  },
  "preferences": {
    "windEffect": true,
    "backgroundWeather": true,
    "notifications": true,
    "theme": "dark"
  },
  "activity": {
    "fanArtSubmissions": 3,
    "forumPosts": 12,
    "totalLikes": 45
  },
  "achievements": []
}
```

---

### `PUT /api/user/profile`

Update the authenticated user's profile fields.

**Auth required:** Yes

**Request body** (all fields optional):
```json
{
  "bio": "Wind Release enthusiast",
  "favoriteCharacter": "Temari",
  "favoriteJutsu": "Cyclone Scythe",
  "rank": "Jonin",
  "village": "Hidden Sand"
}
```

**Response `200`:** Updated user object.

---

### `PUT /api/user/preferences`

Update the authenticated user's app preferences.

**Auth required:** Yes

**Request body:**
```json
{
  "windEffect": false,
  "theme": "dark",
  "notifications": true,
  "backgroundWeather": true
}
```

---

### `GET /api/user/saved`

Retrieve the authenticated user's saved content (fan art, posts, jutsus).

**Auth required:** Yes

---

### `POST /api/user/saved/:type/:id`

Save a piece of content. `type` must be `fanart`, `post`, or `jutsu`.

**Auth required:** Yes

---

### `DELETE /api/user/saved/:type/:id`

Remove a saved item.

**Auth required:** Yes

---

### Admin-Only User Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/user/admin/users` | List all users with pagination |
| `PUT` | `/api/user/admin/users/:id/ban` | Ban a user |
| `PUT` | `/api/user/admin/users/:id/unban` | Unban a user |
| `PUT` | `/api/user/admin/users/:id/role` | Update user role (admin/moderator) |

All admin routes require `authenticate` + `isAdmin` middleware.

---

## Jutsus

### `GET /api/jutsu`

List all jutsu entries with optional filtering.

**Auth required:** No

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `type` | string | Filter by type: `Ninjutsu`, `Genjutsu`, `Taijutsu`, `Kekkei Genkai`, `Collaboration` |
| `rank` | string | Filter by rank: `E`, `D`, `C`, `B`, `A`, `S` |
| `nature` | string | Filter by chakra nature: `Wind`, `Fire`, etc. |
| `classification` | string | `Offensive`, `Defensive`, `Supplementary` |
| `isSignature` | boolean | Show only signature jutsus |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |

**Response `200`:**
```json
{
  "jutsus": [
    {
      "_id": "...",
      "name": "Wind Release: Infinite Sand Cloud — Great Breakthrough",
      "japaneseName": "風遁・無限砂塵雲・大突破",
      "type": "Ninjutsu",
      "nature": ["Wind"],
      "rank": "B",
      "classification": "Offensive",
      "description": "...",
      "handSeals": ["Tiger", "Rabbit", "Dog"],
      "users": ["Temari"],
      "powerLevel": 7,
      "chakraCost": "Medium",
      "isSignature": true,
      "animationData": {
        "particleCount": 200,
        "windDirection": "forward",
        "intensity": 7,
        "color": "#7EB8A0",
        "duration": 2000
      }
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 1
}
```

---

### `GET /api/jutsu/:id`

Get a single jutsu by ID.

**Auth required:** No

---

### `POST /api/jutsu`

Create a new jutsu entry.

**Auth required:** Yes (Admin)

**Request body:** Full jutsu object matching the schema above.

---

### `PUT /api/jutsu/:id`

Update a jutsu entry.

**Auth required:** Yes (Admin)

---

### `DELETE /api/jutsu/:id`

Delete a jutsu entry.

**Auth required:** Yes (Admin)

---

## Timeline

### `GET /api/timeline`

List all timeline events, ordered chronologically by the `order` field.

**Auth required:** No

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `era` | string | Filter by era: `Pre-Academy`, `Chunin Exams`, `Sasuke Retrieval`, `Shippuden`, `War Arc`, `Post-War`, `Boruto` |
| `category` | string | `Battle`, `Character Development`, `Relationship`, `Personal Achievement`, `Mission`, `Diplomatic` |
| `significance` | string | `Minor`, `Moderate`, `Major`, `Critical` |

**Response `200`:**
```json
{
  "events": [
    {
      "_id": "...",
      "title": "Chunin Exams — First Appearance",
      "era": "Chunin Exams",
      "description": "...",
      "significance": "Major",
      "category": "Battle",
      "relatedCharacters": ["Shikamaru", "Sasuke"],
      "location": "Konohagakure",
      "age": 15,
      "order": 1,
      "quotes": [{ "text": "...", "speaker": "Temari" }],
      "stats": { "strength": 7, "intelligence": 8, "speed": 7 }
    }
  ]
}
```

---

### `GET /api/timeline/:id`

Get a single timeline event.

**Auth required:** No

---

### `POST /api/timeline`

Create a new timeline event.

**Auth required:** Yes (Admin)

---

### `PUT /api/timeline/:id`

Update a timeline event.

**Auth required:** Yes (Admin)

---

### `DELETE /api/timeline/:id`

Delete a timeline event.

**Auth required:** Yes (Admin)

---

## Fan Art

### `GET /api/fanart`

List approved fan art submissions.

**Auth required:** No

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Results per page |
| `sort` | string | `newest`, `popular` |
| `tag` | string | Filter by tag |

---

### `GET /api/fanart/:id`

Get a single fan art entry.

**Auth required:** No

---

### `POST /api/fanart`

Submit fan art. Accepts `multipart/form-data` for image upload.

**Auth required:** Yes

**Form fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Artwork title |
| `description` | string | No | Description |
| `tags` | string | No | Comma-separated tags |
| `image` | file | Yes | Image file (JPEG/PNG, max 10MB) |

Images are processed with Sharp (resized, thumbnail generated) and stored in `public/uploads/`.

---

### `POST /api/fanart/:id/like`

Toggle a like on a fan art entry.

**Auth required:** Yes

---

### `DELETE /api/fanart/:id`

Delete a fan art entry (owner or admin/moderator only).

**Auth required:** Yes

---

## Strategist's Corner

### `GET /api/strategist`

List forum posts with pagination.

**Auth required:** No

**Query parameters:** `page`, `limit`, `sort` (`newest`, `popular`, `mostReplied`)

---

### `GET /api/strategist/:id`

Get a single post with its replies.

**Auth required:** No

---

### `POST /api/strategist`

Create a new forum post.

**Auth required:** Yes

**Request body:**
```json
{
  "title": "Best Wind Style Combos",
  "content": "Let's discuss...",
  "tags": ["strategy", "wind-release"]
}
```

---

### `POST /api/strategist/:id/reply`

Reply to a forum post.

**Auth required:** Yes

**Request body:**
```json
{
  "content": "Great point! I'd also add..."
}
```

---

### `POST /api/strategist/:id/like`

Toggle a like on a post.

**Auth required:** Yes

---

### `DELETE /api/strategist/:id`

Delete a post (owner or admin/moderator only).

**Auth required:** Yes

---

## Reports

### `POST /api/reports`

Submit a bug report or feature request.

**Auth required:** No

**Request body:**
```json
{
  "type": "bug",
  "title": "Wind background freezes on mobile",
  "description": "On iOS Safari, the wind particle effect stops after ~10 seconds.",
  "priority": "medium",
  "page": "/",
  "browser": "Safari 17",
  "steps": "1. Open home page on iPhone. 2. Wait 10 seconds."
}
```

`type` options: `bug`, `feature`, `content`, `other`
`priority` options: `low`, `medium`, `high`, `critical`

---

### `GET /api/reports`

List all reports.

**Auth required:** Yes (Moderator or Admin)

**Query parameters:** `status` (`open`, `in-progress`, `resolved`, `closed`), `type`, `priority`, `page`, `limit`

---

### `GET /api/reports/:id`

Get a single report.

**Auth required:** Yes (Moderator or Admin)

---

### `PUT /api/reports/:id`

Update report status or add notes.

**Auth required:** Yes (Moderator or Admin)

**Request body:**
```json
{
  "status": "in-progress",
  "adminNotes": "Reproduced on iOS 17. Looking into GSAP RAF throttling."
}
```

---

## Contact

### `POST /api/contact`

Submit a contact form message. Sends an email to `ADMIN_EMAIL`.

**Auth required:** No

**Request body:**
```json
{
  "name": "Shikamaru Nara",
  "email": "shikamaru@leaf.village",
  "subject": "Partnership inquiry",
  "message": "What a drag... but I wanted to ask about collaborating.",
  "contactMethod": "email"
}
```

**Validations:**
- All fields required
- Valid email format
- Message minimum 10 characters

**Response `200`:**
```json
{ "message": "Message sent successfully" }
```

---

## Weather

### `GET /api/weather`

Fetch current weather for a given location. Proxies the OpenWeatherMap API to keep the API key server-side.

**Auth required:** No

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `city` | string | City name (e.g., `Sunagakure`) |
| `lat` | number | Latitude (alternative to city) |
| `lon` | number | Longitude (alternative to city) |

**Response `200`:** Passes through the OpenWeatherMap current weather response, including `weather[0].main`, `wind.speed`, `wind.deg`, and `main.temp`.

---

## Error Responses

All errors follow this envelope format:

```json
{
  "error": {
    "message": "Description of the error",
    "status": 400
  }
}
```

Or for simpler cases:
```json
{ "error": "Short error description" }
```

**Common HTTP Status Codes:**

| Status | Meaning |
|---|---|
| `400` | Bad Request — missing or invalid input |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient role permissions or banned account |
| `404` | Not Found |
| `409` | Conflict — duplicate resource (e.g., username taken) |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |

---

## Rate Limiting

All `/api/` routes are subject to a rate limit of **100 requests per 15-minute window per IP address**, enforced by `express-rate-limit`. Exceeding this limit returns `429 Too Many Requests`.

---

## Authentication Details

The app uses **HTTP-only cookie-based JWTs**. When making requests from a separate frontend origin, ensure your HTTP client sends credentials:

```javascript
// Axios
axios.defaults.withCredentials = true;

// Fetch
fetch('/api/user/profile', { credentials: 'include' });
```

The CORS configuration on the server allows credentials from `FRONTEND_URL` only.
