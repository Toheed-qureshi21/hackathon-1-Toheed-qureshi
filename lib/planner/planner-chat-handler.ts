import { jsonError, jsonOk, jsonValidationError } from "@/lib/auth/api-response";
import type { User } from "@supabase/supabase-js";
import {
  GroqPlannerError,
  mapGroqPlannerErrorToStatus,
  publicGroqErrorMessage,
} from "@/lib/groq/planner-chat-service";
import { processPlannerChatTurn } from "@/lib/planner/process-chat-turn";
import type { GroqJsonCompletionClient } from "@/lib/groq/planner-chat-service";
import {
  MAX_PLANNER_CHAT_REQUEST_BYTES,
  plannerChatRequestSchema,
} from "@/schemas/plannerChatApiSchema";

export type PlannerChatHandlerDeps = {
  getAuthenticatedUser: () => Promise<User | null>;
  groqClient?: GroqJsonCompletionClient;
};

export async function handlePlannerChatPost(
  request: Request,
  deps: PlannerChatHandlerDeps,
) {
  const user = await deps.getAuthenticatedUser();
  if (!user) {
    return jsonError("Authentication required", 401);
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const length = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(length) && length > MAX_PLANNER_CHAT_REQUEST_BYTES) {
      return jsonError("Request body is too large", 413);
    }
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  if (rawBody.length > MAX_PLANNER_CHAT_REQUEST_BYTES) {
    return jsonError("Request body is too large", 413);
  }

  let body: unknown;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = plannerChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  try {
    const result = await processPlannerChatTurn(parsed.data, deps.groqClient);
    return jsonOk(result);
  } catch (error) {
    if (error instanceof GroqPlannerError) {
      return jsonError(
        publicGroqErrorMessage(error.code),
        mapGroqPlannerErrorToStatus(error.code),
      );
    }
    return jsonError("Unable to process chat message", 500);
  }
}
