import type { FlightSearchRequest } from "@/schemas/flightSearchSchema";
import type { FlightSearchSuccessResponse } from "@/schemas/flightSearchSchema";
import type { PlannerPlaceOption } from "@/schemas/plannerLocationSchema";
import type { PlannerChatRequest } from "@/schemas/plannerChatApiSchema";
import type { PlannerChatSuccessResponse } from "@/schemas/plannerChatApiSchema";
import type {
  RewardsEvaluationRequest,
  RewardsEvaluationSuccessResponse,
} from "@/schemas/rewardsEvaluationSchema";
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

type PlacesSuccess = { ok: true; places: PlannerPlaceOption[] };
type PlacesError = { ok: false; error: string };
export type PlacesApiResult = PlacesSuccess | PlacesError;

export async function fetchPlannerPlaces(
  query: string,
): Promise<{ response: Response; data: PlacesApiResult }> {
  const response = await fetch(
    `/api/planner/flights/places?query=${encodeURIComponent(query)}`,
    { credentials: "include" },
  );
  const data = (await response.json()) as PlacesApiResult;
  return { response, data };
}

type FlightSearchError = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string | undefined>;
};

export type FlightSearchApiResult =
  | FlightSearchSuccessResponse
  | FlightSearchError;

export async function postFlightSearch(
  payload: FlightSearchRequest,
): Promise<{ response: Response; data: FlightSearchApiResult }> {
  const response = await fetch("/api/planner/flights/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as FlightSearchApiResult;
  return { response, data };
}

type RewardsEvaluationError = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string | undefined>;
};

export type RewardsEvaluationApiResult =
  | RewardsEvaluationSuccessResponse
  | RewardsEvaluationError;

export async function postRewardsEvaluation(
  payload: RewardsEvaluationRequest,
): Promise<{ response: Response; data: RewardsEvaluationApiResult }> {
  const response = await fetch("/api/planner/rewards/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as RewardsEvaluationApiResult;
  return { response, data };
}
