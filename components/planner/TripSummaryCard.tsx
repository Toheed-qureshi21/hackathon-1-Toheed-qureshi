import { plannerSectionLabelClassName } from "@/lib/plannerFieldStyles";
import {
  CABIN_CLASS_LABELS,
  DATE_FLEXIBILITY_LABELS,
  JOURNEY_TYPE_LABELS,
  REWARD_PROGRAM_OPTIONS,
  type TripPlannerInput,
} from "@/schemas/tripPlannerSchema";
import { cn } from "@/lib/utils";
import Image from "next/image";

type TripSummaryCardProps = {
  tripInput: TripPlannerInput | null;
  className?: string;
};

function SummaryCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-planner-lg border border-border bg-surface-planner-input p-3">
      <p
        className={cn(
          plannerSectionLabelClassName,
          "normal-case tracking-wide text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="mt-1 font-heading text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function TripSummaryCard({ tripInput, className }: TripSummaryCardProps) {
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
              Trip summary
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {tripInput
                ? "Validated trip details — not searched or booked"
                : "Save the form to confirm your trip details"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            plannerSectionLabelClassName,
            "rounded-planner-sm bg-surface-planner-elevated px-2 py-1 text-muted-foreground",
          )}
        >
          {tripInput ? "Confirmed" : "Draft"}
        </span>
      </div>

      {!tripInput ? (
        <p className="rounded-planner-lg border border-dashed border-border bg-surface-planner-input/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Complete the trip and rewards form, then save to see a validated
          summary here.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryCell label="From" value={tripInput.origin} />
            <SummaryCell label="To" value={tripInput.destination} />
            <SummaryCell
              label="Journey"
              value={JOURNEY_TYPE_LABELS[tripInput.journeyType]}
            />
            <SummaryCell label="Departure" value={tripInput.departureDate} />
            <SummaryCell
              label="Return"
              value={tripInput.returnDate ?? "—"}
            />
            <SummaryCell
              label="Passengers"
              value={String(tripInput.passengerCount)}
            />
            <SummaryCell
              label="Cabin"
              value={CABIN_CLASS_LABELS[tripInput.cabinClass]}
            />
            <SummaryCell
              label="Flexibility"
              value={DATE_FLEXIBILITY_LABELS[tripInput.dateFlexibility]}
            />
          </div>

          {tripInput.rewards.length > 0 ? (
            <div className="mt-5 border-t border-border pt-4">
              <p
                className={cn(
                  plannerSectionLabelClassName,
                  "mb-3 normal-case text-muted-foreground",
                )}
              >
                Rewards accounts
              </p>
              <ul className="space-y-2 text-sm">
                {tripInput.rewards.map((entry, index) => {
                  const label =
                    REWARD_PROGRAM_OPTIONS.find((p) => p.id === entry.programId)
                      ?.label ?? entry.programId;
                  const balanceText =
                    entry.balanceStatus === "unknown"
                      ? "Balance unknown"
                      : `${entry.balancePoints?.toLocaleString()} pts (confirmed)`;
                  return (
                    <li
                      key={`${entry.programId}-${index}`}
                      className="flex justify-between gap-2 rounded-planner-md border border-border bg-surface-planner-input px-3 py-2"
                    >
                      <span className="text-foreground">{label}</span>
                      <span className="text-muted-foreground">{balanceText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {tripInput.monthlyPointsEstimate !== null &&
          tripInput.monthlyPointsEstimate !== undefined ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Estimated monthly earning (user-provided):{" "}
              <span className="font-semibold text-foreground">
                {tripInput.monthlyPointsEstimate.toLocaleString()} pts
              </span>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
