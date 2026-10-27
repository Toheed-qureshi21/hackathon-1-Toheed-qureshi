# RedeemTrip — Development Tasks

## Task Status Legend

- `[x]` Completed and verified.
- `[ ]` Pending or not yet verified.

Do not mark tasks complete merely because code has been generated. Confirm implementation and relevant checks before changing a task's status.

---

## Engineering Rules

- [ ] Use TypeScript throughout the application.
- [ ] Validate request bodies, query parameters, and external provider responses using Zod.
- [ ] Use Next.js Route Handlers for backend operations. Do not introduce Server Actions.
- [ ] Authenticate protected requests server-side.
- [ ] Enforce ownership of user-specific resources on every relevant operation.
- [ ] Never trust a client-supplied user ID for authorization.
- [ ] Keep secrets and provider credentials server-side.
- [ ] Preserve the existing Prisma 7 setup, generated-client configuration, adapter, and singleton conventions.
- [ ] Preserve existing Supabase SSR authentication conventions and `proxy.ts`.
- [ ] Keep provider integrations behind dedicated adapters.
- [ ] Keep cash-flight search separate from award-flight search.
- [ ] Keep provider retrieval, data normalization, deterministic calculations, and AI explanations as separate responsibilities.
- [ ] Never let Groq invent or override flight prices, award availability, program rules, point balances, or financial calculations.
- [ ] Never fabricate flight offers, award inventory, transfer eligibility, purchase prices, or points-earning rates.
- [ ] Distinguish provider-verified facts, user-provided inputs, and estimates.
- [ ] Handle loading, empty results, validation errors, timeouts, rate limits, and provider failures explicitly.
- [ ] Return safe API errors without leaking secrets, stack traces, or sensitive data.
- [ ] Never encourage unnecessary spending, overspending, debt, or paying interest to earn rewards.
- [ ] Encourage users to earn rewards through spending they already planned.
- [ ] Recommend considering a points transfer only after confirming a suitable redemption and its availability.
- [ ] Do not claim that a booking, transfer, or points purchase has succeeded without provider confirmation.
- [ ] Follow the existing UI and design references. Do not redesign unrelated pages during feature implementation.
- [ ] Do not mark unsupported provider capabilities as implemented.

---

## Phase 0 — Project Inspection

- [x] Inspect the existing repository structure.
- [x] Review the existing Next.js and TypeScript setup.
- [x] Review the existing authentication implementation.
- [x] Review the Supabase and Prisma integration.
- [x] Review the existing design references and project conventions.

## Phase 1 — Foundation

- [x] Set up the Next.js application foundation.
- [x] Configure TypeScript and the existing styling system.
- [x] Configure the existing Supabase integration.
- [x] Configure Prisma and PostgreSQL connectivity.
- [x] Establish the existing environment-variable conventions.
- [x] Establish the shared UI and layout foundation.
- [x] Establish the project's baseline validation and build workflow.

## Phase 2 — Public Pages

- [x] Implement the public landing page.
- [x] Implement the shared marketing layout.
- [x] Implement the existing public navigation.
- [x] Implement the existing public-page responsive layouts.
- [x] Follow the approved design references.

## Phase 3 — Authentication

- [x] Implement the authentication API Route Handlers.
- [x] Implement signup, login, logout, and current-user endpoints.
- [x] Implement the Supabase Auth callback flow.
- [x] Implement server-side authentication utilities.
- [x] Implement user-profile creation or synchronization with Prisma.
- [x] Implement the client-side authentication API utilities.
- [x] Add Zod validation for authentication requests.
- [x] Implement authentication error mapping.
- [x] Integrate the existing login and signup forms.
- [x] Integrate the navigation's authentication state.
- [x] Add authentication schema tests.
- [ ] Verify the Supabase dashboard configuration for redirect URLs, email confirmation, and required authentication settings.
- [ ] Verify the configured email delivery flow without relying on repeated attempts that exceed provider rate limits.
- [ ] Run live authentication tests against the configured development or staging environment.
- [ ] Verify protected routes and APIs reject unauthenticated requests.
- [ ] Verify user-specific data cannot be accessed by another authenticated user.

