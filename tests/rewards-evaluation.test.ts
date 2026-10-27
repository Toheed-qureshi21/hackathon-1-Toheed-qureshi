import assert from "node:assert/strict";
import test from "node:test";
import {
  AWARD_AVAILABILITY_NOTE,
  evaluateRewards,
  offersShareCurrency,
  parseMoneyAmount,
} from "../lib/rewards/evaluate-rewards.ts";
import { handleRewardsEvaluationPost } from "../lib/rewards/rewards-evaluation-handler.ts";
import type { NormalizedCashFlightOffer } from "../schemas/flightSearchSchema.ts";
import { rewardsEvaluationRequestSchema } from "../schemas/rewardsEvaluationSchema.ts";
import { tripPlannerInputSchema } from "../schemas/tripPlannerSchema.ts";

const baseTrip = tripPlannerInputSchema.parse({
  origin: "Mumbai",
  destination: "London",
  journeyType: "one_way",
  departureDate: "2026-12-10",
  returnDate: null,
  passengerCount: 1,
  cabinClass: "economy",
  dateFlexibility: "exact",
  rewards: [
    {
      programId: "british_airways",
      balanceStatus: "confirmed",
      balancePoints: 40_000,
    },
  ],
  monthlyPointsEstimate: 5_000,
});

function makeOffer(
  partial: Partial<NormalizedCashFlightOffer> & Pick<NormalizedCashFlightOffer, "offerId" | "totalAmount" | "totalCurrency">,
): NormalizedCashFlightOffer {
  return {
    baseAmount: null,
    taxAmount: null,
    expiresAt: null,
    liveMode: false,
    ownerCarrierName: "Test Air",
    fareBrandName: null,
    conditionsSummary: null,
    slices: [
      {
        originCode: "BOM",
        originName: "Mumbai",
        destinationCode: "LHR",
        destinationName: "London",
        duration: "PT10H",
        stopsCount: 0,
        segments: [
          {
            originCode: "BOM",
            originName: "Mumbai",
            destinationCode: "LHR",
            destinationName: "London",
            departingAt: "2026-12-10T06:00:00Z",
            arrivingAt: "2026-12-10T16:00:00Z",
            marketingCarrierName: "BA",
            marketingCarrierIata: "BA",
            marketingFlightNumber: "123",
            operatingCarrierName: "BA",
            operatingCarrierIata: "BA",
            operatingFlightNumber: "123",
            cabinClass: "economy",
            cabinMarketingName: "Economy",
            duration: "PT10H",
            stopsCount: 0,
          },
        ],
      },
    ],
    ...partial,
  };
}

test("parseMoneyAmount accepts valid decimals", () => {
  assert.equal(parseMoneyAmount("450.50"), 450.5);
  assert.equal(parseMoneyAmount("100"), 100);
});

test("parseMoneyAmount rejects invalid amounts", () => {
  assert.equal(parseMoneyAmount(""), null);
  assert.equal(parseMoneyAmount("-1"), null);
  assert.equal(parseMoneyAmount("12.345"), null);
});

test("cash ranking orders same-currency offers by ascending price", () => {
  const offers = [
    makeOffer({ offerId: "b", totalAmount: "500.00", totalCurrency: "GBP" }),
    makeOffer({ offerId: "a", totalAmount: "400.00", totalCurrency: "GBP" }),
    makeOffer({ offerId: "c", totalAmount: "450.00", totalCurrency: "GBP" }),
  ];
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers,
    redemptionAssumptions: [],
  });
  const gbp = result.cashOffersByCurrency.find((g) => g.currency === "GBP");
  assert.ok(gbp);
  assert.deepEqual(
    gbp.rankedOffers.map((o) => o.offerId),
    ["a", "c", "b"],
  );
  assert.equal(gbp.rankedOffers[0].rank, 1);
});

test("cash ranking groups incomparable currencies separately", () => {
  const offers = [
    makeOffer({ offerId: "usd1", totalAmount: "600", totalCurrency: "USD" }),
    makeOffer({ offerId: "gbp1", totalAmount: "400", totalCurrency: "GBP" }),
  ];
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers,
    redemptionAssumptions: [],
  });
  assert.equal(result.cashOffersByCurrency.length, 2);
  assert.ok(!result.cashOffersByCurrency.some((g) => g.rankedOffers.length > 1));
});

