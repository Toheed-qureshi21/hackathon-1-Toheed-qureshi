import type { DuffelHttpClient } from "@/lib/duffel/duffel-http";
import { createDuffelHttpClient } from "@/lib/duffel/duffel-http";
import type { DuffelOfferRequestPayload } from "@/lib/flights/map-trip-to-duffel";
import { normalizeDuffelOffers } from "@/lib/flights/normalize-duffel-offers";
import type { NormalizedCashFlightOffer } from "@/schemas/flightSearchSchema";

export type DuffelOfferRequestResult = {
  offerRequestId: string | null;
  liveMode: boolean | null;
  offers: NormalizedCashFlightOffer[];
};

export async function createDuffelOfferRequest(
  payload: DuffelOfferRequestPayload,
  client: DuffelHttpClient = createDuffelHttpClient(),
): Promise<DuffelOfferRequestResult> {
  const response = (await client.request({
    path: "/air/offer_requests",
    method: "POST",
    query: {
      return_offers: "true",
      supplier_timeout: "20000",
    },
    body: { data: payload },
  })) as {
    data?: {
      id?: string;
      live_mode?: boolean;
      offers?: unknown[];
    };
  };

  const offers = normalizeDuffelOffers(response.data?.offers ?? []);

  return {
    offerRequestId: response.data?.id ?? null,
    liveMode:
      typeof response.data?.live_mode === "boolean"
        ? response.data.live_mode
        : null,
    offers,
  };
}
