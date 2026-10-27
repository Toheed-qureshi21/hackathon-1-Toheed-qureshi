import type { DuffelHttpClient } from "@/lib/duffel/duffel-http";
import { createDuffelHttpClient } from "@/lib/duffel/duffel-http";
import {
  formatPlaceLabel,
  plannerPlaceOptionSchema,
  type PlannerPlaceOption,
} from "@/schemas/plannerLocationSchema";

type DuffelPlaceRecord = {
  id?: string;
  iata_code?: string;
  name?: string;
  city_name?: string | null;
  type?: string;
};

export async function searchDuffelPlaces(
  query: string,
  client: DuffelHttpClient = createDuffelHttpClient(),
): Promise<PlannerPlaceOption[]> {
  const response = (await client.request({
    path: "/places/suggestions",
    query: { query },
  })) as { data?: DuffelPlaceRecord[] };

  const options: PlannerPlaceOption[] = [];
  for (const place of response.data ?? []) {
    if (!place.id || !place.iata_code || !place.name) continue;
    const candidate = {
      id: place.id,
      iataCode: place.iata_code.toUpperCase(),
      name: place.name,
      cityName: place.city_name ?? null,
      type: place.type ?? "airport",
      label: formatPlaceLabel({
        name: place.name,
        iataCode: place.iata_code.toUpperCase(),
        cityName: place.city_name,
      }),
    };
    const parsed = plannerPlaceOptionSchema.safeParse(candidate);
    if (parsed.success) options.push(parsed.data);
  }
  return options;
}
