import { z } from "zod";

export const iataCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Select a valid 3-letter airport code");

export const plannerPlaceOptionSchema = z.object({
  id: z.string().min(1).max(64),
  iataCode: iataCodeSchema,
  name: z.string().min(1).max(200),
  cityName: z.string().max(200).nullable(),
  type: z.string().max(32),
  label: z.string().min(1).max(240),
});

export type PlannerPlaceOption = z.infer<typeof plannerPlaceOptionSchema>;

export const placesSearchQuerySchema = z.object({
  query: z.string().trim().min(2, "Type at least 2 characters").max(80),
});

export function formatPlaceLabel(input: {
  name: string;
  iataCode: string;
  cityName?: string | null;
}): string {
  const city = input.cityName?.trim();
  if (city && !input.name.toLowerCase().includes(city.toLowerCase())) {
    return `${input.name}, ${city} (${input.iataCode})`;
  }
  return `${input.name} (${input.iataCode})`;
}