**Status note:** The implementation tasks above were previously reported as completed. The remaining configuration and end-to-end verification tasks must stay open until confirmed.

## Phase 4 — Trip Planner UI and User Inputs

- [x] Implement the trip-planner page.
- [x] Implement the planner's basic loading states.
- [x] Implement the conversational trip input interface.
- [x] Implement structured trip requirements collection.
- [x] Collect origin and destination.
- [x] Collect departure and return dates where applicable.
- [x] Collect one-way or return-trip preference.
- [x] Collect passenger count.
- [x] Collect cabin class.
- [x] Collect date flexibility.
- [x] Allow users to correct previously supplied trip details.
- [x] Implement rewards-program selection using the initial supported-program list.
- [x] Collect the user's card or financial product details where relevant.
- [x] Collect user-confirmed points balances by program.
- [x] Collect an optional user-confirmed monthly points-earning estimate.
- [x] Validate all trip and rewards inputs.
- [x] Implement empty, validation, loading, and recoverable-error states.
- [x] Preserve the approved planner design and existing component conventions.

## Phase 5 — AI Chat and Conversation Orchestration

- [x] Create a dedicated Route Handler for trip-planning chat requests.
- [x] Validate incoming chat requests with Zod.
- [x] Integrate Groq through a server-side service.
- [x] Extract structured trip intent from natural-language messages.
- [x] Identify missing trip requirements and ask relevant follow-up questions.
- [x] Maintain structured conversation and trip-planning state.
- [x] Allow users to correct or replace previously provided values.
- [x] Validate AI-generated structured output before using it.
- [x] Keep backend-owned trip state authoritative.
- [x] Define the transition from collecting trip information to searching for flights.
- [x] Ensure the AI does not claim that a search has completed before provider results exist.
- [x] Ensure the AI does not invent flight prices, award availability, program rules, balances, or calculations.
- [x] Add responsible-use constraints to AI instructions.
- [x] Prevent advice that encourages unnecessary spending, borrowing, debt, or paying interest to earn rewards.
- [x] Test incomplete requests, ambiguous dates, invalid structured output, and provider errors.
- [x] Test graceful behavior when the Groq service is unavailable.

**Phase 5 env:** set `GROQ_API_KEY` (server-only). Optional `GROQ_MODEL` (defaults to `openai/gpt-oss-20b` via `lib/groq/config.ts`). Run chat tests with `npm run test:planner-chat` (uses mocked Groq; no API credits required).

## Phase 6 — Duffel Cash-Flight Search

- [x] Verify Duffel API access, credentials, terms, and relevant flight-search capabilities.
- [x] Document the required environment variables without exposing their values.
- [x] Implement a server-side Duffel client or provider adapter.
- [x] Define application-owned schemas for cash-flight search requests.
- [x] Validate outbound search inputs.
- [x] Normalize Duffel responses into an application-owned cash-offer format.
- [x] Capture itinerary details and total prices where available.
- [x] Preserve currency and relevant fare conditions.
- [x] Validate provider responses before returning them to the client.
- [x] Implement provider timeouts and safe error handling.
- [x] Handle rate limits, malformed responses, and empty search results.
- [x] Ensure the UI clearly identifies cash-priced flight offers.
- [x] Ensure provider failures do not generate fake offers.
- [x] Add tests for normalization, validation, errors, and empty results.
- [x] Verify the integration using authorized test or live data as appropriate.

**Phase 6 env:** set `DUFFEL_ACCESS_TOKEN` (server-only). Optional `DUFFEL_API_BASE_URL` (defaults to `https://api.duffel.com`). Uses Duffel API `Duffel-Version: v2`. Location autocomplete: `GET /places/suggestions`. Cash search: `POST /air/offer_requests?return_offers=true`. Run tests with `npm run test:flight-search` (mocked Duffel; no live calls).

