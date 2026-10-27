import {
  normalizedCashFlightOfferSchema,
  type NormalizedCashFlightOffer,
} from "@/schemas/flightSearchSchema";
import { cabinClassSchema } from "@/schemas/tripPlannerSchema";

type DuffelPlace = {
  iata_code?: string;
  name?: string;
};

type DuffelCarrier = {
  name?: string;
  iata_code?: string;
};

type DuffelSegment = {
  departing_at?: string;
  arriving_at?: string;
  duration?: string;
  marketing_carrier?: DuffelCarrier;
  operating_carrier?: DuffelCarrier;
  marketing_carrier_flight_number?: string;
  operating_carrier_flight_number?: string;
  origin?: DuffelPlace;
  destination?: DuffelPlace;
  stops?: unknown[];
  passengers?: Array<{
    cabin_class?: string;
    cabin_class_marketing_name?: string;
  }>;
};

type DuffelSlice = {
  duration?: string;
  origin?: DuffelPlace;
  destination?: DuffelPlace;
  fare_brand_name?: string;
  segments?: DuffelSegment[];
};

type DuffelOffer = {
  id?: string;
  total_amount?: string;
  total_currency?: string;
  base_amount?: string;
  tax_amount?: string;
  expires_at?: string;
  live_mode?: boolean;
  owner?: DuffelCarrier;
  slices?: DuffelSlice[];
  conditions?: {
    change_before_departure?: { allowed?: boolean };
    refund_before_departure?: { allowed?: boolean };
  };
};

function mapCabinClass(value: string | undefined) {
  if (!value) return null;
  const parsed = cabinClassSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function summarizeConditions(offer: DuffelOffer): string | null {
  const change = offer.conditions?.change_before_departure?.allowed;
  const refund = offer.conditions?.refund_before_departure?.allowed;
  if (change === undefined && refund === undefined) return null;
  const parts: string[] = [];
  if (change !== undefined) {
    parts.push(change ? "Changes allowed before departure" : "No changes before departure");
  }
  if (refund !== undefined) {
    parts.push(refund ? "Refunds allowed before departure" : "Non-refundable before departure");
  }
  return parts.join(" · ");
}

function normalizeSegment(segment: DuffelSegment) {
  const operatingName =
    segment.operating_carrier?.name?.trim() ||
    segment.marketing_carrier?.name?.trim() ||
    "Unknown operating carrier";

  const passengerCabin = segment.passengers?.[0];

  return {
    originCode: segment.origin?.iata_code ?? "???",
    originName: segment.origin?.name ?? null,
    destinationCode: segment.destination?.iata_code ?? "???",
    destinationName: segment.destination?.name ?? null,
    departingAt: segment.departing_at ?? "",
    arrivingAt: segment.arriving_at ?? "",
    marketingCarrierName: segment.marketing_carrier?.name ?? null,
    marketingCarrierIata: segment.marketing_carrier?.iata_code ?? null,
    marketingFlightNumber: segment.marketing_carrier_flight_number ?? null,
    operatingCarrierName: operatingName,
    operatingCarrierIata: segment.operating_carrier?.iata_code ?? null,
    operatingFlightNumber: segment.operating_carrier_flight_number ?? null,
    cabinClass: mapCabinClass(passengerCabin?.cabin_class),
    cabinMarketingName: passengerCabin?.cabin_class_marketing_name ?? null,
    duration: segment.duration ?? null,
    stopsCount: Array.isArray(segment.stops) ? segment.stops.length : 0,
  };
}

function normalizeSlice(slice: DuffelSlice) {
  const segments = (slice.segments ?? []).map(normalizeSegment);
  const stopsCount = segments.reduce((sum, segment) => sum + segment.stopsCount, 0);

  return {
    originCode: slice.origin?.iata_code ?? segments[0]?.originCode ?? "???",
    originName: slice.origin?.name ?? segments[0]?.originName ?? null,
    destinationCode:
      slice.destination?.iata_code ??
      segments[segments.length - 1]?.destinationCode ??
      "???",
    destinationName:
      slice.destination?.name ??
      segments[segments.length - 1]?.destinationName ??
      null,
    duration: slice.duration ?? null,
    stopsCount,
    segments,
  };
}

export function normalizeDuffelOffer(offer: unknown): NormalizedCashFlightOffer | null {
  if (!offer || typeof offer !== "object") return null;
  const raw = offer as DuffelOffer;
  if (!raw.id || !raw.total_amount || !raw.total_currency) return null;

  const slices = (raw.slices ?? [])
    .map(normalizeSlice)
    .filter((slice) => slice.segments.length > 0);

  if (slices.length === 0) return null;

  const candidate = {
    offerId: raw.id,
    totalAmount: raw.total_amount,
    totalCurrency: raw.total_currency.toUpperCase(),
    baseAmount: raw.base_amount ?? null,
    taxAmount: raw.tax_amount ?? null,
    expiresAt: raw.expires_at ?? null,
    liveMode: Boolean(raw.live_mode),
    ownerCarrierName: raw.owner?.name ?? null,
    slices,
    fareBrandName: raw.slices?.[0]?.fare_brand_name ?? null,
    conditionsSummary: summarizeConditions(raw),
  };

  const parsed = normalizedCashFlightOfferSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function normalizeDuffelOffers(offers: unknown[]): NormalizedCashFlightOffer[] {
  return offers
    .map(normalizeDuffelOffer)
    .filter((offer): offer is NormalizedCashFlightOffer => offer !== null);
}
