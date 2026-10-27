import { jsonError, jsonOk, jsonValidationError } from "@/lib/auth/api-response";
import type { User } from "@supabase/supabase-js";
import { createDuffelOfferRequest } from "@/lib/duffel/offer-request-service";
import type { DuffelHttpClient } from "@/lib/duffel/duffel-http";
import {
  DuffelApiError,
  mapDuffelErrorToStatus,
  publicDuffelErrorMessage,
} from "@/lib/duffel/duffel-http";
import { mapTripToDuffelOfferRequest } from "@/lib/flights/map-trip-to-duffel";
import {
  MAX_FLIGHT_SEARCH_REQUEST_BYTES,
  buildDateFlexibilityNote,
  flightSearchRequestSchema,
} from "@/schemas/flightSearchSchema";

export type FlightSearchHandlerDeps = {
  getAuthenticatedUser: () => Promise<User | null>;
  duffelClient?: DuffelHttpClient;
};

export async function handleFlightSearchPost(
  request: Request,
  deps: FlightSearchHandlerDeps,
) {
  const user = await deps.getAuthenticatedUser();
  if (!user) {
    return jsonError("Authentication required", 401);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  if (rawBody.length > MAX_FLIGHT_SEARCH_REQUEST_BYTES) {
    return jsonError("Request body is too large", 413);
  }

  let body: unknown;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = flightSearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  try {
    const duffelPayload = mapTripToDuffelOfferRequest(parsed.data);
    const result = await createDuffelOfferRequest(
      duffelPayload,
      deps.duffelClient,
    );

    return jsonOk({
      status: result.offers.length > 0 ? "success" : "no_offers",
      liveMode: result.liveMode,
      offerRequestId: result.offerRequestId,
      searchedExactDatesOnly: true as const,
      dateFlexibilityNote: buildDateFlexibilityNote(
        parsed.data.trip.dateFlexibility,
      ),
      offers: result.offers,
    });
  } catch (error) {
    if (error instanceof DuffelApiError) {
      return jsonError(
        publicDuffelErrorMessage(error.code),
        mapDuffelErrorToStatus(error.code),
      );
    }
    return jsonError("Unable to search for flights", 500);
  }
}
