import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Label } from "./Label";

export type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  error,
  children,
  className,
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("grid gap-[7px] py-[15px]", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function formFieldDescribedBy(error?: string, id?: string): string | undefined {
  if (!error || !id) return undefined;
  return `${id}-error`;
}
