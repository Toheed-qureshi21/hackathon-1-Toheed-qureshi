import { jsonError, jsonOk, jsonValidationError } from "@/lib/auth/api-response";
import { evaluateRewards } from "@/lib/rewards/evaluate-rewards";
import type { User } from "@supabase/supabase-js";
import {
  MAX_REWARDS_EVALUATION_REQUEST_BYTES,
  rewardsEvaluationRequestSchema,
} from "@/schemas/rewardsEvaluationSchema";

export type RewardsEvaluationHandlerDeps = {
  getAuthenticatedUser: () => Promise<User | null>;
};

export async function handleRewardsEvaluationPost(
  request: Request,
  deps: RewardsEvaluationHandlerDeps,
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

  if (rawBody.length > MAX_REWARDS_EVALUATION_REQUEST_BYTES) {
    return jsonError("Request body is too large", 413);
  }

  let body: unknown;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = rewardsEvaluationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const result = evaluateRewards({
    trip: parsed.data.trip,
    originIataCode: parsed.data.originIataCode,
    destinationIataCode: parsed.data.destinationIataCode,
    offers: parsed.data.offers,
    redemptionAssumptions: parsed.data.redemptionAssumptions,
  });

  return jsonOk(result);
}
