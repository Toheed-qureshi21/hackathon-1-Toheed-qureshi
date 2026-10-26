import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type PillProps = HTMLAttributes<HTMLSpanElement>;

export function Pill({ className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-xs font-bold tracking-wide text-primary uppercase",
        className,
      )}
      {...props}
    />
  );
}
