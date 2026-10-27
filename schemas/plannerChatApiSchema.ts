import { z } from "zod";
import {
  SUPPORTED_REWARD_PROGRAM_IDS,
  cabinClassSchema,
  dateFlexibilitySchema,
  journeyTypeSchema,
  rewardBalanceStatusSchema,
  tripPlannerInputSchema,
} from "@/schemas/tripPlannerSchema";

export const MAX_PLANNER_CHAT_MESSAGE_LENGTH = 2000;
export const MAX_PLANNER_CHAT_RECENT_MESSAGES = 20;
export const MAX_PLANNER_CHAT_REQUEST_BYTES = 32_000;

export const plannerChatTurnSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z
    .string()
    .min(1)
    .max(MAX_PLANNER_CHAT_MESSAGE_LENGTH),
});

export const plannerChatTripFormPayloadSchema = z.object({
  naturalLanguageNote: z.string().max(2000).optional(),
  origin: z.string().max(200),
  destination: z.string().max(200),
  journeyType: journeyTypeSchema,
  departureDate: z.string().max(32),
  returnDate: z.string().max(32).optional(),
  passengerCount: z.string().max(4),
  cabinClass: cabinClassSchema,
  dateFlexibility: dateFlexibilitySchema,
  rewards: z
    .array(
      z.object({
        programId: z.enum(SUPPORTED_REWARD_PROGRAM_IDS),
        balanceStatus: rewardBalanceStatusSchema,
        balancePoints: z.string().max(20),
        balanceUnknown: z.boolean(),
      }),
    )
    .max(10),
  monthlyPointsEstimate: z.string().max(20).optional(),
});

export const plannerChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(MAX_PLANNER_CHAT_MESSAGE_LENGTH),
  recentMessages: z
    .array(plannerChatTurnSchema)
    .max(MAX_PLANNER_CHAT_RECENT_MESSAGES),
  tripForm: plannerChatTripFormPayloadSchema,
  validatedTripInput: tripPlannerInputSchema.nullable().optional(),
});

export type PlannerChatRequest = z.infer<typeof plannerChatRequestSchema>;

export const conversationStatusSchema = z.enum([
  "collecting_trip_details",
  "collecting_rewards",
  "ready_for_search_handoff",
]);

export const groqTripPatchSchema = z
  .object({
    origin: z.string().trim().min(1).max(200).optional(),
    destination: z.string().trim().min(1).max(200).optional(),
    journeyType: journeyTypeSchema.optional(),
    departureDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    returnDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    passengerCount: z.number().int().min(1).max(9).optional(),
    cabinClass: cabinClassSchema.optional(),
    dateFlexibility: dateFlexibilitySchema.optional(),
    monthlyPointsEstimate: z.number().int().nonnegative().nullable().optional(),
  })
  .strict();

export const groqRewardPatchSchema = z.object({
  action: z.enum(["upsert", "remove"]),
  programId: z.enum(SUPPORTED_REWARD_PROGRAM_IDS),
  balanceStatus: rewardBalanceStatusSchema.optional(),
  balancePoints: z.number().int().nonnegative().nullable().optional(),
});

export const groqPlannerModelOutputSchema = z
  .object({
    assistantMessage: z.string().min(1).max(4000),
    tripPatch: groqTripPatchSchema.optional().default({}),
    rewardsPatches: z.array(groqRewardPatchSchema).max(10).optional().default([]),
    missingFields: z.array(z.string().max(80)).max(20).default([]),
    conversationStatus: conversationStatusSchema,
    searchCompleted: z.literal(false),
  })
  .strict();

export type GroqPlannerModelOutput = z.infer<typeof groqPlannerModelOutputSchema>;

export const plannerChatSuccessResponseSchema = z.object({
  ok: z.literal(true),
  assistantMessage: z.string(),
  conversationStatus: conversationStatusSchema,
  missingFields: z.array(z.string()),
  mergedTripForm: plannerChatTripFormPayloadSchema,
  validatedTripInput: tripPlannerInputSchema.nullable(),
  searchHandoffReady: z.boolean(),
});

export type PlannerChatSuccessResponse = z.infer<
  typeof plannerChatSuccessResponseSchema
>;
