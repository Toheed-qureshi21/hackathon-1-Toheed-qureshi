export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatMessageStatus = "sending" | "sent" | "failed";

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  status: ChatMessageStatus;
  createdAt: number;
};

export type TripDraft = {
  origin: string | null;
  destination: string | null;
  departureDate: string | null;
  returnDate: string | null;
  passengers: string | null;
  cabinClass: string | null;
  rewardsPrograms: string | null;
  pointsOrMiles: string | null;
};

export type PlannerConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  tripDraft: TripDraft;
  updatedAt: number;
};

export const emptyTripDraft = (): TripDraft => ({
  origin: null,
  destination: null,
  departureDate: null,
  returnDate: null,
  passengers: null,
  cabinClass: null,
  rewardsPrograms: null,
  pointsOrMiles: null,
});

export const SUGGESTED_PROMPTS = [
  "Find the best way to fly to London.",
  "Help me use my credit card points.",
  "Plan a trip using my airline miles.",
  "Find flights for my next vacation.",
] as const;

export const ASSISTANT_PREVIEW_REPLY =
  "Thanks for sharing. Preview mode: the AI copilot is not connected yet, so I cannot search flights or calculate redemption value. When integration is live, I will help confirm origin, dates, passengers, cabin, and your rewards balances step by step.";

export function createConversation(title = "New trip"): PlannerConversation {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
    tripDraft: emptyTripDraft(),
    updatedAt: now,
  };
}

/** Best-effort draft hints from user text — not verified travel data. */
export function inferTripDraftHints(
  text: string,
  current: TripDraft,
): TripDraft {
  const next = { ...current };
  const fromMatch = text.match(/\bfrom\s+([A-Za-z\s()]+?)(?:\s+to\b|,|\.|$)/i);
  const toMatch = text.match(/\bto\s+([A-Za-z\s()]+?)(?:\s+in\b|,|\.|$)/i);
  if (fromMatch?.[1]) {
    next.origin = fromMatch[1].trim();
  }
  if (toMatch?.[1]) {
    next.destination = toMatch[1].trim();
  }
  if (/\bnext month\b/i.test(text)) {
    next.departureDate = "Next month (draft)";
  }
  if (/\bdecember\b/i.test(text)) {
    next.departureDate = "December (draft)";
  }
  if (/\b1 adult\b/i.test(text) || /\bone adult\b/i.test(text)) {
    next.passengers = "1 adult";
  }
  if (/\beconomy\b/i.test(text)) {
    next.cabinClass = "Economy";
  }
  if (/\bpoints\b/i.test(text) || /\bmiles\b/i.test(text)) {
    next.pointsOrMiles = "Mentioned in chat (draft)";
  }
  return next;
}

export function conversationTitleFromMessage(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 42) return trimmed;
  return `${trimmed.slice(0, 42)}…`;
}
