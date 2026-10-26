import { AuthHeader } from "@/components/layout/AuthHeader";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
