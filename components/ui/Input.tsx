import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-input border border-input bg-input-background px-3.5 py-[13px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
        hasError &&
          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}
