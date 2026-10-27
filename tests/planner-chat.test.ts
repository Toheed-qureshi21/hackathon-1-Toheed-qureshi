import assert from "node:assert/strict";
import test from "node:test";

process.env.GROQ_API_KEY = process.env.GROQ_API_KEY ?? "test-groq-key";
import {
  GroqPlannerError,
  extractPlannerIntentWithGroq,
  mapGroqPlannerErrorToStatus,
  publicGroqErrorMessage,
} from "../lib/groq/planner-chat-service.ts";
import { handlePlannerChatPost } from "../lib/planner/planner-chat-handler.ts";
import { mergePlannerChatState } from "../lib/planner/mergeTripState.ts";
import { processPlannerChatTurn } from "../lib/planner/process-chat-turn.ts";
import {
  groqPlannerModelOutputSchema,
  plannerChatRequestSchema,
} from "../schemas/plannerChatApiSchema.ts";
import { emptyTripPlannerFormValues } from "../schemas/tripPlannerSchema.ts";

const baseForm = emptyTripPlannerFormValues();

const baseRequest = {
  message: "Fly from Mumbai to London in business class on 2026-12-10, 2 passengers.",
  recentMessages: [],
  tripForm: baseForm,
  validatedTripInput: null,
};

const validGroqJson = JSON.stringify({
  assistantMessage:
    "Got it — Mumbai to London in business on 10 Dec 2026 for 2 passengers. Do you have Avios or other miles to use?",
  tripPatch: {
    origin: "Mumbai",
    destination: "London",
    journeyType: "one_way",
    departureDate: "2026-12-10",
    passengerCount: 2,
    cabinClass: "business",
  },
  rewardsPatches: [],
  missingFields: ["rewards"],
  conversationStatus: "collecting_rewards",
  searchCompleted: false,
});

function mockGroqClient(json: string) {
  return {
    completeJson: async () => json,
  };
}

test("plannerChatRequestSchema rejects empty message", () => {
  const result = plannerChatRequestSchema.safeParse({
    ...baseRequest,
    message: "   ",
  });
  assert.equal(result.success, false);
});

test("plannerChatRequestSchema rejects oversized message", () => {
  const result = plannerChatRequestSchema.safeParse({
    ...baseRequest,
    message: "x".repeat(2001),
  });
  assert.equal(result.success, false);
});

test("groqPlannerModelOutputSchema rejects fabricated searchCompleted", () => {
  const result = groqPlannerModelOutputSchema.safeParse({
    assistantMessage: "Search complete.",
    conversationStatus: "ready_for_search_handoff",
    missingFields: [],
    searchCompleted: true,
  });
  assert.equal(result.success, false);
});

test("extractPlannerIntentWithGroq fails when GROQ_API_KEY is missing", async () => {
  const previous = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    await assert.rejects(
      () =>
        extractPlannerIntentWithGroq(
          plannerChatRequestSchema.parse(baseRequest),
          mockGroqClient(validGroqJson),
        ),
      (error: unknown) => {
        assert.ok(error instanceof GroqPlannerError);
        assert.equal(error.code, "not_configured");
        return true;
      },
    );
  } finally {
    if (previous) process.env.GROQ_API_KEY = previous;
    else process.env.GROQ_API_KEY = "test-groq-key";
  }
});

test("extractPlannerIntentWithGroq validates model JSON", async () => {
  const output = await extractPlannerIntentWithGroq(
    plannerChatRequestSchema.parse(baseRequest),
    mockGroqClient(validGroqJson),
  );
  assert.equal(output.conversationStatus, "collecting_rewards");
  assert.equal(output.searchCompleted, false);
  assert.match(output.assistantMessage, /Mumbai/);
});

test("extractPlannerIntentWithGroq rejects malformed JSON", async () => {
  await assert.rejects(
    () =>
      extractPlannerIntentWithGroq(
        plannerChatRequestSchema.parse(baseRequest),
        mockGroqClient("not-json"),
      ),
    (error: unknown) => {
      assert.ok(error instanceof GroqPlannerError);
      assert.equal(error.code, "invalid_response");
      return true;
    },
  );
});

test("extractPlannerIntentWithGroq rejects schema-invalid model output", async () => {
  await assert.rejects(
    () =>
      extractPlannerIntentWithGroq(
        plannerChatRequestSchema.parse(baseRequest),
        mockGroqClient(
          JSON.stringify({
            assistantMessage: "Hi",
            conversationStatus: "collecting_trip_details",
            missingFields: [],
            searchCompleted: false,
            tripPatch: { passengerCount: 99 },
          }),
        ),
      ),
    (error: unknown) => {
      assert.ok(error instanceof GroqPlannerError);
      assert.equal(error.code, "invalid_response");
      return true;
    },
  );
});

