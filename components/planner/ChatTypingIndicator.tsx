import Image from "next/image";

export function ChatTypingIndicator() {
  return (
    <div className="flex gap-3" aria-live="polite" aria-label="Assistant is typing">
      <div className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary">
        <Image src="/icons/sparkles.svg" alt="" width={16} height={16} aria-hidden />
      </div>
      <div className="rounded-[18px] border border-border bg-secondary px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0ms]" />
          <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
          <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