**Limitations:** Date flexibility is stored on the trip but search uses exact departure/return dates only. Airport codes must be chosen from Duffel suggestions — free text is not converted to IATA. Test-mode offers are labeled in the UI and are not guaranteed real-world prices.

**Important:** Duffel cash-search access does not establish that award-flight inventory is available through Duffel.

## Phase 7 — Award-Availability Provider Investigation and Integration

### Provider Investigation

- [ ] Identify candidate award-search providers relevant to the target MVP.
- [ ] Verify whether each candidate offers an API or another authorized integration.
- [ ] Verify access requirements, commercial terms, rate limits, and coverage.
- [ ] Verify which airlines, programs, routes, and cabins are supported.
- [ ] Determine whether results represent live availability, cached data, or estimates.
- [ ] Document provider limitations and integration feasibility.
- [ ] Select a provider only after its suitability and access have been confirmed.

### Award-Search Implementation

- [ ] Define a dedicated award-search adapter interface separate from the cash-search adapter.
- [ ] Define validated award-search request and response schemas.
- [ ] Implement the adapter only when authorized provider access is available.
- [ ] Normalize award results, including points required, taxes, fees, and program where supplied.
- [ ] Validate the freshness and meaning of availability data to the extent supported by the provider.
- [ ] Handle timeouts, provider errors, incomplete results, and empty availability.
- [ ] Clearly label award results as distinct from cash offers.
- [ ] Test award-result normalization and failure handling.
- [ ] Verify that no ordinary cash fare is ever displayed as an award redemption.

### Honest Fallback

- [ ] If a suitable award API is unavailable, document the blocker.
- [ ] Display a clear message that award availability could not be verified.
- [ ] Continue to show valid cash-search results where possible.
- [ ] Do not fabricate award inventory, points requirements, or award prices.
- [ ] Do not mark award search as completed until an authorized source has been integrated and verified.

## Phase 8 — Rewards Comparison and Points Shortfall

### Data Normalization

- [ ] Define shared normalized itinerary and cash-offer types.
- [ ] Define normalized award-offer types separately.
- [ ] Preserve currency, itinerary, cabin, passenger, and relevant fare details.
- [ ] Validate inputs before comparing cash and award offers.
- [ ] Reject or clearly flag comparisons between materially incomparable itineraries.

### Deterministic Calculations

- [ ] Implement a server-side rewards-comparison service.
- [ ] Calculate estimated value per point using validated comparable cash fares and award taxes and fees.
- [ ] Validate that points required are greater than zero.
- [ ] Ensure currency values are comparable and conversion is verified when needed.
- [ ] Calculate the user's points shortfall for an eligible award option.
- [ ] Never combine unrelated points balances without a verified eligible transfer or redemption path.
- [ ] Explain assumptions and relevant opportunity costs.
- [ ] Rank comparable results using explicit, deterministic criteria.
- [ ] Return structured calculations and explanatory metadata to the frontend.
- [ ] Add unit tests for calculations, invalid inputs, missing values, zero points, and currency mismatches.

### Basic Points-Accumulation Timeline

- [ ] Collect or confirm the user's estimated monthly points-earning amount.
- [ ] Calculate the estimated months needed using `points shortfall / estimated monthly points earned`.
- [ ] Handle zero shortfall without calculating unnecessary accumulation time.
- [ ] Handle missing, zero, negative, or unreliable earning estimates without producing a misleading timeline.
- [ ] Label valid results as estimates, not guarantees.
- [ ] Never infer earning rates from card names alone.
- [ ] Never fabricate monthly earning rates or assume that future spending will occur.
- [ ] Ensure the result does not encourage unnecessary spending, borrowing, or paying interest.
- [ ] Add unit tests for normal, zero, missing, invalid, and uncertain inputs.

### Results UI

- [ ] Display cash fares and award results as distinct result types.
- [ ] Display cash cost, points required, taxes, and fees where available.
- [ ] Display estimated value per point when valid inputs exist.
- [ ] Display the user's eligible points balance and calculated shortfall.
- [ ] Display an accumulation timeline only when a valid user-confirmed estimate exists.
- [ ] Explain why a comparison cannot be calculated when required information is missing.
- [ ] Provide loading, empty, unsupported, and error states.
- [ ] Ensure all displayed calculations come from backend results rather than LLM-generated numbers.

