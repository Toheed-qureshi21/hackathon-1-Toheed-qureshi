import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import type { TripDraft } from "@/schemas/plannerChat";

type TripSummaryCardProps = {
  draft: TripDraft;
};

function SummaryCell({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-[#111a2b] p-3.5">
      <p className="text-xs text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {value ?? "—"}
      </p>
    </div>
  );
}

function hasAnyDraftData(draft: TripDraft): boolean {
  return Object.values(draft).some((v) => v !== null && v !== "");
}

export function TripSummaryCard({ draft }: TripSummaryCardProps) {
  if (!hasAnyDraftData(draft)) {
    return null;
  }

  return (
    <Card className="mt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg text-foreground">Trip details</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Draft from your messages — not verified or searched
          </p>
        </div>
        <Pill className="normal-case">Trip draft</Pill>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCell label="From" value={draft.origin} />
        <SummaryCell label="To" value={draft.destination} />
        <SummaryCell label="Departure" value={draft.departureDate} />
        <SummaryCell label="Return" value={draft.returnDate} />
        <SummaryCell label="Passengers" value={draft.passengers} />
        <SummaryCell label="Cabin" value={draft.cabinClass} />
        <SummaryCell label="Rewards" value={draft.rewardsPrograms} />
        <SummaryCell label="Points / miles" value={draft.pointsOrMiles} />
      </div>
    </Card>
  );
}
