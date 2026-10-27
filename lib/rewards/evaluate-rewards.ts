import {
  DATA_PROVENANCE,
  PROVENANCE_LABELS,
} from "@/lib/rewards/provenance";
import type {
  RankedCashOffer,
  RedemptionEvaluation,
  RewardsAccountSummary,
  RewardsEvaluationEngineInput,
  RewardsEvaluationSuccessResponse,
  UserRedemptionAssumption,
} from "@/schemas/rewardsEvaluationSchema";
import type { NormalizedCashFlightOffer } from "@/schemas/flightSearchSchema";
import {
  REWARD_PROGRAM_OPTIONS,
  type RewardEntryInput,
  type TripPlannerInput,
} from "@/schemas/tripPlannerSchema";

export const CASH_RANKING_CRITERIA =
  "Cash offers are ranked lowest total price first within each currency. Only Duffel-returned cash fares are ranked; award redemptions are never mixed into this list.";

export const AWARD_AVAILABILITY_NOTE =
  "No award-flight search provider is integrated. RedeemTrip cannot verify live award availability or official points prices. Any redemption comparison uses only numbers you supply or that were independently verified elsewhere—not confirmed award seats.";

export const RESPONSIBLE_USE_NOTE =
  "Earn points through spending you already planned. Do not overspend, carry debt, or pay interest to accumulate points. Do not transfer points unless eligibility, transfer terms, and a suitable redemption are verified with the program.";

export function parseMoneyAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function programLabel(programId: UserRedemptionAssumption["programId"]): string {
  return (
    REWARD_PROGRAM_OPTIONS.find((p) => p.id === programId)?.label ?? programId
  );
}

function findRewardBalance(
  trip: TripPlannerInput,
  programId: UserRedemptionAssumption["programId"],
): RewardEntryInput | undefined {
  return trip.rewards.find((r) => r.programId === programId);
}

function sliceSummary(offer: NormalizedCashFlightOffer): string {
  const first = offer.slices[0];
  const last = offer.slices[offer.slices.length - 1];
  const stops = offer.slices.reduce((sum, s) => sum + s.stopsCount, 0);
  return `${first.originCode} → ${last.destinationCode} · ${offer.slices.length} slice(s) · ${stops} stop(s)`;
}

function rankOffersInCurrency(
  offers: NormalizedCashFlightOffer[],
  currency: string,
): RankedCashOffer[] {
  const inCurrency = offers.filter(
    (o) => o.totalCurrency.toUpperCase() === currency.toUpperCase(),
  );

  const sortable = inCurrency
    .map((offer) => ({
      offer,
      amount: parseMoneyAmount(offer.totalAmount),
    }))
    .filter(
      (row): row is { offer: NormalizedCashFlightOffer; amount: number } =>
        row.amount !== null,
    );

  sortable.sort((a, b) => {
    if (a.amount !== b.amount) return a.amount - b.amount;
    return a.offer.offerId.localeCompare(b.offer.offerId);
  });

  return sortable.map(({ offer }, index) => ({
    rank: index + 1,
    offerId: offer.offerId,
    totalAmount: offer.totalAmount,
    totalCurrency: offer.totalCurrency,
    rankingCriteria: CASH_RANKING_CRITERIA,
    provenance: DATA_PROVENANCE.duffelCashOffer,
    liveMode: offer.liveMode,
    ownerCarrierName: offer.ownerCarrierName,
    sliceSummary: sliceSummary(offer),
  }));
}

function groupOffersByCurrency(
  offers: NormalizedCashFlightOffer[],
): Map<string, NormalizedCashFlightOffer[]> {
  const map = new Map<string, NormalizedCashFlightOffer[]>();
  for (const offer of offers) {
    const currency = offer.totalCurrency.toUpperCase();
    const list = map.get(currency) ?? [];
    list.push(offer);
    map.set(currency, list);
  }
  return map;
}

function lowestCashOfferInCurrency(
  offers: NormalizedCashFlightOffer[],
  currency: string,
): NormalizedCashFlightOffer | null {
  const ranked = rankOffersInCurrency(offers, currency);
  if (ranked.length === 0) return null;
  const bestId = ranked[0].offerId;
  return offers.find((o) => o.offerId === bestId) ?? null;
}

