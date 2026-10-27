"use client";

import { Input } from "@/components/ui/Input";
import {
  authInputClassName,
  authInputWithToggleClassName,
} from "@/lib/authFieldStyles";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { InputHTMLAttributes } from "react";

type AuthIconInputProps = InputHTMLAttributes<HTMLInputElement> & {
  iconSrc: string;
  hasError?: boolean;
  withVisibilityToggleSpace?: boolean;
};

export function AuthIconInput({
  iconSrc,
  hasError = false,
  withVisibilityToggleSpace = false,
  className,
  ...props
}: AuthIconInputProps) {
  return (
    <div className="relative">
      <Image
        src={iconSrc}
        alt=""
        width={18}
        height={18}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 opacity-80"
      />
      <Input
        hasError={hasError}
        className={cn(
          authInputClassName,
          withVisibilityToggleSpace && authInputWithToggleClassName,
          className,
        )}
        {...props}
      />
    </div>
  );
}
