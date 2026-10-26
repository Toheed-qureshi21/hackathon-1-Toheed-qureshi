import { PlannerChat } from "@/components/planner/PlannerChat";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Plan your trip",
  description:
    "Chat with the RedeemTrip assistant to plan travel and use your rewards smarter.",
};

function PlannerLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background text-muted-foreground"
      aria-busy="true"
    >
      Loading planner…
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<PlannerLoading />}>
      <PlannerChat />
    </Suspense>
  );
}
