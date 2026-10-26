import { Button } from "@/components/ui/Button";
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
        <p className="max-w-lg rounded-input border border-ai-blue/30 bg-ai-blue/10 px-4 py-2 text-center text-xs text-muted-foreground">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser ? (
        <div className="grid size-9 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10">
          <Image src="/icons/sparkles.svg" alt="" width={16} height={16} aria-hidden />
        </div>
      ) : null}
      <div className={cn("max-w-[min(75%,36rem)]", isUser && "order-first")}>
        <div
          className={cn(
            "rounded-[18px] border px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "border-transparent bg-[#26364d] text-foreground"
              : "border-border bg-secondary text-foreground",
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
        {message.status === "sent" ? (
          <p
            className={cn(
              "mt-1.5 text-[11px] text-muted-foreground",
              isUser ? "text-right" : "text-left",
            )}
          >
            {formatTime(message.createdAt)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
