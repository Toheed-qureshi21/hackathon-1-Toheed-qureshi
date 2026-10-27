import { jsonError, jsonOk, jsonValidationError } from "@/lib/auth/api-response";
import type { User } from "@supabase/supabase-js";
import { searchDuffelPlaces } from "@/lib/duffel/places-service";
import type { DuffelHttpClient } from "@/lib/duffel/duffel-http";
import {
  DuffelApiError,
  mapDuffelErrorToStatus,
  publicDuffelErrorMessage,
} from "@/lib/duffel/duffel-http";
import { placesSearchQuerySchema } from "@/schemas/plannerLocationSchema";

export type PlacesSearchHandlerDeps = {
  getAuthenticatedUser: () => Promise<User | null>;
  duffelClient?: DuffelHttpClient;
};

export async function handlePlacesSearchGet(
  request: Request,
  deps: PlacesSearchHandlerDeps,
) {
  const user = await deps.getAuthenticatedUser();
  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const url = new URL(request.url);
  const parsed = placesSearchQuerySchema.safeParse({
    query: url.searchParams.get("query") ?? "",
  });
  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  try {
    const places = await searchDuffelPlaces(parsed.data.query, deps.duffelClient);
    return jsonOk({ places });
  } catch (error) {
    if (error instanceof DuffelApiError) {
      return jsonError(
        publicDuffelErrorMessage(error.code),
        mapDuffelErrorToStatus(error.code),
      );
    }
    return jsonError("Unable to search locations", 500);
  }
}