test("mergePlannerChatState applies patch and preserves unrelated fields on correction", () => {
  const request = plannerChatRequestSchema.parse({
    ...baseRequest,
    tripForm: {
      ...baseForm,
      origin: "Mumbai",
      destination: "London",
      departureDate: "10-12-2026",
      passengerCount: "2",
      cabinClass: "business",
      journeyType: "one_way",
    },
  });

  const merged = mergePlannerChatState(request, {
    assistantMessage: "Updated destination.",
    tripPatch: { destination: "Paris" },
    rewardsPatches: [],
    missingFields: [],
    conversationStatus: "collecting_trip_details",
    searchCompleted: false,
  });

  assert.equal(merged.mergedTripForm.origin, "Mumbai");
  assert.equal(merged.mergedTripForm.destination, "Paris");
  assert.equal(merged.mergedTripForm.passengerCount, "2");
});

test("mergePlannerChatState distinguishes unknown vs zero reward balance", () => {
  const request = plannerChatRequestSchema.parse(baseRequest);
  const merged = mergePlannerChatState(request, {
    assistantMessage: "Thanks.",
    tripPatch: {},
    rewardsPatches: [
      {
        action: "upsert",
        programId: "british_airways",
        balanceStatus: "confirmed",
        balancePoints: 0,
      },
      {
        action: "upsert",
        programId: "iberia",
        balanceStatus: "unknown",
      },
    ],
    missingFields: [],
    conversationStatus: "collecting_rewards",
    searchCompleted: false,
  });

  const ba = merged.mergedTripForm.rewards.find(
    (r) => r.programId === "british_airways",
  );
  const iberia = merged.mergedTripForm.rewards.find(
    (r) => r.programId === "iberia",
  );
  assert.equal(ba?.balanceUnknown, false);
  assert.equal(ba?.balancePoints, "0");
  assert.equal(iberia?.balanceUnknown, true);
  assert.equal(iberia?.balancePoints, "");
});

test("processPlannerChatTurn returns merged form without claiming search ran", async () => {
  const result = await processPlannerChatTurn(
    plannerChatRequestSchema.parse(baseRequest),
    mockGroqClient(validGroqJson),
  );
  assert.equal(result.ok, true);
  assert.equal(result.searchHandoffReady, false);
  assert.equal(result.mergedTripForm.destination, "London");
});

test("handlePlannerChatPost returns 401 when unauthenticated", async () => {
  const response = await handlePlannerChatPost(
    new Request("http://localhost/api/planner/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseRequest),
    }),
    {
      getAuthenticatedUser: async () => null,
      groqClient: mockGroqClient(validGroqJson),
    },
  );
  assert.equal(response.status, 401);
});

test("handlePlannerChatPost returns 400 for invalid body", async () => {
  const response = await handlePlannerChatPost(
    new Request("http://localhost/api/planner/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "hi" }),
    }),
    {
      getAuthenticatedUser: async () => ({ id: "user-1" }) as never,
      groqClient: mockGroqClient(validGroqJson),
    },
  );
  assert.equal(response.status, 400);
});

test("handlePlannerChatPost returns 413 for oversized body", async () => {
  const huge = JSON.stringify({
    ...baseRequest,
    tripForm: {
      ...baseForm,
      naturalLanguageNote: "z".repeat(40_000),
    },
  });
  const response = await handlePlannerChatPost(
    new Request("http://localhost/api/planner/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "content-length": String(huge.length),
      },
      body: huge,
    }),
    {
      getAuthenticatedUser: async () => ({ id: "user-1" }) as never,
      groqClient: mockGroqClient(validGroqJson),
    },
  );
  assert.equal(response.status, 413);
});

test("handlePlannerChatPost maps Groq not_configured to safe 503 message", async () => {
  const response = await handlePlannerChatPost(
    new Request("http://localhost/api/planner/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseRequest),
    }),
    {
      getAuthenticatedUser: async () => ({ id: "user-1" }) as never,
      groqClient: {
        completeJson: async () => {
          throw new GroqPlannerError("not_configured", "missing key");
        },
      },
    },
  );
  assert.equal(response.status, 503);
  const body = (await response.json()) as { error: string };
  assert.match(body.error, /temporarily unavailable/i);
  assert.doesNotMatch(body.error, /GROQ|api key/i);
});

test("handlePlannerChatPost maps timeout and rate limit codes", async () => {
  assert.equal(mapGroqPlannerErrorToStatus("timeout"), 504);
  assert.equal(mapGroqPlannerErrorToStatus("rate_limit"), 429);
  assert.match(publicGroqErrorMessage("rate_limit"), /busy/i);
});

test("handlePlannerChatPost succeeds with mocked Groq", async () => {
  const response = await handlePlannerChatPost(
    new Request("http://localhost/api/planner/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseRequest),
    }),
    {
      getAuthenticatedUser: async () => ({ id: "user-1" }) as never,
      groqClient: mockGroqClient(validGroqJson),
    },
  );
  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    ok: boolean;
    assistantMessage: string;
    mergedTripForm: { destination: string };
  };
  assert.equal(body.ok, true);
  assert.equal(body.mergedTripForm.destination, "London");
});
