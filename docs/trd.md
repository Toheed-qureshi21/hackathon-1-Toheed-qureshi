# RedeemTrip — Technical Requirements Document

## 1. Technical Overview

RedeemTrip is a web application built with Next.js and TypeScript.

The application integrates:

- Supabase for authentication and PostgreSQL hosting.
- Prisma for database access.
- Groq for AI-assisted reasoning and explanations.
- Duffel for flight search and supported booking operations.

The implementation must follow the existing repository structure.

## 2. Architecture

### High-Level Request Flow

1. The client collects trip and rewards information.
2. The client sends validated request data to a server-side application endpoint.
3. The server verifies the authenticated user.
4. The server validates the request.
5. The server calls Duffel for flight search.
6. The server normalizes provider results.
7. The optimization service calculates available metrics.
8. Groq receives structured, relevant data and produces a constrained explanation or ranking.
9. The server validates the AI response.
10. The client renders the results.
11. Booking actions are performed server-side through Duffel.

The client must never call Duffel or Groq using secret API keys.

## 3. Application Structure

Use the existing structure where possible.

Suggested logical modules:

- `/app/` — routes and pages.
- `/components/` — shared UI components.
- `/features/auth/` — authentication UI and logic.
- `/features/planner/` — trip input and planner UI.
- `/features/flights/` — flight result components.
- `/features/rewards/` — rewards input and optimization UI.
- `/features/bookings/` — booking and history UI.
- `/lib/` — shared libraries and configuration.
- `/server/` — server-only services.
- `/server/duffel/` — Duffel integration.
- `/server/groq/` — Groq integration.
- `/server/optimization/` — deterministic calculations and ranking.
- `/server/auth/` — server-side authorization.
- `/schemas/` — Zod validation schemas.
- `prisma/` — Prisma schema and migrations.

These are suggested boundaries, not a requirement to create empty folders immediately.

## 4. Authentication

Use Supabase authentication.

Requirements:

- Protect authenticated pages and server operations.
- Validate the current user on the server.
- Do not trust user IDs supplied by the client.
- Derive ownership from the authenticated session.
- Ensure booking history is scoped to the current user.

## 5. Database

Use Prisma with PostgreSQL.

The exact schema must be finalized after inspecting the existing Prisma schema and Supabase setup.

### Suggested Entities

#### User

Application user identity and profile fields.

#### UserRewardBalance

Stores user-provided rewards information.

Suggested fields:

- `id`
- `userId`
- `programName`
- `programType`
- `balance`
- `currency` or points unit where applicable
- `createdAt`
- `updatedAt`

#### TripSearch

Stores user trip search inputs and relevant search metadata.

#### FlightOfferSnapshot

Stores the minimum provider offer data needed for a search result or booking handoff, subject to provider terms and offer expiry.

#### Booking

Stores:

- `id`
- `userId`
- Provider booking identifier
- Provider status
- Relevant trip summary
- Total price and currency when available
- Created and updated timestamps

Do not store unnecessary passenger or payment data.

Use appropriate foreign keys, indexes, and unique constraints.

## 6. Flight Provider Integration

Duffel integration must be isolated in a server-side module.

Responsibilities:

- Create flight search requests.
- Parse provider responses.
- Normalize supported flight and offer fields.
- Preserve the provider offer identifier.
- Handle expired or unavailable offers.
- Retrieve current offer details before booking where required.
- Create bookings using the provider's documented flow.
- Retrieve and reconcile booking status.

Do not fabricate provider response fields.

Use the provider's current API documentation to verify request and response shapes during implementation.

## 7. AI Integration

Groq integration must be server-side.

The AI may:

- Explain tradeoffs between available offers.
- Summarize why an offer fits user preferences.
- Help rank options using supplied, verified data.
- Produce structured recommendation explanations.

The AI must not:

- Invent prices or flight schedules.
- Invent point redemption requirements.
- Claim a booking is confirmed.
- Create unsupported redemption-transfer assumptions.
- Replace deterministic calculations with unverified arithmetic.

### AI Output

Use a structured response schema, validated with Zod.

The AI response should reference known offer IDs. The server must reject or ignore references to unknown offers.

For core arithmetic, calculate values in application code.

## 8. Optimization Logic

Where the necessary data is available, calculate redemption value deterministically.

A common cash-equivalent value calculation is:

`(cash price avoided - additional fees) / points required`

The result may be converted to a per-point value using a clearly specified unit.

Only calculate this when:

- Cash price is known.
- Points required are known.
- Additional fees are known or explicitly accounted for.
- The comparison represents a valid redemption alternative.

If one or more required values are missing, mark the metric as unavailable.

Do not compare unrelated currencies or rewards units without a documented conversion basis.

## 9. Booking Flow

Booking must be explicit and server-controlled.

Requirements:

- Validate the selected offer.
- Recheck offer validity and price where required.
- Validate passenger details.
- Show the final price and relevant conditions.
- Require explicit user confirmation.
- Use idempotency or equivalent duplicate-request protection where supported.
- Persist the provider booking identifier and returned status.
- Display confirmation only after provider confirmation.

Never store raw card data or CVV.

Payment processing must follow Duffel's supported flow and applicable provider requirements.

## 10. Validation and Error Handling

Use Zod at API boundaries.

Handle:

- Invalid input.
- Unauthenticated requests.
- Unauthorized access.
- Provider errors.
- Provider rate limits.
- Expired offers.
- AI timeouts or malformed output.
- Database failures.
- Duplicate booking requests.
- Pending booking status.

Return user-safe error messages. Keep sensitive provider details in server logs only when appropriate.

## 11. Testing

Required testing areas:

- Authentication and authorization.
- Trip input validation.
- Flight provider response parsing.
- Optimization calculations.
- AI output validation.
- Booking state transitions.
- Duplicate booking prevention.
- User ownership checks.
- Loading, empty, and error UI states.

Use mocked provider responses for deterministic tests.

## 12. Environment Configuration

Use environment variables for credentials.

Expected variable names are listed in `.env.example`.

Do not commit actual API keys or production credentials.

## 13. Implementation Principle

Implement the vertical slice incrementally:

1. Application shell and UI.
2. Authentication.
3. Trip input.
4. Flight search.
5. Results normalization.
6. Rewards calculations.
7. AI explanations.
8. Booking flow.
9. Booking history.
10. Testing and hardening.

Do not implement all provider integration layers before the core user flow is working.