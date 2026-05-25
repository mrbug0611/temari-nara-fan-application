<img width="1000" height="853" alt="image" src="https://github.com/user-attachments/assets/b4281822-a07f-441c-88f7-597b4ed4a53b" />

# Temari Fan App 

> A full-stack MERN web application dedicated to Temari from the Naruto Universe. It features effects that change with the weather, a showcase of her jutsus, a fan art gallery, community discussions, and more.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
  - [Seeding the Database](#seeding-the-database)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Role System](#role-system)
- [Contributing](#contributing)
- [License](#license)

--- 

## Overview 

The **Temari Fan App** is a community-driven web application built for those who are fans of the Naruto/Boruto franchise. It uses both anime and real-world data to create a unique user experience. For example, the project integrates the OpenWeather API map to power dynamic wind and weather visual effects that respond to the weather at your actual location. The app also supports user accounts, fan art submissions, a community-driven discussion form, a comprehensive jutsu showcase, and a character timeline. 

--- 

## Features 
### Core Pages
- **Home** — Animated landing page with live wind background effects powered by GSAP
- **Jutsu Showcase** — Browse and filter Temari's full jutsu repertoire with rank, type, nature, and chakra cost details
- **Timeline** — Chronological character arc from Pre-Academy through Boruto
- **Fan Art Gallery** — Community-submitted artwork with likes, filtering, and image upload support
- **Strategist's Corner** — Forum-style discussion board for community posts
- **Guidelines** — Community rules and standards
- **Report Issue** — In-app bug reporting and feature request system
- **Contact Us** — Contact form with email delivery via Gmail OAuth2

### User System
- JWT-based authentication (stored in HTTP-only cookies)
- User registration and login with bcrypt password hashing
- Profile page with bio, and ninja rank
- Saved content (fan art, posts, jutsus)

### Admin & Moderation
- Admin and moderator roles with route-level guards
- User ban system with reason tracking
- Report review and management dashboard

### Technical Highlights
- Real-time weather integration via OpenWeatherMap API
- GSAP-powered animated wind particle background
- Gmail OAuth2 email delivery
- Rate limiting on all API routes (100 req / 15 min per IP)
- Helmet.js security headers
- Image uploads with Multer + Sharp image processing
- CodeRabbit AI code review configuration

--- 

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, GSAP, React Router v7, Axios, Lucide React |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB |
| Auth | JWT (HTTP-only cookies), bcryptjs |
| Email | Nodemailer + Gmail OAuth2 via Google APIs |
| Weather | OpenWeatherMap API |
| Image Processing | Multer, Sharp |
| Security | Helmet.js, express-rate-limit, CORS |
| Code Quality | ESLint, CodeRabbit |

---

## Project Structure

```
temari-nara-fan-application/
│
├── config/
│   └── email.js              # Nodemailer + Gmail OAuth2 setup
│
├── middleware/
│   └── auth.js               # JWT authenticate, isAdmin, isModerator, optionalAuthenticate
│
├── models/
│   ├── FanArt.js             # Fan art submissions
│   ├── Jutsu.js              # Jutsu entries with animation metadata
│   ├── Report.js             # Bug reports and feature requests
│   ├── StrategistPost.js     # Forum posts
│   ├── Timeline.js           # Character timeline events
│   └── User.js               # User accounts, roles
│
├── routes/
│   ├── contact.routes.js     # Contact form submission + email delivery
│   ├── fanart.routes.js      # Fan art CRUD + image upload
│   ├── jutsu.routes.js       # Jutsu read + admin write
│   ├── proxy.routes.js       # Proxied external API calls
│   ├── report.routes.js      # Bug/feature report CRUD
│   ├── strategist.routes.js  # Forum post CRUD
│   ├── timeline.routes.js    # Timeline event CRUD
│   ├── user.routes.js        # Auth, profile, saved content
│   └── weather.routes.js     # OpenWeatherMap proxy
│
├── scripts/
│   ├── seed.js               # Seeds jutsus and timeline events
│   ├── fanseed.js            # Seeds fan art entries
│   └── strategist-seed.js    # Seeds forum posts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── effects/
│   │   │   │   └── WindBackground.jsx   # GSAP particle wind effect
│   │   │   └── layout/
│   │   │       ├── Navigation.jsx
│   │   │       └── Footer.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx          # Global auth state
│   │   │   ├── ThemeContext.jsx         # Light/dark/auto theme
│   │   │   └── WeatherContext.jsx       # Real-time weather state
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── JutsuShowcase.jsx
│   │       ├── Timeline.jsx
│   │       ├── FanArtGallery.jsx
│   │       ├── StrategistCorner.jsx
│   │       ├── Profile.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Guidelines.jsx
│   │       ├── ReportIssue.jsx
│   │       └── ContactUs.jsx
│   └── package.json
│
├── .env.example              # All required environment variables documented
├── .coderabbit.yaml          # CodeRabbit AI review configuration
├── server.js                 # Express entry point
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **OpenWeatherMap API key** — free tier at [openweathermap.org](https://openweathermap.org/api)
- **Gmail account** with OAuth2 credentials configured (see [Email Setup](#email-setup))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mrbug0611/temari-nara-fan-application.git
cd temari-nara-fan-application
```

2. **Install backend dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd frontend
npm install
cd ..
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See [`.env.example`](.env.example) for the full list of required variables. Key ones to set before running:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong random string for signing JWTs |
| `OPENWEATHER_API_KEY` | OpenWeatherMap free-tier API key |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID (for email) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `GOOGLE_REFRESH_TOKEN` | OAuth2 refresh token (see Email Setup below) |
| `EMAIL_USER` | Gmail address used to send emails |
| `ADMIN_EMAIL` | Address that receives contact form messages |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:3000`) |

#### Email Setup

The app uses Gmail OAuth2 instead of app passwords. To obtain a refresh token:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Gmail API
3. Create OAuth2 credentials (Web Application type)
4. Set redirect URI to `https://developers.google.com/oauthplayground`
5. Use the included helper script: `node get-refresh-token.js`
6. Paste the generated token into `GOOGLE_REFRESH_TOKEN` in your `.env`

### Running the App

**Development** (backend only, with nodemon):

```bash
npm run dev
```

**Frontend dev server** (in a separate terminal):

```bash
cd frontend
npm run dev
```

The backend runs on `http://localhost:5000` and the Vite frontend on `http://localhost:5173` by default.

**Production build:**

```bash
cd frontend && npm run build
```

Serve the built `frontend/dist` folder with your chosen static host or configure Express to serve it directly.

### Seeding the Database

The project ships with three seed scripts to pre-populate content:

```bash
# Seed jutsus and timeline events
npm run seed

# Seed fan art entries
npm run seed-fanart

# Seed Strategist's Corner posts
npm run seed-strategist
```

> ⚠️ Seed scripts will drop and repopulate the relevant collections. Do not run them against a production database with real user content.

---

## API Reference

All endpoints are prefixed with `/api`. A health check is available at `GET /api/health`.

Full API documentation is in [`docs/API.md`](docs/API.md).

### Quick Reference

| Resource | Base Path | Auth Required |
|---|---|---|
| Auth / Users | `/api/user` | Partial |
| Jutsus | `/api/jutsu` | Read: No / Write: Admin |
| Timeline | `/api/timeline` | Read: No / Write: Admin |
| Fan Art | `/api/fanart` | Read: No / Write: Yes |
| Strategist Posts | `/api/strategist` | Read: No / Write: Yes |
| Reports | `/api/reports` | No |
| Contact | `/api/contact` | No |
| Weather | `/api/weather` | No |

---

## Authentication 

The app uses **JWT tokens stored in HTTP-only cookies** to prevent XSS attacks against tokens 

- `POST /api/user/register` — creates a new user and sets the auth cookie
- `POST /api/user/login` — validates credentials and sets the auth cookie
- `POST /api/user/logout` — clears the auth cookie

Protected routes use the `authenticate` middleware, which reads from `req.cookies.token`. The `optionalAuthenticate` middleware allows routes to serve both authenticated and anonymous users with different data. 

--- 


## Role System

| Role | Access |
|---|---|
| Guest | Browse jutsus, timeline, fan art, forum; submit contact |
| User | All guest access + submit fan art, create/reply to forum posts |
| Moderator | All user access + manage reports, moderate content |
| Admin | Full access including user management, content CRUD, ban users |

Roles are checked via `isAdmin` and `isModerator` middleware chained after `authenticate`.

---

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.

This project uses [CodeRabbit](https://coderabbit.ai) for AI-assisted code review on all pull requests. Reviews are automatic — no setup needed.

### Development Workflow

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes following the code style guidelines
3. Commit with a descriptive message: `git commit -m "feat: add wind jutsu filter"`
4. Push your branch and open a PR against `main`
5. Address CodeRabbit and human review feedback
6. Merge after approval

---

## License

This project is licensed under the ISC License. See [`LICENSE`](LICENSE) for details.

**Disclaimer:** This is a fan-made application. All Naruto characters, jutsu names, and related lore are the intellectual property of Masashi Kishimoto / Shueisha / Pierrot. This project is non-commercial and created purely for fan appreciation.

---


<img width="1429" height="1080" alt="image" src="https://github.com/user-attachments/assets/f802ac9c-57a1-40e4-a0c5-5fa57988816a" />




