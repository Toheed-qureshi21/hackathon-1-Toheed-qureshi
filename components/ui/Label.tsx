import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes } from "react";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-[13px] font-semibold text-label", className)}
      {...props}
    />
  );
}
