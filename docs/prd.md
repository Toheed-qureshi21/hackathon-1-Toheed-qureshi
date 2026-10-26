# RedeemTrip — Product Requirements Document

## 1. Product Overview

RedeemTrip is an AI-powered travel rewards optimization and flight booking platform.

It helps users make better use of credit card reward points, airline miles, and cash by comparing flight options and identifying valuable redemption strategies.

### Brand

- Product: RedeemTrip
- Tagline: Travel smarter. Redeem better.
- Brand promise: Make your points and miles go further.

## 2. Problem Statement

Travelers often have rewards across credit cards and airline loyalty programs but struggle to determine:

- Which flight is the best value?
- Should they pay cash or redeem points?
- Which rewards balance should they use?
- How much value are their points providing?
- Which available flight should they book?

RedeemTrip brings flight search, rewards comparison, and booking into one experience.

## 3. Target Users

### Primary Users

Travelers who:

- Have credit card reward points or airline miles.
- Want to reduce the cost of flights.
- Find reward redemption calculations confusing.
- Want to compare cash and rewards options before booking.

### MVP User

A traveler who knows their destination and dates and wants to identify the most valuable available flight using their rewards.

## 4. Product Goals

The MVP must allow a user to:

1. Create an account and sign in.
2. Enter trip requirements.
3. Enter relevant rewards balances.
4. Search real flight options.
5. Compare cash and rewards-related costs where supported by available provider data.
6. Receive a recommendation with a transparent explanation.
7. Select a flight.
8. Proceed through a supported booking flow.
9. View the resulting booking status.

## 5. MVP Scope

### 5.1 Authentication

Users can:

- Sign up.
- Log in.
- Log out.
- Access protected planner and booking pages.

Use the project's configured Supabase authentication approach.

### 5.2 Trip Input

The planner collects:

- Origin airport.
- Destination airport.
- Departure date.
- Return date when applicable.
- Trip type: one-way or round-trip.
- Number of adult passengers.
- Cabin preference.
- Relevant travel preferences.

Input must be validated before flight search.

### 5.3 Rewards Information

The user can provide relevant rewards information, including:

- Credit card or rewards program.
- Available points balance.
- Airline loyalty program.
- Available miles balance.
- Other supported rewards information.

Only collect information required for the MVP.

Do not request full card numbers, CVV, banking passwords, or other payment credentials.

### 5.4 Flight Search

The application searches for flights through Duffel.

The user should be able to review available flight options, including relevant information returned by the provider:

- Airline.
- Departure and arrival airports.
- Departure and arrival times.
- Duration.
- Stops.
- Cabin.
- Fare conditions.
- Total price and currency.
- Available offer identifiers.

Only show fields supported by actual provider responses.

### 5.5 Rewards Optimization

The application evaluates flight options using available, verified information.

The recommendation should consider:

- Total cash price.
- Points or miles required, when available.
- User's available rewards balance.
- Estimated redemption value.
- Travel preferences.
- Relevant fare conditions.

Groq may assist with reasoning, ranking explanations, and user-facing summaries.

The AI must not invent provider data.

### 5.6 Recommendation Results

Each result should clearly distinguish:

- Cash price.
- Points or miles required, if known.
- Additional cash fees, if known.
- Estimated redemption value.
- Recommendation rationale.
- Important limitations or missing data.

If points availability or redemption pricing is not supported by the provider, display that information as unavailable rather than estimating it as fact.

### 5.7 Booking

The user can select a flight and proceed to booking through Duffel.

The booking experience must:

- Show the selected flight and total price.
- Collect required passenger information.
- Validate required fields.
- Use the provider's supported booking and payment flow.
- Show booking confirmation only after provider confirmation.
- Handle pending, failed, and successful states.
- Prevent accidental duplicate booking submissions.

### 5.8 Booking History

Authenticated users can view their own booking records and available booking status information.

Only show records belonging to the authenticated user.

## 6. Out of Scope for MVP

Unless explicitly added later:

- Automatic transfer of credit card points to airline programs.
- Guaranteed award-seat availability across external loyalty programs.
- Automatic booking without user confirmation.
- Complex multi-city optimization.
- Hotel and car rental booking.
- Loyalty account credential storage.
- Full financial account aggregation.
- Automated cancellation or refund processing.
- Advanced price prediction.

## 7. Non-Functional Requirements

### Security

- Protect authenticated routes and API operations.
- Keep secrets server-side.
- Validate all untrusted input.
- Enforce ownership checks for user data.
- Avoid logging sensitive passenger or payment data.

### Reliability

- Handle provider errors gracefully.
- Do not treat stale offers as current.
- Confirm booking status with the provider.
- Handle repeated requests safely.

### Usability

- Provide clear loading and error states.
- Use accessible labels and keyboard-friendly controls.
- Support responsive layouts.
- Clearly explain recommendations.

## 8. MVP Success Criteria

The MVP is successful when a user can:

1. Sign up and log in.
2. Enter a trip and rewards details.
3. Search real flights.
4. View available options.
5. Understand the recommendation and its assumptions.
6. Select an offer.
7. Complete or proceed through the supported booking flow.
8. See the actual provider booking result.

## 9. Important Product Assumption

Duffel flight offers and booking capabilities must be verified against the enabled account and provider API.

Do not assume that Duffel directly supports redemption using every credit card or airline loyalty program.

The product must distinguish provider-supported booking from rewards optimization that is calculated or estimated by RedeemTrip.