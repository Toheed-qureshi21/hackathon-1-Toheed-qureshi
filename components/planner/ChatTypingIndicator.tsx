import { plannerSectionLabelClassName } from "@/lib/plannerFieldStyles";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function ChatTypingIndicator() {
  return (
    <div
      className="flex gap-3"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-planner-lg border border-border bg-surface-planner-elevated text-violet">
        <Image src="/icons/sparkles.svg" alt="" width={16} height={16} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="font-heading text-xs font-semibold text-foreground">
            RedeemTrip AI
          </span>
          <span
            className={cn(
              plannerSectionLabelClassName,
              "rounded-planner-sm bg-surface-planner-elevated px-1.5 py-0.5 normal-case tracking-wide text-muted-foreground",
            )}
          >
            Preview mode
          </span>
        </div>
        <div className="rounded-planner-xl border border-border bg-surface-planner-panel px-4 py-3 shadow-sm">
          <div className="flex gap-1.5">
            <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0ms]" />
            <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
            <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
