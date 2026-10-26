"use client";

import { ChatComposer } from "@/components/planner/ChatComposer";
import { ChatMessageBubble } from "@/components/planner/ChatMessageBubble";
import { ChatTypingIndicator } from "@/components/planner/ChatTypingIndicator";
import { PlannerEmptyState } from "@/components/planner/PlannerEmptyState";
import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { TripSummaryCard } from "@/components/planner/TripSummaryCard";
import {
  ASSISTANT_PREVIEW_REPLY,
  type ChatMessage,
  type PlannerConversation,
  conversationTitleFromMessage,
  createConversation,
  inferTripDraftHints,
} from "@/schemas/plannerChat";
import { cn } from "@/lib/utils";
import Image from "next/image";
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
    const next = createConversation();
    setConversations((prev) => [next, ...prev]);
    setActiveId(next.id);
    setComposer("");
    setMobileNavOpen(false);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    setMobileNavOpen(false);
  }, []);

  const showEmptyState = activeConversation.messages.length === 0 && !isTyping;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-[245px] shrink-0 md:block">
        <PlannerSidebar
          className="sticky top-0 h-screen"
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
          "fixed inset-y-0 left-0 z-50 w-[min(100%,280px)] transform transition-transform duration-200 md:hidden",
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

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <button
            type="button"
            className="rounded-button border border-border bg-secondary p-2.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
            aria-expanded={mobileNavOpen}
            aria-controls="planner-mobile-nav"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <Image src="/icons/menu.svg" alt="" width={20} height={20} aria-hidden />
            <span className="sr-only">Open menu</span>
          </button>
          <p className="font-heading text-sm font-semibold text-foreground">
            Plan your trip
          </p>
          <div className="size-10" aria-hidden />
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 pb-36 pt-6 md:px-8 md:pt-9"
        >
          <div className="mx-auto w-full max-w-[940px]">
            {showEmptyState ? (
              <PlannerEmptyState onSelectPrompt={(prompt) => void sendText(prompt)} />
            ) : (
              <>
                <div className="mb-6 md:mb-8">
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    Plan your trip
                  </p>
                  <h1 className="mt-2 font-heading text-3xl tracking-tight text-foreground">
                    {activeConversation.title || "Trip conversation"}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Chat to shape your trip. Flight search and AI optimization
                    are not connected in this preview.
                  </p>
                </div>

                <div className="flex flex-col gap-5" role="log" aria-live="polite">
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

                <TripSummaryCard draft={activeConversation.tripDraft} />
              </>
            )}
          </div>
        </div>

        <div className="fixed right-0 bottom-5 left-0 z-30 px-4 md:left-[245px] md:px-8">
          <div className="mx-auto w-full max-w-[760px]">
            <ChatComposer
              value={composer}
              onChange={setComposer}
              onSend={() => void sendText(composer)}
              disabled={isTyping}
            />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Enter to send · Shift+Enter for a new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
