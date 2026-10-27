import { z } from "zod";
import { iataCodeSchema } from "@/schemas/plannerLocationSchema";
import {
  cabinClassSchema,
  tripPlannerInputSchema,
  type TripPlannerInput,
} from "@/schemas/tripPlannerSchema";

export const MAX_FLIGHT_SEARCH_REQUEST_BYTES = 16_000;

export const flightSearchRequestSchema = z
  .object({
    trip: tripPlannerInputSchema,
    originIataCode: iataCodeSchema,
    destinationIataCode: iataCodeSchema,
  })
  .superRefine((data, ctx) => {
    if (data.originIataCode === data.destinationIataCode) {
      ctx.addIssue({
        code: "custom",
        message: "Origin and destination must be different airports",
        path: ["destinationIataCode"],
      });
    }
  });

export type FlightSearchRequest = z.infer<typeof flightSearchRequestSchema>;

export const normalizedFlightSegmentSchema = z.object({
  originCode: z.string(),
  originName: z.string().nullable(),
  destinationCode: z.string(),
  destinationName: z.string().nullable(),
  departingAt: z.string(),
  arrivingAt: z.string(),
  marketingCarrierName: z.string().nullable(),
  marketingCarrierIata: z.string().nullable(),
  marketingFlightNumber: z.string().nullable(),
  operatingCarrierName: z.string(),
  operatingCarrierIata: z.string().nullable(),
  operatingFlightNumber: z.string().nullable(),
  cabinClass: cabinClassSchema.nullable(),
  cabinMarketingName: z.string().nullable(),
  duration: z.string().nullable(),
  stopsCount: z.number().int().nonnegative(),
});

export const normalizedFlightSliceSchema = z.object({
  originCode: z.string(),
  originName: z.string().nullable(),
  destinationCode: z.string(),
  destinationName: z.string().nullable(),
  duration: z.string().nullable(),
  stopsCount: z.number().int().nonnegative(),
  segments: z.array(normalizedFlightSegmentSchema).min(1),
});

export const normalizedCashFlightOfferSchema = z.object({
  offerId: z.string().min(1),
  totalAmount: z.string(),
  totalCurrency: z.string().min(3).max(3),
  baseAmount: z.string().nullable(),
  taxAmount: z.string().nullable(),
  expiresAt: z.string().nullable(),
  liveMode: z.boolean(),
  ownerCarrierName: z.string().nullable(),
  slices: z.array(normalizedFlightSliceSchema).min(1),
  fareBrandName: z.string().nullable(),
  conditionsSummary: z.string().nullable(),
});

export type NormalizedCashFlightOffer = z.infer<
  typeof normalizedCashFlightOfferSchema
>;

export const flightSearchStatusSchema = z.enum([
  "success",
  "no_offers",
]);

export const flightSearchSuccessResponseSchema = z.object({
  ok: z.literal(true),
  status: flightSearchStatusSchema,
  liveMode: z.boolean().nullable(),
  offerRequestId: z.string().nullable(),
  searchedExactDatesOnly: z.literal(true),
  dateFlexibilityNote: z.string(),
  offers: z.array(normalizedCashFlightOfferSchema),
});

export type FlightSearchSuccessResponse = z.infer<
  typeof flightSearchSuccessResponseSchema
>;

export function buildDateFlexibilityNote(
  flexibility: TripPlannerInput["dateFlexibility"],
): string {
  switch (flexibility) {
    case "exact":
      return "Search used your exact departure date only.";
    case "plus_minus_1":
    case "plus_minus_3":
    case "plus_minus_7":
    case "flexible_week":
      return "Your flexibility preference is saved, but this search used your exact departure date only.";
    default:
      return "Search used your exact departure date only.";
  }
}
