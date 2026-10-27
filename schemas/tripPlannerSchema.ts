import { z } from "zod";

export const SUPPORTED_REWARD_PROGRAM_IDS = [
  "iberia",
  "british_airways",
  "qatar_privilege_club",
  "revolut",
  "amex_business_platinum",
] as const;

export type SupportedRewardProgramId =
  (typeof SUPPORTED_REWARD_PROGRAM_IDS)[number];

export const REWARD_PROGRAM_OPTIONS: {
  id: SupportedRewardProgramId;
  label: string;
  pointsLabel: string;
}[] = [
  { id: "iberia", label: "Iberia", pointsLabel: "Avios" },
  { id: "british_airways", label: "British Airways", pointsLabel: "Avios" },
  {
    id: "qatar_privilege_club",
    label: "Qatar Airways Privilege Club",
    pointsLabel: "Qmiles",
  },
  { id: "revolut", label: "Revolut", pointsLabel: "RevPoints" },
  {
    id: "amex_business_platinum",
    label: "American Express Business Platinum",
    pointsLabel: "Membership Rewards",
  },
];

export const journeyTypeSchema = z.enum(["one_way", "return"]);
export const cabinClassSchema = z.enum([
  "economy",
  "premium_economy",
  "business",
  "first",
]);
export const dateFlexibilitySchema = z.enum([
  "exact",
  "plus_minus_1",
  "plus_minus_3",
  "plus_minus_7",
  "flexible_week",
]);
export const rewardBalanceStatusSchema = z.enum(["confirmed", "unknown"]);

export const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date (YYYY-MM-DD)");

export function normalizeLocation(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export const rewardEntrySchema = z
  .object({
    programId: z.enum(SUPPORTED_REWARD_PROGRAM_IDS),
    balanceStatus: rewardBalanceStatusSchema,
    balancePoints: z.number().int().nonnegative().nullable(),
  })
  .superRefine((entry, ctx) => {
    if (entry.balanceStatus === "confirmed" && entry.balancePoints === null) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a confirmed balance or mark it as unknown",
        path: ["balancePoints"],
      });
    }
    if (entry.balanceStatus === "unknown" && entry.balancePoints !== null) {
      ctx.addIssue({
        code: "custom",
        message: "Leave balance empty when marked unknown",
        path: ["balancePoints"],
      });
    }
  });

export const tripPlannerInputSchema = z
  .object({
    naturalLanguageNote: z.string().max(2000).nullable().optional(),
    origin: z.string().trim().min(1, "Origin is required"),
    destination: z.string().trim().min(1, "Destination is required"),
    journeyType: journeyTypeSchema,
    departureDate: isoDateStringSchema,
    returnDate: isoDateStringSchema.nullable().optional(),
    passengerCount: z
      .number()
      .int("Passenger count must be a whole number")
      .min(1, "At least 1 passenger is required")
      .max(9, "Maximum 9 passengers in this preview"),
    cabinClass: cabinClassSchema,
    dateFlexibility: dateFlexibilitySchema,
    rewards: z.array(rewardEntrySchema).max(10),
    monthlyPointsEstimate: z
      .number()
      .int("Monthly estimate must be a whole number")
      .nonnegative("Monthly estimate cannot be negative")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.monthlyPointsEstimate !== null &&
      data.monthlyPointsEstimate !== undefined &&
      Number.isNaN(data.monthlyPointsEstimate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Monthly estimate must be a valid number",
        path: ["monthlyPointsEstimate"],
      });
    }

    const departure = parseIsoDate(data.departureDate);
    if (!departure) {
      ctx.addIssue({
        code: "custom",
        message: "Departure date is invalid",
        path: ["departureDate"],
      });
    }

    if (data.journeyType === "return") {
      if (!data.returnDate) {
        ctx.addIssue({
          code: "custom",
          message: "Return date is required for a return journey",
          path: ["returnDate"],
        });
        return;
      }
      const returnDate = parseIsoDate(data.returnDate);
      if (!returnDate) {
        ctx.addIssue({
          code: "custom",
          message: "Return date is invalid",
          path: ["returnDate"],
        });
        return;
      }
      if (departure && returnDate < departure) {
        ctx.addIssue({
          code: "custom",
          message: "Return date cannot be before departure",
          path: ["returnDate"],
        });
      }
    } else if (data.returnDate) {
      ctx.addIssue({
        code: "custom",
        message: "Return date applies only to return journeys",
        path: ["returnDate"],
      });
    }

    if (
      normalizeLocation(data.origin) === normalizeLocation(data.destination)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Origin and destination must be different",
        path: ["destination"],
      });
    }
  });

