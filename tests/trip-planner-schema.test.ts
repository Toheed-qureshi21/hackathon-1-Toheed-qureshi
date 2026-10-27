import assert from "node:assert/strict";
import test from "node:test";
import {
  rewardEntrySchema,
  tripPlannerFormSchema,
  tripPlannerInputSchema,
} from "../schemas/tripPlannerSchema.ts";

const validOneWay = {
  origin: "Mumbai (BOM)",
  destination: "London (LHR)",
  journeyType: "one_way" as const,
  departureDate: "2026-12-10",
  returnDate: null,
  passengerCount: 2,
  cabinClass: "business" as const,
  dateFlexibility: "plus_minus_3" as const,
  rewards: [
    {
      programId: "british_airways" as const,
      balanceStatus: "confirmed" as const,
      balancePoints: 68500,
    },
  ],
  monthlyPointsEstimate: null,
};

test("tripPlannerInputSchema accepts valid one-way trip", () => {
  const result = tripPlannerInputSchema.safeParse(validOneWay);
  assert.equal(result.success, true);
});

test("tripPlannerInputSchema accepts valid return trip", () => {
  const result = tripPlannerInputSchema.safeParse({
    ...validOneWay,
    journeyType: "return",
    returnDate: "2026-12-20",
  });
  assert.equal(result.success, true);
});

test("tripPlannerInputSchema rejects missing origin", () => {
  const result = tripPlannerInputSchema.safeParse({
    ...validOneWay,
    origin: "",
  });
  assert.equal(result.success, false);
});

test("tripPlannerInputSchema rejects identical origin and destination", () => {
  const result = tripPlannerInputSchema.safeParse({
    ...validOneWay,
    origin: "London",
    destination: "london ",
  });
  assert.equal(result.success, false);
});

test("tripPlannerInputSchema rejects return before departure", () => {
  const result = tripPlannerInputSchema.safeParse({
    ...validOneWay,
    journeyType: "return",
    returnDate: "2026-12-01",
  });
  assert.equal(result.success, false);
});

test("tripPlannerInputSchema requires return date for return journeys", () => {
  const result = tripPlannerInputSchema.safeParse({
    ...validOneWay,
    journeyType: "return",
    returnDate: null,
  });
  assert.equal(result.success, false);
});

test("tripPlannerInputSchema rejects invalid passenger count", () => {
  const result = tripPlannerInputSchema.safeParse({
    ...validOneWay,
    passengerCount: 0,
  });
  assert.equal(result.success, false);
});

test("tripPlannerInputSchema rejects unsupported cabin class", () => {
  const result = tripPlannerInputSchema.safeParse({
    ...validOneWay,
    cabinClass: "luxury",
  });
  assert.equal(result.success, false);
});

test("tripPlannerInputSchema rejects unsupported date flexibility", () => {
  const result = tripPlannerInputSchema.safeParse({
    ...validOneWay,
    dateFlexibility: "anytime",
  });
  assert.equal(result.success, false);
});

test("rewardEntrySchema accepts confirmed zero balance", () => {
  const result = rewardEntrySchema.safeParse({
    programId: "iberia",
    balanceStatus: "confirmed",
    balancePoints: 0,
  });
  assert.equal(result.success, true);
});

test("rewardEntrySchema accepts unknown balance", () => {
  const result = rewardEntrySchema.safeParse({
    programId: "revolut",
    balanceStatus: "unknown",
    balancePoints: null,
  });
  assert.equal(result.success, true);
});

test("rewardEntrySchema rejects negative balance", () => {
  const result = rewardEntrySchema.safeParse({
    programId: "revolut",
    balanceStatus: "confirmed",
    balancePoints: -100,
  });
  assert.equal(result.success, false);
});

test("rewardEntrySchema rejects confirmed without balance value", () => {
  const result = rewardEntrySchema.safeParse({
    programId: "revolut",
    balanceStatus: "confirmed",
    balancePoints: null,
  });
  assert.equal(result.success, false);
});

test("tripPlannerFormSchema accepts missing monthly estimate", () => {
  const result = tripPlannerFormSchema.safeParse({
    origin: "Mumbai",
    destination: "London",
    journeyType: "one_way",
    departureDate: "2026-12-10",
    returnDate: "",
    passengerCount: "2",
    cabinClass: "economy",
    dateFlexibility: "exact",
    rewards: [
      {
        programId: "iberia",
        balanceUnknown: true,
        balanceStatus: "unknown",
        balancePoints: "",
      },
    ],
    monthlyPointsEstimate: "",
  });
  assert.equal(result.success, true);
});

test("tripPlannerFormSchema rejects invalid monthly estimate", () => {
  const result = tripPlannerFormSchema.safeParse({
    origin: "Mumbai",
    destination: "London",
    journeyType: "one_way",
    departureDate: "2026-12-10",
    returnDate: "",
    passengerCount: "2",
    cabinClass: "economy",
    dateFlexibility: "exact",
    rewards: [],
    monthlyPointsEstimate: "-5",
  });
  assert.equal(result.success, false);
});
