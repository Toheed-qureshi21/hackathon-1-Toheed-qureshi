"use client";

import { Input } from "@/components/ui/Input";
import {
  authInputClassName,
  authInputWithToggleClassName,
} from "@/lib/authFieldStyles";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { InputHTMLAttributes } from "react";
import { useId, useState } from "react";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  name: string;
  hasError?: boolean;
  auth?: boolean;
};

export function PasswordInput({
  id: idProp,
  name,
  placeholder,
  hasError,
  autoComplete,
  disabled,
  auth = false,
  "aria-describedby": ariaDescribedBy,
  onChange,
  className,
  ...rest
}: PasswordInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {auth ? (
        <Image
          src="/icons/wallet.svg"
          alt=""
          width={18}
          height={18}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 opacity-80"
        />
      ) : null}
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        hasError={hasError}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        onChange={onChange}
        className={cn(
          auth && authInputClassName,
          auth && authInputWithToggleClassName,
          !auth && "pr-16",
          auth && "pr-16",
          className,
        )}
        {...rest}
      />
      <button
        type="button"
        className={cn(
          "absolute top-1/2 right-3 z-10 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-[3px]",
          auth
            ? "focus-visible:ring-ring-auth/30"
            : "focus-visible:ring-ring/25",
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
