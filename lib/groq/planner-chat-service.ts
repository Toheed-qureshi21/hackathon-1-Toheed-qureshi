import Groq from "groq-sdk";
import {
  getGroqApiKey,
  getGroqModel,
  GROQ_REQUEST_TIMEOUT_MS,
} from "@/lib/groq/config";
import { PLANNER_GROQ_SYSTEM_PROMPT } from "@/lib/groq/planner-system-prompt";
import type { PlannerChatRequest } from "@/schemas/plannerChatApiSchema";
import { groqPlannerModelOutputSchema } from "@/schemas/plannerChatApiSchema";

export type GroqPlannerErrorCode =
  | "not_configured"
  | "timeout"
  | "rate_limit"
  | "network"
  | "invalid_response"
  | "provider_error";

export class GroqPlannerError extends Error {
  readonly code: GroqPlannerErrorCode;

  constructor(code: GroqPlannerErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export type GroqJsonCompletionClient = {
  completeJson: (input: {
    system: string;
    user: string;
    model: string;
    timeoutMs: number;
  }) => Promise<string>;
};

function createDefaultGroqClient(): GroqJsonCompletionClient {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new GroqPlannerError(
      "not_configured",
      "Groq is not configured on the server",
    );
  }

  const groq = new Groq({ apiKey, timeout: GROQ_REQUEST_TIMEOUT_MS });

  return {
    async completeJson({ system, user, model, timeoutMs }) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const completion = await groq.chat.completions.create(
          {
            model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          },
          { signal: controller.signal },
        );
        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new GroqPlannerError(
            "invalid_response",
            "Groq returned an empty response",
          );
        }
        return content;
      } catch (error) {
        throw mapGroqCompletionError(error);
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

function mapGroqCompletionError(error: unknown): GroqPlannerError {
  if (error instanceof GroqPlannerError) return error;
  if (error instanceof Error && error.name === "AbortError") {
    return new GroqPlannerError("timeout", "Groq request timed out");
  }

  const message = error instanceof Error ? error.message : "Groq error";
  const lower = message.toLowerCase();
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined;

  if (status === 401 || lower.includes("invalid api key")) {
    console.error("[groq] Invalid or unauthorized API key");
    return new GroqPlannerError(
      "not_configured",
      "Groq is not configured on the server",
    );
  }

  if (
    status === 404 ||
    lower.includes("model_not_found") ||
    lower.includes("does not exist") ||
    lower.includes("decommissioned")
  ) {
    console.error(
      `[groq] Model unavailable (${getGroqModel()}). Set GROQ_MODEL to a supported model.`,
    );
    return new GroqPlannerError(
      "provider_error",
      "Groq model is not available",
    );
  }

  if (lower.includes("rate limit") || lower.includes("429") || status === 429) {
    return new GroqPlannerError("rate_limit", "Groq rate limit reached");
  }

  if (lower.includes("fetch") || lower.includes("network")) {
    return new GroqPlannerError("network", "Unable to reach Groq");
  }

  console.error("[groq] Request failed:", message.split("\n")[0]);
  return new GroqPlannerError("provider_error", "Groq request failed");
}

function buildUserPrompt(request: PlannerChatRequest): string {
  return JSON.stringify({
    latestUserMessage: request.message,
    recentMessages: request.recentMessages,
    currentTripForm: request.tripForm,
    validatedTripInput: request.validatedTripInput ?? null,
  });
}

export async function extractPlannerIntentWithGroq(
  request: PlannerChatRequest,
  client: GroqJsonCompletionClient = createDefaultGroqClient(),
): Promise<ReturnType<typeof groqPlannerModelOutputSchema.parse>> {
  if (!getGroqApiKey()) {
    throw new GroqPlannerError(
      "not_configured",
      "Groq is not configured on the server",
    );
  }

  const rawJson = await client.completeJson({
    system: PLANNER_GROQ_SYSTEM_PROMPT,
    user: buildUserPrompt(request),
    model: getGroqModel(),
    timeoutMs: GROQ_REQUEST_TIMEOUT_MS,
  });

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    throw new GroqPlannerError(
      "invalid_response",
      "Groq returned malformed JSON",
    );
  }

  const validated = groqPlannerModelOutputSchema.safeParse(parsedJson);
  if (!validated.success) {
    throw new GroqPlannerError(
      "invalid_response",
      "Groq returned an invalid structured response",
    );
  }

  return validated.data;
}

export function mapGroqPlannerErrorToStatus(code: GroqPlannerErrorCode): number {
  switch (code) {
    case "not_configured":
      return 503;
    case "timeout":
      return 504;
    case "rate_limit":
      return 429;
    case "network":
      return 503;
    case "invalid_response":
      return 502;
    default:
      return 502;
  }
}

export function publicGroqErrorMessage(code: GroqPlannerErrorCode): string {
  switch (code) {
    case "not_configured":
      return "The trip assistant is temporarily unavailable. You can still edit the form manually.";
    case "timeout":
      return "The assistant took too long to respond. Please try again.";
    case "rate_limit":
      return "The assistant is busy. Please wait a moment and try again.";
    case "network":
      return "Unable to reach the assistant. Check your connection and try again.";
    case "invalid_response":
      return "The assistant returned an unexpected response. Please try again.";
    default:
      return "The assistant is unavailable right now. Please try again.";
  }
}
