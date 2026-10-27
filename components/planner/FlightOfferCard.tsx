import { plannerSectionLabelClassName } from "@/lib/plannerFieldStyles";
import type { NormalizedCashFlightOffer } from "@/schemas/flightSearchSchema";
import { cn } from "@/lib/utils";

export function formatOfferMoney(amount: string, currency: string) {
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatOfferDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type FlightOfferCardProps = {
  offer: NormalizedCashFlightOffer;
  compact?: boolean;
};

export function FlightOfferCard({ offer, compact = false }: FlightOfferCardProps) {
  const primarySegment = offer.slices[0]?.segments[0];
  return (
    <article
      className={cn(
        "rounded-planner-lg border border-border bg-surface-planner-input",
        compact ? "p-3" : "p-4",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "font-heading font-semibold text-foreground",
              compact ? "text-base" : "text-lg",
            )}
          >
            {formatOfferMoney(offer.totalAmount, offer.totalCurrency)}
          </p>
          <p className="text-xs text-muted-foreground">Cash fare · not points</p>
        </div>
        <span
          className={cn(
            plannerSectionLabelClassName,
            "rounded-planner-sm px-2 py-1 normal-case tracking-wide",
            offer.liveMode
              ? "bg-primary/15 text-primary"
              : "bg-ai-blue/15 text-ai-blue",
          )}
        >
          {offer.liveMode ? "Live mode" : "Test mode"}
        </span>
      </div>

      {primarySegment ? (
        <p className="mt-2 text-sm font-semibold text-foreground">
          Operated by {primarySegment.operatingCarrierName}
        </p>
      ) : null}

      {offer.slices.map((slice, sliceIndex) => (
        <div key={`${offer.offerId}-slice-${sliceIndex}`} className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {sliceIndex === 0 ? "Outbound" : "Return"} · {slice.originCode} →{" "}
            {slice.destinationCode}
            {slice.stopsCount > 0 ? ` · ${slice.stopsCount} stop(s)` : " · Non-stop"}
          </p>
          {slice.segments.map((segment, segmentIndex) => (
            <div
              key={`${offer.offerId}-seg-${segmentIndex}`}
              className="rounded-planner-md border border-border/70 bg-surface-planner-panel/60 px-3 py-2 text-sm"
            >
              <p className="font-medium text-foreground">
                {segment.operatingCarrierName}
                {segment.marketingCarrierIata && segment.marketingFlightNumber
                  ? ` · ${segment.marketingCarrierIata} ${segment.marketingFlightNumber}`
                  : null}
              </p>
              <p className="mt-1 text-muted-foreground">
                {formatOfferDateTime(segment.departingAt)} →{" "}
                {formatOfferDateTime(segment.arrivingAt)}
              </p>
            </div>
          ))}
        </div>
      ))}
    </article>
  );
}
