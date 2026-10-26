# RedeemTrip — Implementation Tasks

## Phase 0 — Project Inspection

- [ ] Inspect the existing Next.js project structure.
- [ ] Read `AGENTS.md`, `docs/prd.md`, and `docs/trd.md`.
- [ ] Inspect `design-reference/`.
- [ ] Inspect `package.json` and installed dependencies.
- [ ] Inspect existing Supabase configuration.
- [ ] Inspect the Prisma schema and generated client setup.
- [ ] Identify existing components and utilities.
- [ ] Report any conflicts or missing configuration.
- [ ] Do not recreate or replace existing setup without justification.

## Phase 1 — Application Foundation

- [x] Establish the application layout.
- [x] Configure fonts and brand tokens.
- [ ] Implement shared navigation and footer.
- [x] Implement shared button, input, card, and form components.
- [x] Ensure responsive behavior.
- [x] Add loading, empty, and error state patterns.
- [x] Verify the app runs locally.

## Phase 2 — Public Pages

- [ ] Implement the landing page using `design-reference/landing.html`.
- [x] Implement login using `design-reference/login.html`.
- [x] Implement signup using `design-reference/signup.html`.
- [x] Reuse the supplied logo and icons.
- [x] Verify keyboard accessibility.
- [x] Verify mobile layouts.

## Phase 3 — Authentication

- [ ] Implement signup.
- [ ] Implement login.
- [ ] Implement logout.
- [ ] Add server-side session verification.
- [ ] Protect planner and booking routes.
- [ ] Add appropriate authentication error states.
- [ ] Test protected route access.

## Phase 4 — Planner UI

- [ ] Implement the planner page using `design-reference/planner.html`.
- [ ] Collect origin and destination.
- [ ] Collect trip type and dates.
- [ ] Collect passenger count.
- [ ] Collect cabin preference.
- [ ] Collect rewards program and balance information.
- [ ] Add Zod validation.
- [ ] Add loading and validation states.
- [ ] Preserve valid form data during the search flow.

## Phase 5 — Duffel Flight Search

- [ ] Verify current Duffel API requirements and account access.
- [ ] Implement server-side Duffel configuration.
- [ ] Implement flight search.
- [ ] Normalize provider responses.
- [ ] Preserve offer IDs and relevant provider metadata.
- [ ] Handle empty results and provider errors.
- [ ] Implement flight result cards.
- [ ] Display real provider values only.
- [ ] Test with mocked provider responses.

## Phase 6 — Rewards Optimization

- [ ] Define supported rewards inputs.
- [ ] Define the supported redemption data sources.
- [ ] Implement deterministic calculations.
- [ ] Handle missing or incomparable values.
- [ ] Implement option ranking.
- [ ] Integrate Groq for explanations.
- [ ] Validate AI output with Zod.
- [ ] Ensure AI output references valid offer IDs.
- [ ] Display assumptions and limitations.
- [ ] Test calculation correctness.

## Phase 7 — Booking

- [ ] Verify Duffel booking and payment requirements.
- [ ] Implement selected-offer review.
- [ ] Implement passenger information form.
- [ ] Validate passenger data.
- [ ] Recheck offer validity and pricing as required.
- [ ] Implement explicit booking confirmation.
- [ ] Add duplicate-request protection.
- [ ] Persist provider booking identifiers and status.
- [ ] Implement pending, failed, and confirmed states.
- [ ] Display confirmation only after provider confirmation.
- [ ] Test booking state transitions.

## Phase 8 — Booking History

- [ ] Implement booking history page.
- [ ] Fetch only the authenticated user's bookings.
- [ ] Display booking details and provider status.
- [ ] Add loading, empty, and error states.
- [ ] Test ownership authorization.

## Phase 9 — Quality and Demo Readiness

- [ ] Run TypeScript checks.
- [ ] Run linting.
- [ ] Run relevant tests.
- [ ] Verify responsive layouts.
- [ ] Verify accessibility basics.
- [ ] Verify no secrets are exposed to the client.
- [ ] Verify no fake flight or booking data is used in the live flow.
- [ ] Verify provider failure states.
- [ ] Update README setup instructions.
- [ ] Prepare a reliable demo flow.

## Definition of Done

A task is complete when:

- Its acceptance criteria are implemented.
- TypeScript and lint checks pass where applicable.
- Relevant tests pass.
- Loading, empty, and error states are handled.
- No secrets or sensitive data are exposed.
- Documentation is updated when needed.
- The task status is updated in this file.