test("offersShareCurrency detects mismatch", () => {
  const gbp = makeOffer({ offerId: "1", totalAmount: "1", totalCurrency: "GBP" });
  const usd = makeOffer({ offerId: "2", totalAmount: "1", totalCurrency: "USD" });
  assert.equal(offersShareCurrency(gbp, gbp), true);
  assert.equal(offersShareCurrency(gbp, usd), false);
});

test("redemption valuePerPoint uses verified formula", () => {
  const offers = [
    makeOffer({ offerId: "cash", totalAmount: "500.00", totalCurrency: "GBP" }),
  ];
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers,
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 50_000,
        taxesAndFeesAmount: "100.00",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  const evalRow = result.redemptionEvaluations[0];
  assert.equal(evalRow.valuePerPointStatus, "calculated");
  assert.equal(evalRow.valuePerPoint, "0.0080");
  assert.equal(evalRow.isConfirmedAwardOption, false);
});

test("redemption value blocked on currency mismatch", () => {
  const offers = [
    makeOffer({ offerId: "cash", totalAmount: "500.00", totalCurrency: "USD" }),
  ];
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers,
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 50_000,
        taxesAndFeesAmount: "100.00",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  assert.equal(result.redemptionEvaluations[0].valuePerPointStatus, "missing_data");
});

