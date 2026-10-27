import { Button } from "@/components/ui/Button";
import {
  plannerMetricTimeClassName,
  plannerSectionLabelClassName,
} from "@/lib/plannerFieldStyles";
import type { ChatMessage } from "@/schemas/plannerChat";
import { cn } from "@/lib/utils";
import Image from "next/image";

type ChatMessageBubbleProps = {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
};

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function ChatMessageBubble({ message, onRetry }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <p className="max-w-lg rounded-planner-lg border border-ai-blue/30 bg-ai-blue/10 px-4 py-2 text-center text-xs text-muted-foreground">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-planner-lg shadow-sm",
          isUser
            ? "bg-ai-blue/20 text-ai-blue"
            : "border border-border bg-surface-planner-elevated text-violet",
        )}
        aria-hidden
      >
        <Image
          src={isUser ? "/icons/users.svg" : "/icons/sparkles.svg"}
          alt=""
          width={16}
          height={16}
        />
      </div>

      <div className={cn("min-w-0 max-w-[min(100%,36rem)] flex-1")}>
        <div
          className={cn(
            "mb-1.5 flex flex-wrap items-center gap-2",
            isUser && "justify-end",
          )}
        >
          <span className="font-heading text-xs font-semibold text-foreground">
            {isUser ? "You" : "RedeemTrip Copilot"}
          </span>
          {!isUser ? (
            <span
              className={cn(
                plannerSectionLabelClassName,
                "rounded-planner-sm bg-surface-planner-elevated px-1.5 py-0.5 normal-case tracking-wide text-muted-foreground",
              )}
            >
              Preview mode
            </span>
          ) : null}
          {message.status === "sent" ? (
            <span className={plannerMetricTimeClassName}>
              {formatTime(message.createdAt)}
            </span>
          ) : null}
        </div>

        <div
          className={cn(
            "rounded-planner-xl border px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "border-ai-blue/25 bg-surface-planner-user-bubble text-foreground"
              : "border-border bg-surface-planner-panel text-foreground",
            message.status === "failed" && "border-destructive/50",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.status === "sending" ? (
            <p className="mt-2 text-xs text-muted-foreground">Sending…</p>
          ) : null}
          {message.status === "failed" ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-xs text-destructive">Couldn&apos;t send.</p>
              {onRetry ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-2 py-1 text-xs"
                  onClick={() => onRetry(message.id)}
                >
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