export type TripPlannerInput = z.infer<typeof tripPlannerInputSchema>;
export type RewardEntryInput = z.infer<typeof rewardEntrySchema>;

export const CABIN_CLASS_LABELS: Record<
  z.infer<typeof cabinClassSchema>,
  string
> = {
  economy: "Economy",
  premium_economy: "Premium economy",
  business: "Business",
  first: "First",
};

export const DATE_FLEXIBILITY_LABELS: Record<
  z.infer<typeof dateFlexibilitySchema>,
  string
> = {
  exact: "Exact dates only",
  plus_minus_1: "± 1 day",
  plus_minus_3: "± 3 days",
  plus_minus_7: "± 7 days",
  flexible_week: "Flexible within the week",
};

export const JOURNEY_TYPE_LABELS: Record<
  z.infer<typeof journeyTypeSchema>,
  string
> = {
  one_way: "One-way",
  return: "Return",
};

/** Client/API payload uses strings for numeric fields in forms. */
export const tripPlannerFormSchema = z
  .object({
    naturalLanguageNote: z.string().max(2000).optional(),
    origin: z.string(),
    destination: z.string(),
    journeyType: journeyTypeSchema,
    departureDate: z.string(),
    returnDate: z.string().optional(),
    passengerCount: z.string(),
    cabinClass: cabinClassSchema,
    dateFlexibility: dateFlexibilitySchema,
    rewards: z.array(
      z.object({
        programId: z.enum(SUPPORTED_REWARD_PROGRAM_IDS),
        balanceStatus: rewardBalanceStatusSchema,
        balancePoints: z.string(),
        balanceUnknown: z.boolean(),
      }),
    ),
    monthlyPointsEstimate: z.string().optional(),
  })
  .transform((raw): TripPlannerInput => {
    const passengerCount = Number.parseInt(raw.passengerCount, 10);
    const monthlyRaw = raw.monthlyPointsEstimate?.trim() ?? "";
    const monthlyPointsEstimate =
      monthlyRaw === "" ? null : Number.parseInt(monthlyRaw, 10);

    const rewards = raw.rewards.map((entry) => {
      if (entry.balanceUnknown) {
        return {
          programId: entry.programId,
          balanceStatus: "unknown" as const,
          balancePoints: null,
        };
      }
      const balanceRaw = entry.balancePoints.trim();
      const balancePoints =
        balanceRaw === "" ? null : Number.parseInt(balanceRaw, 10);
      return {
        programId: entry.programId,
        balanceStatus: "confirmed" as const,
        balancePoints,
      };
    });

    return {
      naturalLanguageNote: raw.naturalLanguageNote?.trim() || null,
      origin: raw.origin,
      destination: raw.destination,
      journeyType: raw.journeyType,
      departureDate: raw.departureDate,
      returnDate:
        raw.journeyType === "return" ? (raw.returnDate?.trim() || null) : null,
      passengerCount,
      cabinClass: raw.cabinClass,
      dateFlexibility: raw.dateFlexibility,
      rewards,
      monthlyPointsEstimate,
    };
  })
  .pipe(tripPlannerInputSchema);

export type TripPlannerFormValues = z.input<typeof tripPlannerFormSchema>;

export function emptyTripPlannerFormValues(
  note?: string | null,
): TripPlannerFormValues {
  return {
    naturalLanguageNote: note ?? "",
    origin: "",
    destination: "",
    journeyType: "return",
    departureDate: "",
    returnDate: "",
    passengerCount: "1",
    cabinClass: "economy",
    dateFlexibility: "plus_minus_3",
    rewards: [],
    monthlyPointsEstimate: "",
  };
}

export function tripPlannerInputToFormValues(
  input: TripPlannerInput,
): TripPlannerFormValues {
  return {
    naturalLanguageNote: input.naturalLanguageNote ?? "",
    origin: input.origin,
    destination: input.destination,
    journeyType: input.journeyType,
    departureDate: input.departureDate,
    returnDate: input.returnDate ?? "",
    passengerCount: String(input.passengerCount),
    cabinClass: input.cabinClass,
    dateFlexibility: input.dateFlexibility,
    rewards: input.rewards.map((r) => ({
      programId: r.programId,
      balanceStatus: r.balanceStatus,
      balanceUnknown: r.balanceStatus === "unknown",
      balancePoints:
        r.balanceStatus === "confirmed" && r.balancePoints !== null
          ? String(r.balancePoints)
          : "",
    })),
    monthlyPointsEstimate:
      input.monthlyPointsEstimate !== null &&
      input.monthlyPointsEstimate !== undefined
        ? String(input.monthlyPointsEstimate)
        : "",
  };
}