## Phase 9 — Transfer-Path Guidance

### Supported-Program Registry

- [ ] Establish a documented initial program list: Iberia, British Airways, Qatar Privilege Club, Revolut, and American Express Business Platinum.
- [ ] Record the exact product, country, membership type, and rewards currency where relevant.
- [ ] Verify each program's current transfer and redemption rules before enabling actionable guidance.
- [ ] Maintain a documented source and verification date for material program rules.
- [ ] Avoid treating the initial list as proof of universal transfer compatibility.

### Transfer-Path Verification

- [ ] Investigate the relevant BA/Avios relationships involving British Airways, Iberia, Vueling, Aer Lingus, Finnair, and Qatar Privilege Club.
- [ ] Verify each transfer direction and eligibility condition.
- [ ] Distinguish direct transfers, bridge-account arrangements, and other program-connectivity mechanisms.
- [ ] Verify account-age requirements for the specific path where applicable.
- [ ] Verify matching passport or identity-detail requirements for the specific path where applicable.
- [ ] Verify applicable transfer ratios, fees, processing times, and restrictions where reliable information is available.
- [ ] Verify any Revolut or American Express transfer path against the specific product and country rules before suggesting it.
- [ ] Do not infer transfer eligibility solely from a shared loyalty currency or program branding.

### Guidance UI and Logic

- [ ] Explain relevant verified transfer paths and eligibility conditions.
- [ ] Clearly identify unverified or unsupported paths.
- [ ] Recommend considering a transfer only after a suitable redemption and award availability have been confirmed.
- [ ] Explain that transferred points may be subject to program restrictions and availability changes.
- [ ] Do not initiate point transfers in the MVP.
- [ ] Test missing-rule, ineligible-user, and unsupported-path scenarios.

## Phase 10 — Buying-Points Guidance

- [ ] Define the conditions under which informational points-purchase guidance may be shown.
- [ ] Require a specific identified redemption and known points shortfall.
- [ ] Require reliable purchase pricing before calculating a purchase-cost comparison.
- [ ] Compare verified purchase cost against estimated redemption savings when all necessary data exists.
- [ ] Account for award taxes, fees, restrictions, and material uncertainty.
- [ ] Avoid a definitive recommendation when critical price or redemption data is missing.
- [ ] Show a limitation or general informational explanation when reliable data is unavailable.
- [ ] Do not implement points purchasing or payment processing in the MVP.
- [ ] Ensure the guidance never encourages debt, unnecessary spending, or interest-bearing borrowing.
- [ ] Add tests for missing purchase prices, invalid redemption data, and valid informational comparisons.

## Phase 11 — Flexible-Date Search

- [ ] Implement the flexible-date requirement from the original product brief.
- [ ] Collect the user's requested date range or flexibility preference.
- [ ] Verify the connected provider's flexible-date search capabilities.
- [ ] Search the supported date range when the provider supports it.
- [ ] Otherwise, allow separate searches for selected dates where feasible.
- [ ] Preserve relevant trip requirements across date comparisons.
- [ ] Do not invent date-specific offers or availability.
- [ ] Clearly explain unsupported provider capabilities.
- [ ] Test date-range validation, unsupported ranges, and partial results.

## Phase 12 — Saved Trip Plans

This phase is lower priority than the search-and-compare core.

- [ ] Define the saved-trip data model and ownership requirements.
- [ ] Allow authenticated users to save trip requirements.
- [ ] Allow users to retrieve their saved trips.
- [ ] Preserve relevant rewards inputs where appropriate.
- [ ] Enforce ownership on read, update, and delete operations.
- [ ] Mark stored flight prices and availability as potentially stale.
- [ ] Require a fresh search when current availability or prices are needed.
- [ ] Add persistence and authorization tests.

## Phase 13 — Booking and Point Transfers (Future Scope)

These tasks are not required for core MVP completion.

