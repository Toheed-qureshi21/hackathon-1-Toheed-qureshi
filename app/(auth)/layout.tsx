import { SiteNavbar } from "@/components/layout/SiteNavbar";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNavbar />
      <div className="pt-16">{children}</div>
    </>
  );
}
