import { Logo } from "@/components/branding/Logo";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AuthFormPanelProps = {
  children: ReactNode;
  className?: string;
};

export function AuthFormPanel({ children, className }: AuthFormPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-auth-panel border border-border bg-surface-auth-panel p-8 shadow-xl sm:p-10",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-32 -left-32 size-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="mb-8">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
