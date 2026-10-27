"use client";

import { ChatComposer } from "@/components/planner/ChatComposer";
import { ChatMessageBubble } from "@/components/planner/ChatMessageBubble";
import { PlannerAmbientBackground } from "@/components/planner/PlannerAmbientBackground";
import { PlannerEmptyState } from "@/components/planner/PlannerEmptyState";
import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { PlannerTopBar } from "@/components/planner/PlannerTopBar";
import { TripPlannerForm } from "@/components/planner/TripPlannerForm";
import { TripSummaryCard } from "@/components/planner/TripSummaryCard";
import { FormMessage } from "@/components/ui/FormMessage";
import { fieldErrorsFromZod } from "@/lib/zodFieldErrors";
import { postPlannerChat, postTripPlannerInput } from "@/lib/planner/client-api";
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
import {
  tripPlannerFormSchema,
  type TripPlannerFormValues,
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const mainRegionRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [activeId, conversations],
  );

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
        status: "sending",
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
              ...c.messages.map((m) =>
                m.id === userMessageId ? { ...m, status: "sent" as const } : m,
              ),
              assistantMessage,
            ],
            tripForm: data.mergedTripForm,
            validatedTripInput: data.validatedTripInput,
            updatedAt: Date.now(),
          })),
        );
        setSaveSuccess(null);
        setFieldErrors({});
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
    [activeConversation, activeId, isChatLoading, scrollToBottom],
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

      setConversations((prev) =>
        updateConversation(prev, activeId, (c) => ({
          ...c,
          validatedTripInput: data.tripInput,
          tripForm: {
            ...c.tripForm,
            naturalLanguageNote: parsed.data.naturalLanguageNote ?? "",
          },
          updatedAt: Date.now(),
        })),
      );
      setSaveSuccess("Trip details saved and validated for this session.");
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }, [activeConversation.tripForm, activeId]);

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
    setMobileNavOpen(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    mainRegionRef.current?.focus();
  }, [activeId, conversations]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    setFieldErrors({});
    setFormError(null);
    setSaveSuccess(null);
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
                    className="mb-6 max-h-[280px] min-h-[120px] overflow-y-auto pr-1"
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
                            content: "Thinking…",
                            status: "sending",
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

              <div className="xl:hidden">
                <TripSummaryCard
                  tripInput={activeConversation.validatedTripInput}
                  className="mt-6"
                />
              </div>
            </div>

            <aside className="hidden xl:col-span-5 xl:block">
              <div className="sticky top-20">
                <TripSummaryCard tripInput={activeConversation.validatedTripInput} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
