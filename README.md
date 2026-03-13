# Food Log App

A full stack nutrition tracker built with Node/Express, PostgreSQL (Prisma), and React.

## Features
- User authentication (JWT)
- Set daily macro goals (calories, protein, carbs, fat)
- Log meals with macro breakdown
- Track daily water intake
- End-of-day summary with charts

## Tech Stack
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Frontend:** React (Vite), React Query, Recharts
- **Security:** JWT, Zod validation, express-rate-limit

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL running locally

### Setup
1. Clone the repo
2. Copy `.env.example` to `.env` in both `/server` and `/client`
3. Fill in your environment variables
4. Run `npm install` in both folders
5. Run `npx prisma migrate dev` in `/server`
6. Start the server: `npm run dev` in `/server`
7. Start the client: `npm run dev` in `/client`

## Known Audit Warnings
Remaining `npm audit` warnings are isolated to Prisma's internal 
dev tooling (`@prisma/dev`, `hono`, `lodash`). These packages are 
not exposed in the application runtime and do not affect production 
security. Fixing them requires a breaking Prisma downgrade.

```