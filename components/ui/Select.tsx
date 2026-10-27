import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export function Select({ className, hasError = false, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-input border border-input bg-input-background px-3.5 py-[13px] text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
        hasError &&
          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}
