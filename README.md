# RedeemTrip

**Travel smarter. Redeem better.**

RedeemTrip is an AI-assisted trip planner that helps travelers decide whether to **pay cash** or **use loyalty points** for a flight.

Describe a trip in chat, save your rewards balance, search live cash fares, and see two prices side by side:

- **Cash price** — Duffel fare
- **Price with points** — the same fare after your confirmed points are applied

The app is built to help people use points they already have. It does not push overspending, new cards, or debt to earn more rewards.

---

## What the app does

Travelers often see a cash fare in one place and a points balance in another, with no clear comparison.

RedeemTrip brings those pieces together:

1. You sign in.
2. You describe the trip in natural language (or fill the trip form).
3. The assistant collects missing details: origin, destination, dates, passengers, cabin, and rewards.
4. You save a validated trip with confirmed point balances.
5. The app searches **cash flights** through Duffel.
6. A **rules engine** (not the AI) calculates cash vs price with points, shortfall, and earning timeline.

Groq helps gather trip details. Duffel supplies cash fares. All money and points math runs on the server with fixed rules.

---

## Features

### Public site

- Landing page with product story, methodology, and FAQ
- Shared navigation and authentication entry points
- Login and signup (Supabase Auth)

### Trip planner

- Conversational planner at `/planner` (protected)
- Groq chat that extracts trip intent and asks follow-up questions
- Structured trip form for:
  - Origin and destination (airport suggestions with IATA codes)
  - One-way or return
  - Dates and date flexibility (stored; search uses exact dates)
  - Passenger count and cabin class
  - Rewards programs and confirmed or unknown balances
  - Optional monthly points-earning estimate
- Session trip state, validation, and recoverable errors
- Multiple conversations in the sidebar

### Cash flight search

- Duffel cash-fare search (not award inventory)
- Airport / place autocomplete
- Normalized offers: airline, itinerary, total price, currency
- Live-mode vs test-mode labels so test prices are never presented as live market fares
- Clear empty and error states when a route returns no offers

### Rewards comparison

When you have a **confirmed points balance**, the planner shows:

| Label | Meaning |
| --- | --- |
| **Cash price** | Lowest comparable Duffel fare |
| **Price with points** | Cash fare minus your points (1 point = 0.01 of the fare currency) |

Also included:

- Discount on each flight card and in the rewards panel
- Shortfall vs an optional award quote you enter (points required + taxes/fees)
- Value per point when cash and taxes share the same currency
- Months to close a shortfall: `ceil(shortfall ÷ monthly earning estimate)`
- Provenance labels (Duffel cash, user-confirmed balance, user-supplied quote)

Supported programs in this build:

- Iberia (Avios)
- British Airways (Avios)
- Qatar Airways Privilege Club (Qmiles)
- Revolut (RevPoints)
- American Express Business Platinum (Membership Rewards)

---

## How the points price is calculated

If you have a confirmed balance and a cash fare:

```text
price with points = max(0, cash fare − (confirmed points × 0.01))
```

Example: **40,000 points** against a **€289.97** cash fare → **€0.00** with points.

If you enter a specific award quote (points required + taxes/fees), the engine uses that quote instead: shortfall, value per point, and out-of-pocket taxes.

The LLM never invents fares, award seats, or these numbers.

---

## Product principles

- **Data before AI** — prices and calculations come from Duffel, your trip form, or a quote you enter
- **Cash is not an award ticket** — cash results stay labeled as cash
- **Deterministic math** — same inputs always produce the same comparison
- **Honest gaps** — no live award search, no fabricated inventory
- **No booking required** — the MVP is complete when it can search, compare, and explain

---

## What this MVP does not do

- Book or pay for flights
- Search live award seats or official program award charts
- Transfer points between programs
- Buy points or recommend new credit cards
- Persist saved trips across devices in a trip database (planner state is session-based)

---

## Tech stack

| Area | Choice |
| --- | --- |
| App | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS |
| Auth | Supabase Auth (SSR) |
| Database | PostgreSQL + Prisma 7 |
| Validation | Zod |
| AI chat | Groq |
| Cash flights | Duffel API v2 |
| Rewards math | Server-side rules engine |

---

## App workflow

```text
Landing → Sign in → Planner chat
                 → Trip form + rewards
                 → Validate & save
                 → Duffel cash search
                 → Rewards engine
                 → Cash price vs price with points
```

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and set:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=
GROQ_MODEL=                  # optional
DUFFEL_ACCESS_TOKEN=
DUFFEL_API_BASE_URL=         # optional, defaults to https://api.duffel.com
```

Never commit real keys.

### 3. Database

Use the existing Prisma 7 setup and apply the project migrations against your PostgreSQL database.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Test

```bash
npm test
npm run lint
```

Tests cover auth schemas, trip validation, planner chat, Duffel search (mocked), and rewards evaluation. They do not call live Groq or Duffel.

---

## Project docs

- [`docs/prd.md`](docs/prd.md) — product requirements
- [`docs/trd.md`](docs/trd.md) — technical requirements
- [`docs/tasks.md`](docs/tasks.md) — implementation checklist

---

RedeemTrip helps you compare a real cash fare with the price after your points — clearly, and without inventing award inventory.
