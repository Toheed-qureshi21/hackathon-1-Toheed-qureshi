import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode } from "react";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: ReactNode;
  error?: string;
};

export function Checkbox({
  className,
  label,
  error,
  id,
  ...props
}: CheckboxProps) {
  const inputId =
    id ?? (typeof label === "string" ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-start gap-2 text-[13px] text-muted-foreground"
      >
        <input
          id={inputId}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
          aria-invalid={error ? true : undefined}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
