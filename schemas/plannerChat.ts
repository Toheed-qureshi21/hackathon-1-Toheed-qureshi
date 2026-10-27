import type { TripPlannerFormValues, TripPlannerInput } from "@/schemas/tripPlannerSchema";
import { emptyTripPlannerFormValues } from "@/schemas/tripPlannerSchema";

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatMessageStatus = "sending" | "typing" | "sent" | "failed";

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  status: ChatMessageStatus;
  createdAt: number;
};

export type PlannerConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  tripForm: TripPlannerFormValues;
  validatedTripInput: TripPlannerInput | null;
  updatedAt: number;
};

export const SUGGESTED_PROMPTS = [
  "Find the best way to fly to London.",
  "Help me use my credit card points.",
  "Plan a trip using my airline miles.",
  "Find flights for my next vacation.",
] as const;

export const COMPOSER_QUICK_PROMPTS = [
  "Find the best way to fly to London.",
  "Help me use my credit card points.",
  "Plan a trip using my airline miles.",
] as const;

export function createConversation(title = "New trip"): PlannerConversation {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
    tripForm: emptyTripPlannerFormValues(),
    validatedTripInput: null,
    updatedAt: now,
  };
}

export function conversationTitleFromMessage(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 42) return trimmed;
  return `${trimmed.slice(0, 42)}…`;
}

export function isTripFormPristine(form: TripPlannerFormValues): boolean {
  const empty = emptyTripPlannerFormValues();
  return (
    form.origin === empty.origin &&
    form.destination === empty.destination &&
    form.departureDate === empty.departureDate &&
    form.rewards.length === 0 &&
    (form.naturalLanguageNote ?? "") === ""
  );
}
