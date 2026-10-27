import {
  extractPlannerIntentWithGroq,
  type GroqJsonCompletionClient,
} from "@/lib/groq/planner-chat-service";
import { mergePlannerChatState } from "@/lib/planner/mergeTripState";
import type { PlannerChatRequest } from "@/schemas/plannerChatApiSchema";
import type { PlannerChatSuccessResponse } from "@/schemas/plannerChatApiSchema";

export async function processPlannerChatTurn(
  request: PlannerChatRequest,
  client?: GroqJsonCompletionClient,
): Promise<PlannerChatSuccessResponse> {
  const modelOutput = await extractPlannerIntentWithGroq(request, client);
  const { mergedTripForm, validatedTripInput } = mergePlannerChatState(
    request,
    modelOutput,
  );

  const searchHandoffReady =
    modelOutput.conversationStatus === "ready_for_search_handoff" &&
    validatedTripInput !== null;

  return {
    ok: true,
    assistantMessage: modelOutput.assistantMessage,
    conversationStatus: modelOutput.conversationStatus,
    missingFields: modelOutput.missingFields,
    mergedTripForm,
    validatedTripInput,
    searchHandoffReady,
  };
}
