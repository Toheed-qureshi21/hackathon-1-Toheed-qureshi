import { z } from "zod";
import {
  normalizedCashFlightOfferSchema,
  type NormalizedCashFlightOffer,
} from "@/schemas/flightSearchSchema";
import { iataCodeSchema } from "@/schemas/plannerLocationSchema";
import {
  SUPPORTED_REWARD_PROGRAM_IDS,
  tripPlannerInputSchema,
  type TripPlannerInput,
} from "@/schemas/tripPlannerSchema";

export const MAX_REWARDS_EVALUATION_REQUEST_BYTES = 512_000;

const moneyAmountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Use a valid amount (e.g. 123.45)");

const currencyCodeSchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code");

export const redemptionRequirementSourceSchema = z.enum([
  "user_supplied",
  "independently_verified",
]);

export const userRedemptionAssumptionSchema = z.object({
  programId: z.enum(SUPPORTED_REWARD_PROGRAM_IDS),
  pointsRequired: z
    .number()
    .int("Points must be a whole number")
    .positive("Points required must be greater than zero"),
  taxesAndFeesAmount: moneyAmountSchema,
  taxesAndFeesCurrency: currencyCodeSchema,
  source: redemptionRequirementSourceSchema,
  notes: z.string().max(500).optional(),
});

export type UserRedemptionAssumption = z.infer<
  typeof userRedemptionAssumptionSchema
>;

export const rewardsEvaluationRequestSchema = z
  .object({
    trip: tripPlannerInputSchema,
    originIataCode: iataCodeSchema,
    destinationIataCode: iataCodeSchema,
    offers: z.array(normalizedCashFlightOfferSchema).max(50),
    redemptionAssumptions: z
      .array(userRedemptionAssumptionSchema)
      .max(10)
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.originIataCode === data.destinationIataCode) {
      ctx.addIssue({
        code: "custom",
        message: "Origin and destination must be different airports",
        path: ["destinationIataCode"],
      });
    }
    const programIds = new Set<string>();
    for (const assumption of data.redemptionAssumptions) {
      if (programIds.has(assumption.programId)) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate redemption assumption for the same program",
          path: ["redemptionAssumptions"],
        });
        break;
      }
      programIds.add(assumption.programId);
    }
  });

export type RewardsEvaluationRequest = z.infer<
  typeof rewardsEvaluationRequestSchema
>;

export const calculationStatusSchema = z.enum([
  "calculated",
  "not_applicable",
  "missing_data",
  "currency_mismatch",
  "invalid_input",
]);

export const rankedCashOfferSchema = z.object({
  rank: z.number().int().positive(),
  offerId: z.string(),
  totalAmount: z.string(),
  totalCurrency: z.string(),
  rankingCriteria: z.string(),
  provenance: z.literal("duffel_cash_offer"),
  liveMode: z.boolean(),
  ownerCarrierName: z.string().nullable(),
  sliceSummary: z.string(),
});

export const redemptionEvaluationSchema = z.object({
  programId: z.enum(SUPPORTED_REWARD_PROGRAM_IDS),
  programLabel: z.string(),
  requirementSource: redemptionRequirementSourceSchema,
  requirementProvenanceLabel: z.string(),
  balanceStatus: z.enum(["confirmed", "unknown", "not_listed"]),
  balancePoints: z.number().int().nonnegative().nullable(),
  balanceProvenance: z.string(),
  pointsRequired: z.number().int().positive(),
  shortfallPoints: z.number().int().nonnegative().nullable(),
  shortfallStatus: z.enum([
    "sufficient",
    "insufficient",
    "unknown_balance",
    "not_applicable",
  ]),
  shortfallExplanation: z.string(),
  valuePerPoint: z.string().nullable(),
  valuePerPointCurrency: z.string().nullable(),
  valuePerPointStatus: calculationStatusSchema,
  valuePerPointExplanation: z.string(),
  comparedCashOfferId: z.string().nullable(),
  comparedCashFareAmount: z.string().nullable(),
  comparedCashFareCurrency: z.string().nullable(),
  taxesAndFeesAmount: z.string(),
  taxesAndFeesCurrency: z.string(),
  earningTimelineMonths: z.number().int().positive().nullable(),
  earningTimelineStatus: calculationStatusSchema,
  earningTimelineExplanation: z.string(),
  isConfirmedAwardOption: z.literal(false),
  uncertaintyNotes: z.array(z.string()),
});

export const rewardsEvaluationSuccessResponseSchema = z.object({
  ok: z.literal(true),
  awardSearchIntegrated: z.literal(false),
  awardAvailabilityNote: z.string(),
  responsibleUseNote: z.string(),
  cashRankingCriteria: z.string(),
  cashOffersByCurrency: z.array(
    z.object({
      currency: z.string(),
      offerCount: z.number().int().nonnegative(),
      rankedOffers: z.array(rankedCashOfferSchema),
    }),
  ),
  redemptionEvaluations: z.array(redemptionEvaluationSchema),
  missingForFullComparison: z.array(z.string()),
  tripContextSummary: z.string(),
});

export type RewardsEvaluationSuccessResponse = z.infer<
  typeof rewardsEvaluationSuccessResponseSchema
>;

export type RankedCashOffer = z.infer<typeof rankedCashOfferSchema>;
export type RedemptionEvaluation = z.infer<typeof redemptionEvaluationSchema>;

export type RewardsEvaluationEngineInput = {
  trip: TripPlannerInput;
  originIataCode: string;
  destinationIataCode: string;
  offers: NormalizedCashFlightOffer[];
  redemptionAssumptions: UserRedemptionAssumption[];
};
