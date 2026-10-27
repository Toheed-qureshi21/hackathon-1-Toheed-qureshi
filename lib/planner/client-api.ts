import type { PlannerChatRequest } from "@/schemas/plannerChatApiSchema";
import type { PlannerChatSuccessResponse } from "@/schemas/plannerChatApiSchema";
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

type PlannerChatError = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string | undefined>;
};

export type PlannerChatApiResult =
  | PlannerChatSuccessResponse
  | PlannerChatError;

export async function postPlannerChat(
  payload: PlannerChatRequest,
): Promise<{ response: Response; data: PlannerChatApiResult }> {
  const response = await fetch("/api/planner/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as PlannerChatApiResult;
  return { response, data };
}
