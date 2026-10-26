
# RedeemTrip

RedeemTrip is an AI-assisted flight and loyalty-points optimization platform.

It helps travelers compare cash fares and award-flight options to understand how they can use loyalty points more effectively.

## Core Features

- Authentication with Supabase.
- Conversational trip collection.
- AI-assisted extraction of trip details.
- Flight search through supported providers.
- Normalized cash and award-flight results.
- Deterministic redemption-value and savings calculations.
- Flight recommendations.
- Provider booking handoff.

## Technology Stack

- Next.js
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Prisma
- Zod
- Tailwind CSS
- shadcn/ui
- Groq

## Project Documentation

- `AGENTS.md` — AI agent instructions.
- `docs/prd.md` — Product requirements.
- `docs/trd.md` — Technical requirements.
- `docs/tasks.md` — Implementation checklist.
- `.cursor/rules/` — Cursor-specific rules.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` using the required variables.

Refer to `docs/trd.md` for the environment-variable names.

### 3. Configure the Database

Run the Prisma commands appropriate for the project's installed Prisma version and configuration.

### 4. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## MVP Scope

The MVP focuses on trip collection, flight search, deterministic optimization, and booking handoff.

RedeemTrip does not directly issue tickets, process flight payments, or automatically transfer loyalty points.