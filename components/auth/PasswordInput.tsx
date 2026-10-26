"use client";

import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

type PasswordInputProps = {
  id?: string;
  name: string;
  placeholder?: string;
  hasError?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  "aria-describedby"?: string;
};

export function PasswordInput({
  id: idProp,
  name,
  placeholder,
  hasError,
  autoComplete,
  disabled,
  "aria-describedby": ariaDescribedBy,
}: PasswordInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        hasError={hasError}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        className="pr-16"
      />
      <button
        type="button"
        className={cn(
          "absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
        )}
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-controls={id}
        aria-label={visible ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
