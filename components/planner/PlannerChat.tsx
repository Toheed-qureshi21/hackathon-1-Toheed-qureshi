"use client";

import { ChatComposer } from "@/components/planner/ChatComposer";
import { ChatMessageBubble } from "@/components/planner/ChatMessageBubble";
import { PlannerAmbientBackground } from "@/components/planner/PlannerAmbientBackground";
import { PlannerEmptyState } from "@/components/planner/PlannerEmptyState";
import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { PlannerTopBar } from "@/components/planner/PlannerTopBar";
import { CashFlightResults } from "@/components/planner/CashFlightResults";
import { RewardsEvaluationPanel } from "@/components/planner/RewardsEvaluationPanel";
import { TripPlannerForm } from "@/components/planner/TripPlannerForm";
import { TripSummaryCard } from "@/components/planner/TripSummaryCard";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { fieldErrorsFromZod } from "@/lib/zodFieldErrors";
import {
  postFlightSearch,
  postPlannerChat,
  postRewardsEvaluation,
  postTripPlannerInput,
} from "@/lib/planner/client-api";
import {
  plannerSectionLabelClassName,
  plannerWorkspaceTitleClassName,
} from "@/lib/plannerFieldStyles";
import { MAX_PLANNER_CHAT_RECENT_MESSAGES } from "@/schemas/plannerChatApiSchema";
import {
  type ChatMessage,
  type PlannerConversation,
  conversationTitleFromMessage,
  createConversation,
  isTripFormPristine,
} from "@/schemas/plannerChat";
import type { FlightSearchSuccessResponse } from "@/schemas/flightSearchSchema";
import type {
  RewardsEvaluationSuccessResponse,
  UserRedemptionAssumption,
} from "@/schemas/rewardsEvaluationSchema";
import { iataCodeSchema } from "@/schemas/plannerLocationSchema";
import {
  tripPlannerFormSchema,
  type TripPlannerFormValues,
  type TripPlannerInput,
} from "@/schemas/tripPlannerSchema";
import { cn } from "@/lib/utils";
import { useCallback, useMemo, useRef, useState } from "react";

const SIMULATE_SEND_FAILURE = "[fail]";

function updateConversation(
  conversations: PlannerConversation[],
  id: string,
  updater: (c: PlannerConversation) => PlannerConversation,
): PlannerConversation[] {
  return conversations.map((c) => (c.id === id ? updater(c) : c));
}