- [ ] Investigate authorized flight-booking capabilities and provider requirements.
- [ ] Investigate award-booking capabilities separately from cash booking.
- [ ] Define secure traveler-information and booking-confirmation flows.
- [ ] Define payment and booking failure handling.
- [ ] Verify any provider support for point transfers before considering automated transfers.
- [ ] Define explicit user confirmation requirements for irreversible actions.
- [ ] Do not implement or claim successful booking or transfer without verified provider confirmation.

## Phase 14 — Testing, Quality, and Demo Readiness

### Automated Tests

- [ ] Run TypeScript checks.
- [ ] Run lint checks.
- [ ] Run existing unit tests.
- [ ] Run authentication API tests.
- [ ] Add and run chat-orchestration tests.
- [ ] Add and run provider-adapter tests.
- [ ] Add and run rewards-calculation tests.
- [ ] Add and run points-shortfall and accumulation-timeline tests.
- [ ] Add and run transfer-guidance validation tests.
- [ ] Add and run flexible-date fallback tests.
- [ ] Run the production build.

### End-to-End Testing

- [ ] Verify signup and login against the configured environment.
- [ ] Verify protected planner access.
- [ ] Verify the trip-planning conversation.
- [ ] Verify validation of trip and rewards inputs.
- [ ] Verify cash-flight search when provider access is configured.
- [ ] Verify the award-search fallback when no authorized provider is available.
- [ ] Verify the comparison UI using actual provider responses or explicitly identified fixtures.
- [ ] Verify missing and zero monthly earning estimates.
- [ ] Verify transfer guidance is not displayed as verified without evidence.
- [ ] Verify provider errors and empty results.
- [ ] Verify that one user cannot access another user's saved trips or rewards data.

### Demo Readiness

- [ ] Confirm required environment variables are configured in the demo environment.
- [ ] Confirm secrets are not exposed to the client.
- [ ] Prepare a sample trip flow with clearly identified test or provider data.
- [ ] Prepare a comparison example with valid, comparable inputs.
- [ ] Prepare a points-shortfall example with a user-confirmed earning estimate.
- [ ] Prepare a demo path that remains useful if award-search integration is unavailable.
- [ ] Confirm that no fabricated live availability or unsupported transfer claims appear in the demo.
- [ ] Document known provider limitations and incomplete integrations.

---

## MVP Completion Checklist

The core MVP is complete only when all applicable items below are implemented and verified:

- [ ] Authentication works and protected data is authorized correctly.
- [ ] Users can complete a conversational trip-planning flow.
- [ ] Trip and rewards information is validated.
- [ ] Cash-flight search works through a configured, verified integration or the application provides a clear documented blocker and safe fallback.
- [ ] Award availability is retrieved only through an authorized, verified source; otherwise, the limitation is disclosed.
- [ ] Cash and award results are clearly distinguished.
- [ ] Comparable options are evaluated using deterministic backend calculations.
- [ ] Points shortfalls are calculated correctly.
- [ ] The basic accumulation timeline works with valid user-confirmed inputs and safely handles missing or zero estimates.
- [ ] Transfer guidance is limited to verified relationships and applicable eligibility conditions.
- [ ] Points-purchase guidance is informational, conditional, and based on reliable data.
- [ ] Responsible-use constraints are applied to AI explanations.
- [ ] Flexible-date search or a clear provider-dependent fallback is available.
- [ ] Loading, empty, validation, and provider-error states are handled.
- [ ] Relevant automated and end-to-end checks have been run.
- [ ] The demo does not fabricate flight, award, transfer, purchase, or calculation data.

## Explicitly Deferred

The following are not prerequisites for the core MVP:

- Full flight booking and payment.
- Award booking.
- Automated point transfers.
- Automated points purchasing.
- Personalized card recommendations.
- Personalized Revolut plan recommendations.
- Detailed card earning-rate optimization.
- Shopping-portal and merchant multipliers.
- Advanced future-points accumulation scenarios.
- Comprehensive loyalty-program coverage beyond verified integrations.
