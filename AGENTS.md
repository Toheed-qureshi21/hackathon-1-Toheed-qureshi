# RedeemTrip — Agent Instructions

## Project Overview

RedeemTrip is an AI-powered travel rewards optimization and flight booking platform.

**Tagline:** Travel smarter. Redeem better.

**Brand promise:** Make your points and miles go further.

The platform helps travelers compare cash fares, credit card rewards, and airline loyalty options to identify valuable flight redemption strategies.

Users provide their trip details and rewards information. RedeemTrip searches for real flight options, evaluates redemption value, recommends suitable options, and allows users to proceed with booking through Duffel.

## Read Before Implementing

Before making changes, read:

1. `docs/prd.md`
2. `docs/trd.md`
3. `docs/tasks.md`
4. `.cursor/rules/ui-design.mdc`
5. `.cursor/rules/nextjs.mdc`
6. `.cursor/rules/supabase-prisma.mdc`, if present

Also inspect the existing project structure and `design-reference/`.

## Core Product Flow

1. User visits RedeemTrip.
2. User signs up or logs in.
3. User enters origin, destination, travel dates, passengers, and cabin preference.
4. User provides relevant credit card rewards and loyalty program balances.
5. RedeemTrip searches for available flight options through Duffel.
6. The application evaluates available cash and rewards options.
7. Groq assists with structured reasoning and explanation of recommendations.
8. The application presents flight options, costs, points required, and redemption value.
9. User selects a flight.
10. User reviews passenger and booking information.
11. User proceeds through Duffel's supported booking flow.
12. The application displays the actual booking status and confirmation details returned by the provider.

Never fabricate flight availability, prices, points requirements, booking status, or confirmation numbers.

## Technology Constraints

Use the project's existing setup. The intended stack is:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Prisma
- Groq API
- Duffel API

Do not upgrade, replace, or install major dependencies without a clear need.

Preserve the existing Prisma version, generated client configuration, database adapter, and Supabase setup.

## Mandatory Architecture Rules

These requirements are strict. Do not replace them with alternative conventions without explicit approval.

### Supabase API Keys

Use the current Supabase API key format:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Do not use legacy Supabase `anon` or `service_role` keys or their environment variable names in new code or configuration.

The Publishable key is intended for normal application access with the user's authenticated session.

The Secret key is elevated and must remain server-side.

Never expose `SUPABASE_SECRET_KEY` through client-side code or a `NEXT_PUBLIC_` variable.

Do not use the Secret key as a substitute for user authentication or authorization.

Normal authenticated user operations should use the Publishable key with the user's session and appropriate access policies.

Server-side operations using the Secret key must perform the required application authorization checks.

### Next.js Proxy

Use the Next.js `proxy.ts` convention instead of `middleware.ts`.

- Do not create a `middleware.ts` file.
- Do not implement request interception using the legacy Middleware convention.
- Use `proxy.ts` for lightweight request-level authentication checks and redirects.
- Follow the conventions supported by the installed Next.js version.
- Do not treat Proxy as the only authorization layer.
- Protected server operations must independently verify authentication and resource ownership.

If a Proxy file already exists, inspect and update it rather than creating a duplicate.

### Prisma Client Singleton

Use a shared Prisma Client singleton.

In development, cache the Prisma Client instance on `globalThis` to prevent multiple instances during hot reloads.

- Do not instantiate a new Prisma Client in every route handler.
- Do not instantiate a new Prisma Client in every Server Action.
- Do not instantiate a new Prisma Client inside individual service functions.
- Reuse the existing Prisma Client module.
- Preserve the configured Prisma adapter and generated client.
- Do not create multiple independent Prisma Client instances without a documented requirement.

Inspect the existing Prisma setup before modifying it.

## Design References

The `design-reference/` directory contains static UI references.

- Treat these files as visual references, not production routes.
- Preserve the RedeemTrip visual identity.
- Reuse the logo and supplied icons.
- Do not modify or delete reference files.
- Implement real React components rather than embedding complete HTML documents.
- Follow `.cursor/rules/ui-design.mdc`.

## Engineering Rules

- Use TypeScript with strict typing.
- Avoid `any`; use `unknown` and validation where appropriate.
- Validate untrusted input at API boundaries.
- Keep secrets on the server.
- Never expose provider API keys to client components.
- Use server-side authorization for protected operations.
- Use database transactions when multiple related database writes must succeed together.
- Keep provider integrations isolated behind service modules.
- Handle loading, empty, error, and success states.
- Use accessible controls and semantic HTML.
- Avoid unnecessary abstractions and premature optimization.
- Do not duplicate existing utilities or components.

## Implementation Workflow

For each task:

1. Read the relevant requirements.
2. Inspect existing code before editing.
3. Identify the files that need changes.
4. Implement the smallest complete solution.
5. Run relevant linting, type checks, and tests.
6. Update `docs/tasks.md`.
7. Summarize what changed and any remaining limitations.

Do not mark a task complete unless the implementation and its required checks have been completed.

## Scope Control

Build the MVP first.

Do not implement unrelated features, speculative integrations, or unnecessary infrastructure.

If a requirement is ambiguous or a provider capability is unverified, document the uncertainty instead of inventing behavior.

## Booking Safety

Booking and payment actions must be explicit user actions.

- Do not create bookings merely because an AI recommendation was generated.
- Do not treat a search result as a confirmed booking.
- Do not claim a booking succeeded until the provider confirms it.
- Prevent accidental duplicate booking submissions.
- Clearly display the total amount and relevant booking conditions before confirmation.
- Use Duffel's supported booking and payment workflow.