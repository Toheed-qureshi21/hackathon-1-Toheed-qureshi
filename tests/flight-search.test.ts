import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DuffelApiError,
  mapDuffelErrorToStatus,
  publicDuffelErrorMessage,
} from "../lib/duffel/duffel-http.ts";
import { handleFlightSearchPost } from "../lib/flights/flight-search-handler.ts";
import { handlePlacesSearchGet } from "../lib/flights/places-search-handler.ts";
import { mapTripToDuffelOfferRequest } from "../lib/flights/map-trip-to-duffel.ts";
import { normalizeDuffelOffer } from "../lib/flights/normalize-duffel-offers.ts";
import { flightSearchRequestSchema } from "../schemas/flightSearchSchema.ts";
import { tripPlannerInputSchema } from "../schemas/tripPlannerSchema.ts";

const validTrip = tripPlannerInputSchema.parse({
  origin: "Mumbai",
  destination: "London",
  journeyType: "one_way",
  departureDate: "2026-12-10",
  returnDate: null,
  passengerCount: 2,
  cabinClass: "economy",
  dateFlexibility: "plus_minus_3",
  rewards: [],
});

const validReturnTrip = tripPlannerInputSchema.parse({
  ...validTrip,
  journeyType: "return",
  returnDate: "2026-12-20",
});

const validSearchBody = {
  trip: validTrip,
  originIataCode: "BOM",
  destinationIataCode: "LHR",
};

function mockDuffelClient(response: unknown) {
  return {
    request: async () => response,
  };
}

test("flightSearchRequestSchema accepts valid one-way search", () => {
  const parsed = flightSearchRequestSchema.safeParse(validSearchBody);
  assert.equal(parsed.success, true);
});

test("flightSearchRequestSchema accepts valid return search", () => {
  const parsed = flightSearchRequestSchema.safeParse({
    trip: validReturnTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
  });
  assert.equal(parsed.success, true);
});

test("flightSearchRequestSchema rejects identical IATA codes", () => {
  const parsed = flightSearchRequestSchema.safeParse({
    ...validSearchBody,
    destinationIataCode: "BOM",
  });
  assert.equal(parsed.success, false);
});

test("flightSearchRequestSchema rejects invalid IATA code", () => {
  const parsed = flightSearchRequestSchema.safeParse({
    ...validSearchBody,
    originIataCode: "Mumbai",
  });
  assert.equal(parsed.success, false);
});

test("mapTripToDuffelOfferRequest maps one-way slice and passengers", () => {
  const payload = mapTripToDuffelOfferRequest(
    flightSearchRequestSchema.parse(validSearchBody),
  );
  assert.equal(payload.slices.length, 1);
  assert.equal(payload.slices[0]?.origin, "BOM");
  assert.equal(payload.slices[0]?.destination, "LHR");
  assert.equal(payload.passengers.length, 2);
  assert.equal(payload.cabin_class, "economy");
});

test("mapTripToDuffelOfferRequest maps return slices", () => {
  const payload = mapTripToDuffelOfferRequest(
    flightSearchRequestSchema.parse({
      trip: validReturnTrip,
      originIataCode: "BOM",
      destinationIataCode: "LHR",
    }),
  );
  assert.equal(payload.slices.length, 2);
  assert.equal(payload.slices[1]?.origin, "LHR");
  assert.equal(payload.slices[1]?.destination, "BOM");
  assert.equal(payload.slices[1]?.departure_date, "2026-12-20");
});

test("normalizeDuffelOffer maps price, carrier, and segments", () => {
  const sample = JSON.parse(
    readFileSync(
      new URL("./fixtures/duffel-offer-sample.json", import.meta.url),
      "utf8",
    ),
  );
  const normalized = normalizeDuffelOffer(sample);
  assert.ok(normalized);
  assert.equal(normalized?.offerId, sample.id);
  assert.equal(normalized?.totalCurrency, "EUR");
  assert.match(
    normalized?.slices[0]?.segments[0]?.operatingCarrierName ?? "",
    /British Airways/,
  );
});

test("normalizeDuffelOffer rejects malformed provider payload", () => {
  assert.equal(normalizeDuffelOffer({ id: "off_x" }), null);
});

test("handleFlightSearchPost returns 401 when unauthenticated", async () => {
  const response = await handleFlightSearchPost(
    new Request("http://localhost/api/planner/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validSearchBody),
    }),
    {
      getAuthenticatedUser: async () => null,
      duffelClient: mockDuffelClient({ data: { offers: [] } }),
    },
  );
  assert.equal(response.status, 401);
});

test("handleFlightSearchPost returns no_offers without fabricating results", async () => {
  const response = await handleFlightSearchPost(
    new Request("http://localhost/api/planner/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validSearchBody),
    }),
    {
      getAuthenticatedUser: async () => ({ id: "user-1" }) as never,
      duffelClient: mockDuffelClient({
        data: { id: "orq_test", live_mode: false, offers: [] },
      }),
    },
  );
  assert.equal(response.status, 200);
  const body = (await response.json()) as { status: string; offers: unknown[] };
  assert.equal(body.status, "no_offers");
  assert.equal(body.offers.length, 0);
});

test("handleFlightSearchPost maps Duffel not_configured safely", async () => {
  const response = await handleFlightSearchPost(
    new Request("http://localhost/api/planner/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validSearchBody),
    }),
    {
      getAuthenticatedUser: async () => ({ id: "user-1" }) as never,
      duffelClient: {
        request: async () => {
          throw new DuffelApiError("not_configured", "missing token");
        },
      },
    },
  );
  assert.equal(response.status, 503);
  const body = (await response.json()) as { error: string };
  assert.match(body.error, /not configured/i);
});

test("handleFlightSearchPost maps timeout and rate limit", () => {
  assert.equal(mapDuffelErrorToStatus("timeout"), 504);
  assert.equal(mapDuffelErrorToStatus("rate_limit"), 429);
  assert.match(publicDuffelErrorMessage("rate_limit"), /busy/i);
});

test("handlePlacesSearchGet validates query length", async () => {
  const response = await handlePlacesSearchGet(
    new Request("http://localhost/api/planner/flights/places?query=a"),
    {
      getAuthenticatedUser: async () => ({ id: "user-1" }) as never,
      duffelClient: mockDuffelClient({ data: [] }),
    },
  );
  assert.equal(response.status, 400);
});
