import type { TripPlannerInput } from "@/schemas/tripPlannerSchema";

type TripInputSuccess = {
  ok: true;
  status: string;
  tripInput: TripPlannerInput;
};

type TripInputError = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string | undefined>;
};

export type TripInputApiResult = TripInputSuccess | TripInputError;

export async function postTripPlannerInput(
  tripInput: TripPlannerInput,
): Promise<{ response: Response; data: TripInputApiResult }> {
  const response = await fetch("/api/planner/trip-input", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(tripInput),
  });

  const data = (await response.json()) as TripInputApiResult;
  return { response, data };
}
