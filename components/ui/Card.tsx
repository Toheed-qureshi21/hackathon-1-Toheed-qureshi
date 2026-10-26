import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card p-6 text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}
