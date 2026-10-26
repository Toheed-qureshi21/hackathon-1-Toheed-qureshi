"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useRef, type KeyboardEvent } from "react";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  className?: string;
};

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  className,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !disabled;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        onSend();
      }
    }
  };

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  return (
    <div
      className={cn(
        "flex items-end gap-2.5 rounded-[18px] border border-panel-border bg-[#111827] p-3 shadow-[0_14px_50px_rgb(0_0_0/0.5)]",
        className,
      )}
    >
      <label htmlFor="planner-composer" className="sr-only">
        Message the travel assistant
      </label>
      <textarea
        ref={textareaRef}
        id="planner-composer"
        rows={1}
        value={value}
        disabled={disabled}
        placeholder="Tell me more about your trip…"
        onChange={(e) => {
          onChange(e.target.value);
          resize();
        }}
        onKeyDown={handleKeyDown}
        className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />
      <Button
        type="button"
        variant="primary"
        disabled={!canSend}
        onClick={onSend}
        className="size-11 shrink-0 px-0"
        aria-label="Send message"
      >
        <Image src="/icons/send.svg" alt="" width={18} height={18} aria-hidden />
      </Button>
    </div>
  );
}
