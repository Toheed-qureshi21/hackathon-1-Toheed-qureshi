"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

type ConfirmPasswordMatchIndicatorProps = {
  password: string;
  confirmPassword: string;
};

export function ConfirmPasswordMatchIndicator({
  password,
  confirmPassword,
}: ConfirmPasswordMatchIndicatorProps) {
  if (confirmPassword.length === 0) {
    return null;
  }

  const matches = password === confirmPassword && confirmPassword.length > 0;

  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-1.5 text-xs",
        matches ? "text-primary" : "text-destructive",
      )}
      aria-live="polite"
    >
      <Image
        src={matches ? "/icons/check.svg" : "/icons/close.svg"}
        alt=""
        width={14}
        height={14}
        aria-hidden
      />
      {matches ? "Passwords match" : "Passwords do not match yet"}
    </div>
  );
}
