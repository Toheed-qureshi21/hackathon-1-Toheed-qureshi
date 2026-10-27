"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

type PasswordStrengthIndicatorProps = {
  password: string;
};

type Rule = { id: string; label: string; met: (value: string) => boolean };

const rules: Rule[] = [
  { id: "length", label: "At least 8 characters", met: (v) => v.length >= 8 },
  { id: "number", label: "Contains a number", met: (v) => /\d/.test(v) },
  {
    id: "symbol",
    label: "Contains a symbol",
    met: (v) => /[^A-Za-z0-9]/.test(v),
  },
  { id: "upper", label: "Uppercase letter", met: (v) => /[A-Z]/.test(v) },
];

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const metCount = rules.filter((rule) => rule.met(password)).length;
  const width =
    password.length === 0
      ? "0%"
      : metCount <= 1
        ? "25%"
        : metCount === 2
          ? "50%"
          : metCount === 3
            ? "75%"
            : "100%";

  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-auth-input">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            metCount <= 1 && password.length > 0 && "bg-destructive",
            metCount === 2 && "bg-ai-blue",
            metCount >= 3 && "bg-primary",
          )}
          style={{ width }}
        />
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rules.map((rule) => {
          const met = rule.met(password);
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                met ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Image
                src="/icons/check.svg"
                alt=""
                width={14}
                height={14}
                aria-hidden
                className={cn("shrink-0", !met && "opacity-30 grayscale")}
              />
              {rule.label}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Visual guide only — account creation still requires at least 8
        characters.
      </p>
    </div>
  );
}