function evaluateRedemption(
  trip: TripPlannerInput,
  offers: NormalizedCashFlightOffer[],
  assumption: UserRedemptionAssumption,
): RedemptionEvaluation {
  const uncertaintyNotes: string[] = [];
  const rewardEntry = findRewardBalance(trip, assumption.programId);

  let balanceStatus: RedemptionEvaluation["balanceStatus"] = "not_listed";
  let balancePoints: number | null = null;
  if (rewardEntry) {
    balanceStatus = rewardEntry.balanceStatus;
    balancePoints = rewardEntry.balancePoints;
  } else {
    uncertaintyNotes.push(
      "This program is not listed in your saved trip rewards balances.",
    );
  }

  const requirementProvenanceLabel =
    assumption.source === "independently_verified"
      ? PROVENANCE_LABELS[DATA_PROVENANCE.independentlyVerifiedRedemption]
      : PROVENANCE_LABELS[DATA_PROVENANCE.userSuppliedAssumption];

  if (assumption.source === "user_supplied") {
    uncertaintyNotes.push(
      "Points required and taxes/fees are user-supplied and are not verified award inventory.",
    );
  }

  let shortfallStatus: RedemptionEvaluation["shortfallStatus"] = "not_applicable";
  let shortfallPoints: number | null = null;
  let shortfallExplanation =
    "Compare balances once a points requirement is provided.";

  if (balanceStatus === "confirmed" && balancePoints !== null) {
    if (balancePoints >= assumption.pointsRequired) {
      shortfallStatus = "sufficient";
      shortfallPoints = 0;
      shortfallExplanation =
        "Your confirmed balance meets or exceeds the supplied points requirement.";
    } else {
      shortfallStatus = "insufficient";
      shortfallPoints = assumption.pointsRequired - balancePoints;
      shortfallExplanation = `You would need ${shortfallPoints.toLocaleString()} more points based on your confirmed balance.`;
    }
  } else if (balanceStatus === "unknown") {
    shortfallStatus = "unknown_balance";
    shortfallExplanation =
      "Balance is marked unknown, so a shortfall cannot be calculated.";
    uncertaintyNotes.push("Unknown balance is not treated the same as zero.");
  } else if (balanceStatus === "not_listed") {
    shortfallStatus = "unknown_balance";
    shortfallExplanation =
      "Add and confirm a balance for this program to calculate shortfall.";
  }

  const taxesCurrency = assumption.taxesAndFeesCurrency.toUpperCase();
  const taxesAmount = parseMoneyAmount(assumption.taxesAndFeesAmount);
  const baselineOffer = lowestCashOfferInCurrency(offers, taxesCurrency);

  let valuePerPointStatus: RedemptionEvaluation["valuePerPointStatus"] =
    "missing_data";
  let valuePerPoint: string | null = null;
  let valuePerPointCurrency: string | null = null;
  let valuePerPointExplanation =
    "Value per point requires a comparable cash fare in the same currency.";
  let comparedCashOfferId: string | null = null;
  let comparedCashFareAmount: string | null = null;
  let comparedCashFareCurrency: string | null = null;

  if (taxesAmount === null) {
    valuePerPointStatus = "invalid_input";
    valuePerPointExplanation = "Taxes and fees amount is not a valid number.";
  } else if (!baselineOffer) {
    valuePerPointStatus = "missing_data";
    valuePerPointExplanation = `No cash offers in ${taxesCurrency} to use as a baseline for this comparison.`;
    uncertaintyNotes.push(
      "Cash baseline must match redemption taxes/fees currency; cross-currency comparison requires a verified exchange rate (not applied).",
    );
  } else {
    const cashFare = parseMoneyAmount(baselineOffer.totalAmount);
    if (cashFare === null) {
      valuePerPointStatus = "invalid_input";
      valuePerPointExplanation = "Cash fare amount from Duffel is not parseable.";
    } else if (cashFare < taxesAmount) {
      valuePerPointStatus = "invalid_input";
      valuePerPointExplanation =
        "Cash fare is less than taxes and fees; redemption value cannot be computed meaningfully.";
    } else {
      const netValue = cashFare - taxesAmount;
      const perPoint = netValue / assumption.pointsRequired;
      valuePerPointStatus = "calculated";
      valuePerPoint = perPoint.toFixed(4);
      valuePerPointCurrency = taxesCurrency;
      comparedCashOfferId = baselineOffer.offerId;
      comparedCashFareAmount = baselineOffer.totalAmount;
      comparedCashFareCurrency = baselineOffer.totalCurrency;
      valuePerPointExplanation = `(${baselineOffer.totalAmount} ${baselineOffer.totalCurrency} cash − ${assumption.taxesAndFeesAmount} ${taxesCurrency} taxes/fees) ÷ ${assumption.pointsRequired.toLocaleString()} points. Baseline is the lowest comparable Duffel cash fare in ${taxesCurrency} for this search—not an award ticket.`;
    }
  }

  let earningTimelineMonths: number | null = null;
  let earningTimelineStatus: RedemptionEvaluation["earningTimelineStatus"] =
    "not_applicable";
  let earningTimelineExplanation =
    "Timeline applies only when there is a points shortfall and a positive monthly earning estimate.";

  const monthly = trip.monthlyPointsEstimate;
  if (shortfallStatus === "sufficient" || shortfallPoints === 0) {
    earningTimelineStatus = "not_applicable";
    earningTimelineExplanation =
      "No accumulation timeline needed when there is no shortfall.";
  } else if (shortfallStatus !== "insufficient" || shortfallPoints === null) {
    earningTimelineStatus = "missing_data";
    earningTimelineExplanation =
      "Cannot estimate months without a calculated points shortfall.";
  } else if (monthly === null || monthly === undefined) {
    earningTimelineStatus = "missing_data";
    earningTimelineExplanation =
      "Your saved trip has no monthly earning estimate — add one on the trip form to estimate months to close a shortfall.";
  } else if (monthly <= 0) {
    earningTimelineStatus = "invalid_input";
    earningTimelineExplanation =
      "Monthly earning estimate must be greater than zero to compute a timeline.";
  } else {
    earningTimelineMonths = Math.ceil(shortfallPoints / monthly);
    earningTimelineStatus = "calculated";
    earningTimelineExplanation = `ceil(${shortfallPoints.toLocaleString()} shortfall ÷ ${monthly.toLocaleString()} monthly estimate) months. This is an estimate, not a guarantee of future earning or availability.`;
  }

  return {
    programId: assumption.programId,
    programLabel: programLabel(assumption.programId),
    requirementSource: assumption.source,
    requirementProvenanceLabel,
    balanceStatus,
    balancePoints,
    balanceProvenance:
      balanceStatus === "confirmed"
        ? PROVENANCE_LABELS[DATA_PROVENANCE.userConfirmedBalance]
        : balanceStatus === "unknown"
          ? PROVENANCE_LABELS[DATA_PROVENANCE.unknown]
          : PROVENANCE_LABELS[DATA_PROVENANCE.unknown],
    pointsRequired: assumption.pointsRequired,
    shortfallPoints,
    shortfallStatus,
    shortfallExplanation,
    valuePerPoint,
    valuePerPointCurrency,
    valuePerPointStatus,
    valuePerPointExplanation,
    comparedCashOfferId,
    comparedCashFareAmount,
    comparedCashFareCurrency,
    taxesAndFeesAmount: assumption.taxesAndFeesAmount,
    taxesAndFeesCurrency: assumption.taxesAndFeesCurrency,
    earningTimelineMonths,
    earningTimelineStatus,
    earningTimelineExplanation,
    isConfirmedAwardOption: false,
    uncertaintyNotes,
  };
}

