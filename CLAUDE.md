# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack nutrition tracker: Node/Express + PostgreSQL (Prisma) API in `server/`, React (Vite) SPA in `client/`. The two are separate npm projects with no shared root `package.json` — run commands from inside `server/` or `client/`, not the repo root.

## Commands

All commands are run from within `server/` or `client/` respectively; there is no root-level script runner.

### Server (`server/`)
- `npm run dev` — start API with nodemon (auto-restart) on `PORT` (default 3000)
- `npm start` — start API without nodemon
- `npx prisma migrate dev` — apply/create migrations against `DATABASE_URL`
- `npx prisma generate` — regenerate the Prisma client (output goes to `server/src/generated/prisma`, not `node_modules`)
- `npx prisma studio` — inspect/edit DB data visually

There is no test suite and no lint script configured for the server.

### Client (`client/`)
- `npm run dev` — start Vite dev server (default `http://localhost:5173`)
- `npm run build` — production build to `client/dist`
- `npm run lint` — ESLint (flat config, `client/eslint.config.js`)
- `npm run preview` — preview a production build locally

There is no test suite configured for the client.

## Environment setup

Both apps load `.env` via `dotenv`; copy `.env.example` in each folder and fill in values.

- `server/.env` requires (see `server/src/config/validateEnv.js`): `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `INVITE_CODE`. The server calls `process.exit(1)` at boot if any are missing — check this file first when the server won't start. `USDA_API_KEY` is used by food search but is not in the required list.
- `client/.env` needs `VITE_API_URL` (defaults to `http://localhost:3000` if unset).
- Registration is invite-gated: `POST /api/auth/register` requires `inviteCode` to match `INVITE_CODE` exactly (`server/src/controllers/auth.js`).

## Architecture

### Server structure
Express app wiring lives entirely in `server/src/index.js`: env validation → CORS → global rate limiter (100 req/15min on all `/api/*`) → a stricter rate limiter (10 req/15min) applied specifically to the four auth routes (`login`, `register`, `forgot-password`, `reset-password`) → route mounting → a catch-all error handler.

Each resource follows the same three-layer pattern — look at `foods` as the reference:
- `routes/<resource>.js` — wires `authenticateToken` (JWT, `middleware/auth.js`) and `validate(<schema>)` (Zod, `middleware/validate.js`) onto controller functions
- `controllers/<resource>.js` — request handling and Prisma calls
- `validators/<resource>.js` — Zod schemas for request bodies

`prisma.js` exports a singleton `PrismaClient` built with the `@prisma/adapter-pg` driver adapter (not the default Prisma engine). The generated client lives at `server/src/generated/prisma` (custom `output` in `prisma/schema.prisma`) — regenerate with `npx prisma generate` after schema changes, don't hand-edit it.

Data model (`server/prisma/schema.prisma`): `User` has one `MacroGoal`, many `FoodLog`/`WaterLog` entries (logged per-day via a `date` column), `SavedMeal`s (each with `SavedMealItem`s), `PasswordResetToken`s, and authored `CommunityFood`s. `CommunityFood` is a shared, crowd-sourced food database separate from per-user logs — entries accumulate a `useCount` as different users log them.

Two external integrations, each isolated to one controller:
- `controllers/search.js` — proxies USDA FoodData Central for food search, normalizes serving units and pulls out calorie/protein/carb/fat by USDA nutrient ID (1008/1003/1005/1004)
- `controllers/ai.js` — sends free-text meal descriptions to Anthropic (`claude-haiku-4-5-20251001`) with a system prompt instructing JSON-only output, strips markdown fences defensively, then validates the parsed shape with a Zod schema before trusting it. Any change to the expected AI output shape must update both the system prompt and this Zod schema together.

### Client structure
Vite + React 19, no state management library — server state goes through TanStack Query hooks (`src/hooks/use*.js`, one per resource, wrapping `src/api/*.js` axios calls), local/auth state through React Context (`src/context/AuthContext.jsx`, `ThemeContext.jsx`).

`src/api/axiosClient.js` is the single axios instance: it attaches the JWT from `localStorage` to every request and, on any `401` response, clears storage and hard-redirects to `/login`. All API modules in `src/api/` should go through this client rather than raw axios/fetch so that behavior stays consistent.

Routing is centralized in `src/App.jsx` using a `ProtectedRoute` wrapper (redirects to `/login` if `useAuth()` has no user) and a `ProtectedLayout` wrapper (adds `NavBar` + page padding) — new authenticated pages should be added following that same double-wrapper pattern.

## Deployment

Both `client/` and `server/` deploy independently to Railway (`railway.json` in each, `server/railpack.json` pins Node 22.12.0). The server exposes `GET /health` as its Railway healthcheck. The client's start command serves the static `dist/` build via `serve`, so build output — not a Node server — is what runs in production for the frontend.
