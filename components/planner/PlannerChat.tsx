"use client";

import { ChatComposer } from "@/components/planner/ChatComposer";
import { ChatMessageBubble } from "@/components/planner/ChatMessageBubble";
import { ChatTypingIndicator } from "@/components/planner/ChatTypingIndicator";
import { PlannerAmbientBackground } from "@/components/planner/PlannerAmbientBackground";
import { PlannerEmptyState } from "@/components/planner/PlannerEmptyState";
import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { PlannerTopBar } from "@/components/planner/PlannerTopBar";
import { TripSummaryCard } from "@/components/planner/TripSummaryCard";
import {
  plannerSectionLabelClassName,
  plannerWorkspaceTitleClassName,
} from "@/lib/plannerFieldStyles";
import {
  ASSISTANT_PREVIEW_REPLY,
  type ChatMessage,
  type PlannerConversation,
  conversationTitleFromMessage,
  createConversation,
  inferTripDraftHints,
  isTripDraftEmpty,
} from "@/schemas/plannerChat";
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
  const [isTyping, setIsTyping] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  const processAssistantReply = useCallback(
    async (conversationId: string, userText: string) => {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 700));

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: ASSISTANT_PREVIEW_REPLY,
        status: "sent",
        createdAt: Date.now(),
      };

      setConversations((prev) =>
        updateConversation(prev, conversationId, (c) => ({
          ...c,
          messages: [...c.messages, assistantMessage],
          tripDraft: inferTripDraftHints(userText, c.tripDraft),
          updatedAt: Date.now(),
        })),
      );
      setIsTyping(false);
      scrollToBottom();
    },
    [scrollToBottom],
  );

  const sendText = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isTyping || !activeId) return;

      const conversationId = activeId;
      const userMessageId = crypto.randomUUID();
      const shouldFail = text.toLowerCase().includes(SIMULATE_SEND_FAILURE);
      const displayText = shouldFail
        ? text.replace(new RegExp(SIMULATE_SEND_FAILURE, "ig"), "").trim() || text
        : text;

      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: displayText,
        status: "sending",
        createdAt: Date.now(),
      };

      setConversations((prev) =>
        updateConversation(prev, conversationId, (c) => {
          const isFirst = c.messages.length === 0;
          return {
            ...c,
            title: isFirst ? conversationTitleFromMessage(displayText) : c.title,
            messages: [...c.messages, userMessage],
            updatedAt: Date.now(),
          };
        }),
      );
      setComposer("");
      scrollToBottom();

      await new Promise((r) => setTimeout(r, 350));

      if (shouldFail) {
        setConversations((prev) =>
          updateConversation(prev, conversationId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === userMessageId ? { ...m, status: "failed" as const } : m,
            ),
          })),
        );
        return;
      }

      setConversations((prev) =>
        updateConversation(prev, conversationId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === userMessageId ? { ...m, status: "sent" as const } : m,
          ),
        })),
      );

      await processAssistantReply(conversationId, displayText);
    },
    [activeId, isTyping, processAssistantReply, scrollToBottom],
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
    [activeConversation, activeId, sendText],
  );

  const handleNewTrip = useCallback(() => {
    const current = conversations.find((c) => c.id === activeId);
    if (
      current &&
      current.messages.length === 0 &&
      isTripDraftEmpty(current.tripDraft)
    ) {
      setComposer("");
      setIsTyping(false);
      setMobileNavOpen(false);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      mainRegionRef.current?.focus();
      return;
    }

    const next = createConversation();
    setConversations((prev) => [next, ...prev]);
    setActiveId(next.id);
    setComposer("");
    setIsTyping(false);
    setMobileNavOpen(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    mainRegionRef.current?.focus();
  }, [activeId, conversations]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    setMobileNavOpen(false);
  }, []);

  const showEmptyState = activeConversation.messages.length === 0 && !isTyping;
  const hasConversation = activeConversation.messages.length > 0 || isTyping;

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

        {showEmptyState ? (
          <div
            ref={mainRegionRef}
            tabIndex={-1}
            id="planner-main"
            className="relative flex flex-1 flex-col overflow-y-auto px-4 py-10 outline-none md:px-8"
          >
            <PlannerEmptyState onSelectPrompt={(prompt) => void sendText(prompt)} />
          </div>
        ) : (
          <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-4 md:px-6 lg:px-8">
            <div className="grid flex-1 grid-cols-1 items-start gap-6 py-6 xl:grid-cols-12 xl:gap-8">
              <div className="flex min-h-0 flex-col xl:col-span-7">
                <header className="mb-6 shrink-0">
                  <p
                    className={cn(
                      plannerSectionLabelClassName,
                      "flex items-center gap-2 text-primary",
                    )}
                  >
                    <span className="inline-block size-2 rounded-full bg-primary shadow-[0_0_8px_#c7f36b]" />
                    Plan your trip
                  </p>
                  <h1 className={cn("mt-2", plannerWorkspaceTitleClassName)}>
                    {activeConversation.title || "Trip conversation"}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    Chat to shape your trip. Flight search and AI optimization
                    are not connected in this preview.
                  </p>
                </header>

                <div
                  ref={scrollRef}
                  className="min-h-[200px] flex-1 overflow-y-auto pr-1"
                >
                  <div className="flex flex-col gap-6 pb-4" role="log" aria-live="polite">
                    {activeConversation.messages.map((message) => (
                      <ChatMessageBubble
                        key={message.id}
                        message={message}
                        onRetry={
                          message.status === "failed" ? handleRetry : undefined
                        }
                      />
                    ))}
                    {isTyping ? <ChatTypingIndicator /> : null}
                  </div>

                  <div className="xl:hidden">
                    <TripSummaryCard
                      draft={activeConversation.tripDraft}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 z-20 shrink-0 bg-gradient-to-t from-background from-60% to-transparent pt-4 pb-2">
                  <ChatComposer
                    value={composer}
                    onChange={setComposer}
                    onSend={() => void sendText(composer)}
                    onQuickPrompt={(prompt) => void sendText(prompt)}
                    disabled={isTyping}
                    showQuickPrompts={hasConversation}
                  />
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Enter to send · Shift+Enter for a new line
                  </p>
                </div>
              </div>

              <aside className="hidden xl:col-span-5 xl:block">
                <div className="sticky top-20">
                  <TripSummaryCard draft={activeConversation.tripDraft} />
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