export function PlannerChat() {
  const [session] = useState(() => {
    const first = createConversation();
    return { conversations: [first], activeId: first.id };
  });
  const [conversations, setConversations] = useState<PlannerConversation[]>(
    session.conversations,
  );
  const [activeId, setActiveId] = useState<string>(session.activeId);
  const [composer, setComposer] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [flightSearchResult, setFlightSearchResult] =
    useState<FlightSearchSuccessResponse | null>(null);
  const [flightSearchError, setFlightSearchError] = useState<string | null>(null);
  const [isFlightSearching, setIsFlightSearching] = useState(false);
  const [rewardsEvaluation, setRewardsEvaluation] =
    useState<RewardsEvaluationSuccessResponse | null>(null);
  const [rewardsEvaluationError, setRewardsEvaluationError] = useState<
    string | null
  >(null);
  const [isRewardsEvaluating, setIsRewardsEvaluating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mainRegionRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [activeId, conversations],
  );

  const canSearchFlights = useMemo(() => {
    const trip = activeConversation.validatedTripInput;
    const form = activeConversation.tripForm;
    if (!trip) return false;
    return (
      iataCodeSchema.safeParse(form.originIataCode).success &&
      iataCodeSchema.safeParse(form.destinationIataCode).success
    );
  }, [activeConversation.tripForm, activeConversation.validatedTripInput]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const updateActiveTripForm = useCallback(
    (tripForm: TripPlannerFormValues) => {
      setConversations((prev) =>
        updateConversation(prev, activeId, (c) => ({
          ...c,
          tripForm,
          updatedAt: Date.now(),
        })),
      );
      setSaveSuccess(null);
    },
    [activeId],
  );

  const appendChatMessages = useCallback(
    (messages: ChatMessage[]) => {
      setConversations((prev) =>
        updateConversation(prev, activeId, (c) => ({
          ...c,
          messages: [...c.messages, ...messages],
          updatedAt: Date.now(),
        })),
      );
    },
    [activeId],
  );

  const runRewardsEvaluation = useCallback(
    async (
      trip: TripPlannerInput,
      form: TripPlannerFormValues,
      offers: FlightSearchSuccessResponse["offers"],
      redemptionAssumptions: UserRedemptionAssumption[],
    ) => {
      if (isRewardsEvaluating || offers.length === 0) return;
      const originParsed = iataCodeSchema.safeParse(form.originIataCode);
      const destinationParsed = iataCodeSchema.safeParse(form.destinationIataCode);
      if (!originParsed.success || !destinationParsed.success) return;

      setRewardsEvaluationError(null);
      setIsRewardsEvaluating(true);
      try {
        const { response, data } = await postRewardsEvaluation({
          trip,
          originIataCode: originParsed.data,
          destinationIataCode: destinationParsed.data,
          offers,
          redemptionAssumptions,
        });
        if (!response.ok || !data.ok) {
          setRewardsEvaluationError(
            !data.ok && data.error
              ? data.error
              : "Unable to evaluate rewards. Please try again.",
          );
          return;
        }
        setRewardsEvaluation(data);
      } catch {
        setRewardsEvaluationError(
          "Network error during rewards evaluation. Try again.",
        );
      } finally {
        setIsRewardsEvaluating(false);
      }
    },
    [isRewardsEvaluating],
  );

  const runFlightSearch = useCallback(
    async (
      trip: TripPlannerInput,
      form: TripPlannerFormValues,
      options?: { postToChat?: boolean },
    ) => {
      if (isFlightSearching) return false;
      const postToChat = options?.postToChat ?? true;

      setFlightSearchError(null);
      const originParsed = iataCodeSchema.safeParse(form.originIataCode);
      const destinationParsed = iataCodeSchema.safeParse(form.destinationIataCode);
      if (!originParsed.success || !destinationParsed.success) {
        const errorText =
          "Select origin and destination airports from the suggestions before searching.";
        setFlightSearchError(errorText);
        if (postToChat) {
          appendChatMessages([
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: errorText,
              status: "sent",
              createdAt: Date.now(),
            },
          ]);
          scrollToBottom();
        }
        return false;
      }

      if (postToChat) {
        appendChatMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Searching cash flights on Duffel…",
            status: "sent",
            createdAt: Date.now(),
          },
        ]);
        scrollToBottom();
      }

      setIsFlightSearching(true);
      try {
        const { response, data } = await postFlightSearch({
          trip,
          originIataCode: originParsed.data,
          destinationIataCode: destinationParsed.data,
        });
        if (!response.ok || !data.ok) {
          const errorText =
            !data.ok && data.error
              ? data.error
              : "Unable to search for cash flights. Please try again.";
          setFlightSearchError(errorText);
          if (postToChat) {
            appendChatMessages([
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: errorText,
                status: "sent",
                createdAt: Date.now(),
              },
            ]);
            scrollToBottom();
          }
          return false;
        }
        setFlightSearchResult(data);
        if (data.offers.length > 0) {
          void runRewardsEvaluation(
            trip,
            form,
            data.offers,
            [],
          );
        } else {
          setRewardsEvaluation(null);
        }
        if (postToChat) {
          appendChatMessages([
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content:
                data.status === "no_offers"
                  ? "No cash offers were returned for this trip."
                  : `Cash flight search complete (${data.offers.length} offer${data.offers.length === 1 ? "" : "s"}).`,
              status: "sent",
              createdAt: Date.now(),
              kind: "flight_search",
              flightSearch: data,
            },
          ]);
          scrollToBottom();
        }
        return true;
      } catch {
        const errorText = "Network error. Check your connection and try again.";
        setFlightSearchError(errorText);
        if (postToChat) {
          appendChatMessages([
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: errorText,
              status: "sent",
              createdAt: Date.now(),
            },
          ]);
          scrollToBottom();
        }
        return false;
      } finally {
        setIsFlightSearching(false);
      }
    },
    [appendChatMessages, isFlightSearching, runRewardsEvaluation, scrollToBottom],
  );

  const sendText = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || !activeId || isChatLoading) return;

      const shouldFail = text.toLowerCase().includes(SIMULATE_SEND_FAILURE);
      const displayText = shouldFail
        ? text.replace(new RegExp(SIMULATE_SEND_FAILURE, "ig"), "").trim() || text
        : text;

      if (shouldFail) {
        const failedMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: displayText,
          status: "failed",
          createdAt: Date.now(),
        };
        setConversations((prev) =>
          updateConversation(prev, activeId, (c) => ({
            ...c,
            messages: [...c.messages, failedMessage],
          })),
        );
        scrollToBottom();
        return;
      }

      const userMessageId = crypto.randomUUID();
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: displayText,
        status: "sent",
        createdAt: Date.now(),
      };

      const conversationSnapshot = activeConversation;
      setChatError(null);
      setComposer("");
      setIsChatLoading(true);

      setConversations((prev) =>
        updateConversation(prev, activeId, (c) => {
          const isFirst = c.messages.length === 0;
          return {
            ...c,
            title: isFirst ? conversationTitleFromMessage(displayText) : c.title,
            messages: [...c.messages, userMessage],
            updatedAt: Date.now(),
          };
        }),
      );
      scrollToBottom();

      const recentMessages = [
        ...conversationSnapshot.messages,
        { ...userMessage, status: "sent" as const },
      ]
        .filter(
          (m) =>
            m.status === "sent" &&
            (m.role === "user" || m.role === "assistant"),
        )
        .slice(-MAX_PLANNER_CHAT_RECENT_MESSAGES)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      try {
        const { response, data } = await postPlannerChat({
          message: displayText,
          recentMessages,
          tripForm: conversationSnapshot.tripForm,
          validatedTripInput: conversationSnapshot.validatedTripInput,
        });

        if (!response.ok || !data.ok) {
          const errorMessage =
            !data.ok && data.error
              ? data.error
              : "Unable to reach the assistant. Please try again.";
          setChatError(errorMessage);
          setConversations((prev) =>
            updateConversation(prev, activeId, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === userMessageId ? { ...m, status: "failed" } : m,
              ),
            })),
          );
          scrollToBottom();
          return;
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.assistantMessage,
          status: "sent",
          createdAt: Date.now(),
        };

        setConversations((prev) =>
          updateConversation(prev, activeId, (c) => ({
            ...c,
            messages: [
              ...c.messages,
              assistantMessage,
            ],
            tripForm: data.mergedTripForm,
            validatedTripInput: data.validatedTripInput,
            updatedAt: Date.now(),
          })),
        );
        setSaveSuccess(null);
        setFieldErrors({});

        if (data.searchHandoffReady && data.validatedTripInput) {
          void runFlightSearch(data.validatedTripInput, data.mergedTripForm);
        } else if (data.conversationStatus === "ready_for_search_handoff") {
          if (!data.validatedTripInput) {
            setFlightSearchError(
              "Trip details still need valid dates and required fields — check the form below, then save or search manually.",
            );
          } else if (
            !iataCodeSchema.safeParse(data.mergedTripForm.originIataCode)
              .success ||
            !iataCodeSchema.safeParse(data.mergedTripForm.destinationIataCode)
              .success
          ) {
            setFlightSearchError(
              "Pick origin and destination from the airport suggestions (IATA codes). Cash search cannot run on city names alone.",
            );
          }
        }
      } catch {
        setChatError("Network error. Check your connection and try again.");
        setConversations((prev) =>
          updateConversation(prev, activeId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === userMessageId ? { ...m, status: "failed" } : m,
            ),
          })),
        );
      } finally {
        setIsChatLoading(false);
        scrollToBottom();
      }
    },
    [activeConversation, activeId, isChatLoading, runFlightSearch, scrollToBottom],
  );

  const handleRetry = useCallback(
    (messageId: string) => {
      const message = activeConversation.messages.find((m) => m.id === messageId);
      if (!message || message.role !== "user") return;

      setConversations((prev) =>
        updateConversation(prev, activeId, (c) => ({
          ...c,
          messages: c.messages.filter((m) => m.id !== messageId),
        })),
      );
      void sendText(message.content);
    },
    [activeConversation.messages, activeId, sendText],
  );

  const handleFlightSearch = useCallback(async () => {
    const trip = activeConversation.validatedTripInput;
    const form = activeConversation.tripForm;
    if (!trip) {
      setFlightSearchError(
        "Save and validate the trip form first, then search for cash flights.",
      );
      return;
    }
    await runFlightSearch(trip, form);
  }, [activeConversation.tripForm, activeConversation.validatedTripInput, runFlightSearch]);

  const handleSaveTrip = useCallback(async () => {
    setFormError(null);
    setSaveSuccess(null);
    setFieldErrors({});

    const parsed = tripPlannerFormSchema.safeParse(activeConversation.tripForm);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      setFormError("Fix the highlighted fields and try again.");
      return;
    }

    setIsSaving(true);
    try {
      const { response, data } = await postTripPlannerInput(parsed.data);
      if (!response.ok || !data.ok) {
        if (!data.ok && data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setFormError(
          !data.ok
            ? data.error
            : "Unable to save trip details. Please try again.",
        );
        return;
      }

      const savedForm: TripPlannerFormValues = {
        ...activeConversation.tripForm,
        naturalLanguageNote: parsed.data.naturalLanguageNote ?? "",
      };

      setConversations((prev) =>
        updateConversation(prev, activeId, (c) => ({
          ...c,
          validatedTripInput: data.tripInput,
          tripForm: savedForm,
          updatedAt: Date.now(),
        })),
      );
      setSaveSuccess("Trip details saved and validated for this session.");
      appendChatMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Trip details saved. Starting cash flight search…",
          status: "sent",
          createdAt: Date.now(),
        },
      ]);
      scrollToBottom();
      void runFlightSearch(data.tripInput, savedForm);
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    activeConversation.tripForm,
    activeId,
    appendChatMessages,
    runFlightSearch,
    scrollToBottom,
  ]);

  const handleNewTrip = useCallback(() => {
    const current = conversations.find((c) => c.id === activeId);
    if (
      current &&
      current.messages.length === 0 &&
      isTripFormPristine(current.tripForm) &&
      !current.validatedTripInput
    ) {
      setComposer("");
      setMobileNavOpen(false);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      mainRegionRef.current?.focus();
      return;
    }

    const next = createConversation();
    setConversations((prev) => [next, ...prev]);
    setActiveId(next.id);
    setComposer("");
    setFieldErrors({});
    setFormError(null);
    setSaveSuccess(null);
    setFlightSearchResult(null);
    setFlightSearchError(null);
    setRewardsEvaluation(null);
    setRewardsEvaluationError(null);
    setMobileNavOpen(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    mainRegionRef.current?.focus();
  }, [activeId, conversations]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    setFieldErrors({});
    setFormError(null);
    setSaveSuccess(null);
    setFlightSearchResult(null);
    setFlightSearchError(null);
    setRewardsEvaluation(null);
    setRewardsEvaluationError(null);
    setMobileNavOpen(false);
  }, []);

  const showEmptyState = activeConversation.messages.length === 0;
  const hasConversation = activeConversation.messages.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <PlannerTopBar
        mobileNavOpen={mobileNavOpen}
        onOpenMobileNav={() => setMobileNavOpen((o) => !o)}
      />

      <div className="hidden md:fixed md:top-16 md:bottom-0 md:left-0 md:z-40 md:block">
        <PlannerSidebar
          className="h-full"
          conversations={conversations}
          activeConversationId={activeId}
          onSelectConversation={handleSelectConversation}
          onNewTrip={handleNewTrip}
        />
      </div>

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div
        id="planner-mobile-nav"
        className={cn(
          "fixed top-16 bottom-0 left-0 z-50 w-[min(100%,16rem)] transform transition-transform duration-200 md:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <PlannerSidebar
          className="h-full shadow-xl"
          conversations={conversations}
          activeConversationId={activeId}
          onSelectConversation={handleSelectConversation}
          onNewTrip={handleNewTrip}
        />
      </div>

      <div className="relative flex min-h-screen flex-col pt-16 md:pl-64">
        <PlannerAmbientBackground />

        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-4 md:px-6 lg:px-8">
          <div className="grid flex-1 grid-cols-1 items-start gap-6 py-6 xl:grid-cols-12 xl:gap-8">
            <div
              ref={mainRegionRef}
              tabIndex={-1}
              id="planner-main"
              className="flex min-h-0 flex-col outline-none xl:col-span-7"
            >
              {showEmptyState ? (
                <div className="mb-8">
                  <PlannerEmptyState
                    onSelectPrompt={(prompt) => {
                      void sendText(prompt);
                    }}
                  />
                </div>
              ) : (
                <>
                  <header className="mb-6 shrink-0">
                    <p
                      className={cn(
                        plannerSectionLabelClassName,
                        "flex items-center gap-2 text-primary",
                      )}
                    >
                      <span className="inline-block size-2 rounded-full bg-primary shadow-[0_0_8px_#c7f36b]" />
                      Conversation notes
                    </p>
                    <h1 className={cn("mt-2", plannerWorkspaceTitleClassName)}>
                      {activeConversation.title || "Trip conversation"}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                      Messages stay in this browser session. The assistant
                      updates the trip form when it can extract details — save
                      the form to lock validated requirements.
                    </p>
                  </header>

                  <div
                    ref={scrollRef}
                    className="scrollbar-none mb-6 max-h-[min(520px,55vh)] min-h-[120px] overflow-y-auto"
                  >
                    <div
                      className="flex flex-col gap-5"
                      role="log"
                      aria-live="polite"
                    >
                      {activeConversation.messages.map((message) => (
                        <ChatMessageBubble
                          key={message.id}
                          message={message}
                          onRetry={
                            message.status === "failed" ? handleRetry : undefined
                          }
                        />
                      ))}
                      {isChatLoading ? (
                        <ChatMessageBubble
                          message={{
                            id: "assistant-pending",
                            role: "assistant",
                            content: "",
                            status: "typing",
                            createdAt: 0,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="mb-8">
                    <ChatComposer
                      value={composer}
                      onChange={setComposer}
                      onSend={() => void sendText(composer)}
                      onQuickPrompt={(prompt) => void sendText(prompt)}
                      disabled={isSaving || isChatLoading}
                      showQuickPrompts={hasConversation}
                    />
                    {chatError ? (
                      <FormMessage variant="error" className="mt-3">
                        {chatError}
                      </FormMessage>
                    ) : null}
                    {canSearchFlights ? (
                      <div className="mt-3 flex justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isFlightSearching || isChatLoading || isSaving}
                          onClick={() => void handleFlightSearch()}
                        >
                          {isFlightSearching
                            ? "Searching cash flights…"
                            : "Search cash flights in chat"}
                        </Button>
                      </div>
                    ) : null}
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                      Enter to send · Shift+Enter for a new line
                    </p>
                  </div>
                </>
              )}

              <div className="rounded-planner-xl border border-border bg-surface-planner-panel/90 p-5 md:p-6">
                <TripPlannerForm
                  values={activeConversation.tripForm}
                  fieldErrors={fieldErrors}
                  formError={formError}
                  isSubmitting={isSaving}
                  onChange={updateActiveTripForm}
                  onSubmit={() => void handleSaveTrip()}
                />
                {saveSuccess ? (
                  <FormMessage variant="info" className="mt-4">
                    {saveSuccess}
                  </FormMessage>
                ) : null}
              </div>

              <div className="xl:hidden space-y-6 mt-6">
                <TripSummaryCard tripInput={activeConversation.validatedTripInput} />
                <CashFlightResults
                  result={flightSearchResult}
                  isSearching={isFlightSearching}
                  error={flightSearchError}
                  canSearch={canSearchFlights}
                  onSearch={() => void handleFlightSearch()}
                />
                <RewardsEvaluationPanel
                  tripInput={activeConversation.validatedTripInput}
                  flightSearch={flightSearchResult}
                  evaluation={rewardsEvaluation}
                  isEvaluating={isRewardsEvaluating}
                  error={rewardsEvaluationError}
                  onEvaluate={(assumptions) => {
                    const trip = activeConversation.validatedTripInput;
                    if (!trip || !flightSearchResult?.offers.length) return;
                    void runRewardsEvaluation(
                      trip,
                      activeConversation.tripForm,
                      flightSearchResult.offers,
                      assumptions,
                    );
                  }}
                />
              </div>
            </div>

            <aside className="hidden xl:col-span-5 xl:block">
              <div className="sticky top-20 space-y-6">
                <TripSummaryCard tripInput={activeConversation.validatedTripInput} />
                <CashFlightResults
                  result={flightSearchResult}
                  isSearching={isFlightSearching}
                  error={flightSearchError}
                  canSearch={canSearchFlights}
                  onSearch={() => void handleFlightSearch()}
                />
                <RewardsEvaluationPanel
                  tripInput={activeConversation.validatedTripInput}
                  flightSearch={flightSearchResult}
                  evaluation={rewardsEvaluation}
                  isEvaluating={isRewardsEvaluating}
                  error={rewardsEvaluationError}
                  onEvaluate={(assumptions) => {
                    const trip = activeConversation.validatedTripInput;
                    if (!trip || !flightSearchResult?.offers.length) return;
                    void runRewardsEvaluation(
                      trip,
                      activeConversation.tripForm,
                      flightSearchResult.offers,
                      assumptions,
                    );
                  }}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
