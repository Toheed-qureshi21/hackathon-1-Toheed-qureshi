import { plannerSectionLabelClassName } from "@/lib/plannerFieldStyles";
import type { TripDraft } from "@/schemas/plannerChat";
import { cn } from "@/lib/utils";
import Image from "next/image";

type TripSummaryCardProps = {
  draft: TripDraft;
  className?: string;
};

function SummaryCell({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-planner-lg border border-border bg-surface-planner-input p-3">
      <p className={cn(plannerSectionLabelClassName, "normal-case tracking-wide text-muted-foreground")}>
        {label}
      </p>
      <p className="mt-1 font-heading text-sm font-semibold text-foreground">
        {value ?? "—"}
      </p>
    </div>
  );
}

function hasAnyDraftData(draft: TripDraft): boolean {
  return Object.values(draft).some((v) => v !== null && v !== "");
}

export function TripSummaryCard({ draft, className }: TripSummaryCardProps) {
  const hasData = hasAnyDraftData(draft);

  return (
    <div
      className={cn(
        "rounded-planner-xl border border-border bg-surface-planner-panel p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/settings.svg"
            alt=""
            width={18}
            height={18}
            className="opacity-80"
            aria-hidden
          />
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Active planner parameters
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Draft from your messages — not verified or searched
            </p>
          </div>
        </div>
        <span
          className={cn(
            plannerSectionLabelClassName,
            "rounded-planner-sm bg-surface-planner-elevated px-2 py-1 text-muted-foreground",
          )}
        >
          Trip draft
        </span>
      </div>

      {!hasData ? (
        <p className="rounded-planner-lg border border-dashed border-border bg-surface-planner-input/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Share origin, destination, dates, and rewards in chat to build a draft
          here.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <SummaryCell label="From" value={draft.origin} />
          <SummaryCell label="To" value={draft.destination} />
          <SummaryCell label="Departure" value={draft.departureDate} />
          <SummaryCell label="Return" value={draft.returnDate} />
          <SummaryCell label="Passengers" value={draft.passengers} />
          <SummaryCell label="Cabin" value={draft.cabinClass} />
          <SummaryCell label="Rewards" value={draft.rewardsPrograms} />
          <SummaryCell label="Points / miles" value={draft.pointsOrMiles} />
        </div>
      )}
    </div>
  );
}
