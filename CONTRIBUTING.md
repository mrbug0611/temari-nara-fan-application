# Contributing to Temari Fan App

Thank you for your interest in contributing! Whether you're fixing a bug, proposing a feature, submitting fan-curated data, or improving docs, all contributions are welcome.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Requesting Features](#requesting-features)
  - [Submitting Code](#submitting-code)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Project-Specific Guidelines](#project-specific-guidelines)

---

## Code of Conduct

This is a fan community project. We expect all contributors to be respectful, constructive, and welcoming to others, regardless of background or experience level. Harassment, personal attacks, or toxic behaviour will not be tolerated.

---

## How to Contribute

### Reporting Bugs

You can report bugs in two ways:

1. **In the app itself** — use the [Report Issue](http://localhost:3000/reports) page (preferred, as it captures browser/context metadata automatically)
2. **GitHub Issues** — open an issue using the **Bug Report** template

When reporting, please include:
- A clear, descriptive title
- Steps to reproduce (numbered list)
- What you expected to happen vs. what actually happened
- Your browser and OS
- Screenshots or console errors if applicable

---

### Requesting Features

Open a GitHub Issue using the **Feature Request** template. Describe:
- The problem or gap you're trying to solve
- Your proposed solution
- Any alternatives you've considered
- Whether you'd be willing to implement it yourself

---

### Submitting Code

1. **Check existing issues and PRs** before starting to avoid duplicating work
2. For non-trivial changes, open an issue first to discuss the approach
3. Fork the repository and create a branch (see [Development Setup](#development-setup))
4. Make your changes, following the [Code Style](#code-style) guidelines
5. Open a pull request against `main`

---

## Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/temari-nara-fan-application.git
cd temari-nara-fan-application

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..

# 3. Configure environment
cp .env.example .env
# Edit .env with your local values (MongoDB URI, API keys, etc.)

# 4. Seed sample data
npm run seed
npm run seed-fanart
npm run seed-strategist

# 5. Start dev servers (two terminals)
npm run dev           # backend on :5000
cd frontend && npm run dev  # frontend on :3000
```

Make sure the backend is running before testing any API-dependent frontend features.

---

## Code Style

This project uses **ESLint** for the frontend. Run the linter before submitting:

```bash
cd frontend && npm run lint
```

### General Guidelines (both frontend and backend)

- Use `const` by default; `let` only when reassignment is necessary; never `var`
- Prefer `async/await` over promise chains
- Use arrow functions for callbacks
- Use destructuring for object and array access
- Prefer template literals over string concatenation
- Keep functions small and focused on a single responsibility
- Use early returns to reduce nesting
- Use meaningful variable names — no single-letter names except in short loops

### Backend (Node/Express)

- Wrap all route handlers in `try/catch` with appropriate HTTP status codes
- Use `req.user` (set by `authenticate` middleware) rather than re-querying the user
- Add database indexes for any fields queried frequently
- Use Mongoose 8+ syntax — do not pass `useNewUrlParser` or `useUnifiedTopology` options
- In Mongoose `pre` hooks, use `async function` (not arrow functions) and do not call `next()` — just `return`

### Frontend (React)

- Functional components and hooks only
- Don't call hooks inside conditionals or loops
- Clean up subscriptions, timers, and event listeners in `useEffect` return functions
- Use `useCallback` / `useMemo` for expensive computations or frequently-re-rendered handlers
- All interactive elements must have accessible labels (`aria-label`, `aria-describedby`, semantic HTML)
- Use Tailwind utility classes instead of custom CSS wherever possible
- Use GPU-accelerated CSS properties (`transform`, `opacity`) for animations

---

## Commit Messages

Follow the **Conventional Commits** format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace, no logic change |
| `refactor` | Code restructure without feature/fix |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates, config |

**Examples:**

```
feat(gallery): add tag filtering to fan art grid
fix(auth): clear cookie on logout when token is expired
docs(api): document weather endpoint query parameters
perf(wind-bg): reduce particle count on mobile viewports
```

Keep the subject line under 72 characters. Use the body to explain *why*, not *what* (the diff shows what).

---

## Pull Request Process

1. **Branch naming:** `feat/short-description`, `fix/short-description`, `docs/short-description`
2. **PR title:** Should match the conventional commit format of your main change
3. **PR description:** Fill in the template — what changed, why, how to test it
4. **Self-review:** Read your diff carefully before requesting review
5. **Tests:** If you're adding a new route or changing business logic, include manual test steps in the PR description (automated tests are a planned addition)
6. **Screenshots:** Include before/after screenshots for UI changes

### CodeRabbit Review

All PRs are automatically reviewed by [CodeRabbit](https://coderabbit.ai). It will post an AI-generated summary and inline comments. You don't need to do anything special — just address its feedback as you would a human reviewer's comments.

CodeRabbit is configured in [`.coderabbit.yaml`](../.coderabbit.yaml) with project-specific context, so its suggestions are tailored to this stack.

### Merge Criteria

- CI checks pass (lint)
- At least one human review approval
- CodeRabbit blocking issues resolved
- No unresolved conflicts with `main`

---

## Project-Specific Guidelines

### Adding Jutsus or Timeline Events

Prefer contributing data through the seed scripts (`scripts/seed.js`) rather than directly to the database. This keeps data reproducible and reviewable in code form.

When adding a jutsu:
- Use real jutsu names and Japanese names where available
- Include accurate hand seals (in correct order)
- Set `isSignature: true` only for jutsus strongly associated with Temari
- Populate `animationData` when possible — the frontend uses it for particle effects

### Fan Art Submissions

Fan art submitted through the app UI goes through a moderation queue. For bulk data contributions to the seed file, include proper attribution and confirm the art is original or freely licensed.

### Theming and Visual Consistency

The app uses an **emerald/teal/dark slate** color palette throughout. New UI components should:
- Use the existing Tailwind color tokens (`emerald-400`, `slate-900`, etc.)
- Follow the glassmorphism card style (`bg-slate-800/50 border border-emerald-500/20 rounded-2xl backdrop-blur-md`)
- Support dark mode (the app defaults to dark; avoid hardcoded light colors)

---

Thanks for contributing: believe it! 