function buildRewardsAccountSummaries(
  trip: TripPlannerInput,
  assumptions: UserRedemptionAssumption[],
  offers: NormalizedCashFlightOffer[],
): RewardsAccountSummary[] {
  const assumptionByProgram = new Map(
    assumptions.map((a) => [a.programId, a]),
  );

  return trip.rewards.map((entry) => {
    const meta = REWARD_PROGRAM_OPTIONS.find((p) => p.id === entry.programId);
    const hasAssumption = assumptionByProgram.has(entry.programId);
    let comparisonNote: string;

    if (hasAssumption) {
      comparisonNote =
        offers.length > 0
          ? "Redemption comparison uses your optional points-required and taxes/fees inputs against Duffel cash baselines."
          : "Redemption assumption saved; run a cash flight search to rank comparable fares for value-per-point.";
    } else if (offers.length === 0) {
      comparisonNote =
        "Balance recorded from your trip form. Search cash flights for fare baselines, then optionally add points required and taxes/fees for a hypothetical redemption—not your balance.";
    } else {
      comparisonNote =
        "Balance recorded from your trip form. To estimate redemption value per point, optionally add points required and taxes/fees for a specific scenario (not your account balance).";
    }

    return {
      programId: entry.programId,
      programLabel: meta?.label ?? entry.programId,
      pointsUnitLabel: meta?.pointsLabel ?? "Points",
      balanceStatus: entry.balanceStatus,
      balancePoints: entry.balancePoints,
      balanceProvenance:
        entry.balanceStatus === "confirmed"
          ? PROVENANCE_LABELS[DATA_PROVENANCE.userConfirmedBalance]
          : PROVENANCE_LABELS[DATA_PROVENANCE.unknown],
      hasRedemptionAssumption: hasAssumption,
      comparisonNote,
    };
  });
}

