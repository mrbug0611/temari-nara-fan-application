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


