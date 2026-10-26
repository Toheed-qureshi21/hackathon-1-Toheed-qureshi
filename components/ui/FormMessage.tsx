import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type FormMessageVariant = "error" | "info";

export type FormMessageProps = HTMLAttributes<HTMLParagraphElement> & {
  variant?: FormMessageVariant;
};

const variantClasses: Record<FormMessageVariant, string> = {
  error: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-border bg-secondary text-muted-foreground",
};

export function FormMessage({
  className,
  variant = "error",
  role = "alert",
  ...props
}: FormMessageProps) {
  return (
    <p
      role={role}
      className={cn(
        "rounded-input border px-3 py-2 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