test("schema rejects zero points requirement", () => {
  const parsed = rewardsEvaluationRequestSchema.safeParse({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 0,
        taxesAndFeesAmount: "50",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  assert.equal(parsed.success, false);
});

test("shortfall when balance insufficient", () => {
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 60_000,
        taxesAndFeesAmount: "80",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  const row = result.redemptionEvaluations[0];
  assert.equal(row.shortfallStatus, "insufficient");
  assert.equal(row.shortfallPoints, 20_000);
});

test("sufficient balance yields zero shortfall", () => {
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 30_000,
        taxesAndFeesAmount: "80",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  assert.equal(result.redemptionEvaluations[0].shortfallStatus, "sufficient");
  assert.equal(result.redemptionEvaluations[0].shortfallPoints, 0);
});

test("unknown balance does not compute shortfall as zero", () => {
  const trip = tripPlannerInputSchema.parse({
    ...baseTrip,
    rewards: [
      {
        programId: "british_airways",
        balanceStatus: "unknown",
        balancePoints: null,
      },
    ],
  });
  const result = evaluateRewards({
    trip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 30_000,
        taxesAndFeesAmount: "80",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  assert.equal(result.redemptionEvaluations[0].shortfallStatus, "unknown_balance");
  assert.equal(result.redemptionEvaluations[0].shortfallPoints, null);
});

test("confirmed zero balance shows full shortfall", () => {
  const trip = tripPlannerInputSchema.parse({
    ...baseTrip,
    rewards: [
      {
        programId: "british_airways",
        balanceStatus: "confirmed",
        balancePoints: 0,
      },
    ],
  });
  const result = evaluateRewards({
    trip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 25_000,
        taxesAndFeesAmount: "80",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  assert.equal(result.redemptionEvaluations[0].shortfallStatus, "insufficient");
  assert.equal(result.redemptionEvaluations[0].shortfallPoints, 25_000);
});

test("earning timeline uses ceil shortfall over monthly estimate", () => {
  const offers = [
    makeOffer({ offerId: "c", totalAmount: "400", totalCurrency: "GBP" }),
  ];
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers,
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 60_000,
        taxesAndFeesAmount: "80",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  const row = result.redemptionEvaluations[0];
  assert.equal(row.earningTimelineStatus, "calculated");
  assert.equal(row.earningTimelineMonths, 4);
});

test("earning timeline skipped when monthly estimate missing", () => {
  const trip = tripPlannerInputSchema.parse({
    ...baseTrip,
    monthlyPointsEstimate: null,
  });
  const result = evaluateRewards({
    trip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 60_000,
        taxesAndFeesAmount: "80",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  assert.equal(
    result.redemptionEvaluations[0].earningTimelineStatus,
    "missing_data",
  );
});

test("earning timeline invalid when monthly estimate zero", () => {
  const trip = tripPlannerInputSchema.parse({
    ...baseTrip,
    monthlyPointsEstimate: 0,
  });
  const result = evaluateRewards({
    trip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 60_000,
        taxesAndFeesAmount: "80",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  assert.equal(
    result.redemptionEvaluations[0].earningTimelineStatus,
    "invalid_input",
  );
});

test("user supplied assumptions labeled in uncertainty notes", () => {
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [
      {
        programId: "british_airways",
        pointsRequired: 50_000,
        taxesAndFeesAmount: "80",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied",
      },
    ],
  });
  assert.ok(
    result.redemptionEvaluations[0].uncertaintyNotes.some((n) =>
      n.includes("user-supplied"),
    ),
  );
  assert.ok(result.awardAvailabilityNote.includes("No award-flight"));
});

test("evaluateRewards is deterministic", () => {
  const offers = [
    makeOffer({ offerId: "x", totalAmount: "300", totalCurrency: "GBP" }),
  ];
  const input = {
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers,
    redemptionAssumptions: [
      {
        programId: "british_airways" as const,
        pointsRequired: 40_000,
        taxesAndFeesAmount: "50",
        taxesAndFeesCurrency: "GBP",
        source: "user_supplied" as const,
      },
    ],
  };
  const a = JSON.stringify(evaluateRewards(input));
  const b = JSON.stringify(evaluateRewards(input));
  assert.equal(a, b);
});

test("handler rejects unauthenticated requests", async () => {
  const response = await handleRewardsEvaluationPost(
    new Request("http://local/api", {
      method: "POST",
      body: JSON.stringify({}),
    }),
    { getAuthenticatedUser: async () => null },
  );
  assert.equal(response.status, 401);
});

test("handler validates body and returns evaluation", async () => {
  const response = await handleRewardsEvaluationPost(
    new Request("http://local/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip: baseTrip,
        originIataCode: "BOM",
        destinationIataCode: "LHR",
        offers: [
          makeOffer({
            offerId: "1",
            totalAmount: "400",
            totalCurrency: "GBP",
          }),
        ],
        redemptionAssumptions: [],
      }),
    }),
    { getAuthenticatedUser: async () => ({ id: "user-1" }) as never },
  );
  assert.equal(response.status, 200);
  const json = (await response.json()) as { ok: boolean; awardSearchIntegrated: boolean };
  assert.equal(json.ok, true);
  assert.equal(json.awardSearchIntegrated, false);
});

test("rewardsAccounts reflect all saved trip reward entries", () => {
  const trip = tripPlannerInputSchema.parse({
    ...baseTrip,
    rewards: [
      {
        programId: "british_airways",
        balanceStatus: "confirmed",
        balancePoints: 40_000,
      },
      {
        programId: "iberia",
        balanceStatus: "unknown",
        balancePoints: null,
      },
    ],
  });
  const result = evaluateRewards({
    trip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [],
  });
  assert.equal(result.rewardsAccounts.length, 2);
  assert.equal(result.rewardsAccounts[0].balancePoints, 40_000);
  assert.equal(result.rewardsAccounts[1].balanceStatus, "unknown");
});

test("monthlyPointsSummary uses trip form estimate without duplicate input", () => {
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [],
    redemptionAssumptions: [],
  });
  assert.equal(result.monthlyPointsSummary.status, "provided");
  assert.equal(result.monthlyPointsSummary.monthlyPointsEarned, 5_000);
});

test("missing list does not ask user to re-enter balance when rewards exist", () => {
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [makeOffer({ offerId: "1", totalAmount: "400", totalCurrency: "GBP" })],
    redemptionAssumptions: [],
  });
  const joined = result.missingForFullComparison.join(" ");
  assert.ok(!joined.toLowerCase().includes("confirmed balances on the trip form"));
  assert.ok(joined.includes("points required"));
});

test("no fabricated discount in engine output", () => {
  const result = evaluateRewards({
    trip: baseTrip,
    originIataCode: "BOM",
    destinationIataCode: "LHR",
    offers: [makeOffer({ offerId: "1", totalAmount: "400", totalCurrency: "GBP" })],
    redemptionAssumptions: [],
  });
  const serialized = JSON.stringify(result);
  assert.ok(!serialized.match(/%\s*off/i));
  assert.ok(!serialized.includes("guaranteed savings"));
  assert.equal(result.awardSearchIntegrated, false);
  assert.equal(AWARD_AVAILABILITY_NOTE.length > 20, true);
});
