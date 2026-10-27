"use client";

import { Button } from "@/components/ui/Button";
import {
  plannerComposerInputWrapClassName,
  plannerComposerShellClassName,
  plannerQuickChipClassName,
  plannerSectionLabelClassName,
  plannerTextareaClassName,
} from "@/lib/plannerFieldStyles";
import { COMPOSER_QUICK_PROMPTS } from "@/schemas/plannerChat";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useRef, type KeyboardEvent } from "react";
import { ArrowUpIcon } from "lucide-react";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onQuickPrompt?: (prompt: string) => void;
  disabled?: boolean;
  showQuickPrompts?: boolean;
  className?: string;
};

export function ChatComposer({
  value,
  onChange,
  onSend,
  onQuickPrompt,
  disabled = false,
  showQuickPrompts = false,
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
    <div className={cn(plannerComposerShellClassName, className)}>
      {showQuickPrompts && onQuickPrompt ? (
        <div className="scrollbar-none mb-3 flex items-center gap-2 overflow-x-auto pb-0.5">
          <span
            className={cn(
              plannerSectionLabelClassName,
              "mr-1 flex shrink-0 items-center gap-1 normal-case tracking-normal text-muted-foreground",
            )}
          >
            <Image
              src="/icons/sparkles.svg"
              alt=""
              width={14}
              height={14}
              aria-hidden
            />
            Quick prompts
          </span>
          {COMPOSER_QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={disabled}
              className={plannerQuickChipClassName}
              onClick={() => onQuickPrompt(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          plannerComposerInputWrapClassName,
          "focus-within:ring-[3px] focus-within:ring-ring-planner/30",
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
          className={plannerTextareaClassName}
        />
        <Button
          type="button"
          variant="primary"
          disabled={!canSend}
          onClick={onSend}
       
          aria-label="Send message"
        >
        <ArrowUpIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