function buildMonthlyPointsSummary(trip: TripPlannerInput) {
  const monthly = trip.monthlyPointsEstimate;
  if (monthly === null || monthly === undefined) {
    return {
      monthlyPointsEarned: null,
      status: "not_provided" as const,
      provenance: PROVENANCE_LABELS[DATA_PROVENANCE.unknown],
      label:
        "No monthly earning estimate on your saved trip — add one on the trip form if you want a shortfall timeline.",
    };
  }
  if (monthly <= 0) {
    return {
      monthlyPointsEarned: monthly,
      status: "zero" as const,
      provenance: PROVENANCE_LABELS[DATA_PROVENANCE.userEstimate],
      label:
        "Monthly earning estimate is zero — a shortfall timeline cannot be calculated until you provide a positive estimate on the trip form.",
    };
  }
  return {
    monthlyPointsEarned: monthly,
    status: "provided" as const,
    provenance: PROVENANCE_LABELS[DATA_PROVENANCE.userEstimate],
    label: `${monthly.toLocaleString()} points per month (from your saved trip form). Used only when a points shortfall exists.`,
  };
}

function buildMissingForFullComparison(
  trip: TripPlannerInput,
  offers: NormalizedCashFlightOffer[],
  assumptions: UserRedemptionAssumption[],
): string[] {
  const missing: string[] = [];

  if (trip.rewards.length === 0) {
    missing.push(
      "Add at least one rewards program with balance on the trip form.",
    );
  }

  if (offers.length === 0) {
    missing.push(
      "Cash flight search: needed for Duffel fare baselines before value-per-point can be calculated.",
    );
  }

  if (assumptions.length === 0 && trip.rewards.length > 0) {
    missing.push(
      "Optional for value-per-point: points required and redemption taxes/fees for a hypothetical redemption (separate from your balance and monthly earning estimate).",
    );
  }

  for (const assumption of assumptions) {
    const entry = findRewardBalance(trip, assumption.programId);
    if (!entry) {
      missing.push(
        `Program ${programLabel(assumption.programId)}: add this program on the trip form so your saved balance can be compared to points required.`,
      );
    } else if (entry.balanceStatus === "unknown") {
      missing.push(
        `${programLabel(assumption.programId)}: confirm balance or keep as unknown — shortfall cannot be calculated while unknown.`,
      );
    }
  }

  return missing;
}

function buildTripContextSummary(
  trip: TripPlannerInput,
  originIata: string,
  destinationIata: string,
): string {
  const journey =
    trip.journeyType === "return" && trip.returnDate
      ? `${trip.departureDate} – ${trip.returnDate}`
      : trip.departureDate;
  return `${originIata} → ${destinationIata} · ${journey} · ${trip.passengerCount} passenger(s) · ${trip.cabinClass} · comparable cash offers only`;
}

export function evaluateRewards(
  input: RewardsEvaluationEngineInput,
): RewardsEvaluationSuccessResponse {
  const byCurrency = groupOffersByCurrency(input.offers);
  const cashOffersByCurrency = [...byCurrency.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((currency) => ({
      currency,
      offerCount: byCurrency.get(currency)!.length,
      rankedOffers: rankOffersInCurrency(input.offers, currency),
    }));

  const redemptionEvaluations = input.redemptionAssumptions.map((assumption) =>
    evaluateRedemption(input.trip, input.offers, assumption),
  );

  const rewardsAccounts = buildRewardsAccountSummaries(
    input.trip,
    input.redemptionAssumptions,
    input.offers,
  );
  const monthlyPointsSummary = buildMonthlyPointsSummary(input.trip);

  return {
    ok: true,
    awardSearchIntegrated: false,
    awardAvailabilityNote: AWARD_AVAILABILITY_NOTE,
    responsibleUseNote: RESPONSIBLE_USE_NOTE,
    cashRankingCriteria: CASH_RANKING_CRITERIA,
    cashOffersByCurrency,
    rewardsAccounts,
    monthlyPointsSummary,
    redemptionEvaluations,
    missingForFullComparison: buildMissingForFullComparison(
      input.trip,
      input.offers,
      input.redemptionAssumptions,
    ),
    tripContextSummary: buildTripContextSummary(
      input.trip,
      input.originIataCode,
      input.destinationIataCode,
    ),
  };
}

/** Whether two offers are in the same currency (for tests / comparability checks). */
export function offersShareCurrency(
  a: NormalizedCashFlightOffer,
  b: NormalizedCashFlightOffer,
): boolean {
  return a.totalCurrency.toUpperCase() === b.totalCurrency.toUpperCase();
}
