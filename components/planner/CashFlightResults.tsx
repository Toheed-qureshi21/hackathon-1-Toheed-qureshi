"use client";

import { FlightOfferCard } from "@/components/planner/FlightOfferCard";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import type { FlightSearchSuccessResponse } from "@/schemas/flightSearchSchema";
import { cn } from "@/lib/utils";

type CashFlightResultsProps = {
  result: FlightSearchSuccessResponse | null;
  isSearching: boolean;
  error: string | null;
  canSearch: boolean;
  onSearch: () => void;
  className?: string;
};

export function CashFlightResults({
  result,
  isSearching,
  error,
  canSearch,
  onSearch,
  className,
}: CashFlightResultsProps) {
  return (
    <section
      className={cn(
        "rounded-planner-xl border border-border bg-surface-planner-panel p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Cash flight search
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Live cash fares from Duffel. Not award availability or points pricing.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={!canSearch || isSearching}
          onClick={onSearch}
        >
          {isSearching ? "Searching…" : "Search cash flights"}
        </Button>
      </div>

      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      {!canSearch ? (
        <p className="rounded-planner-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
          Save a valid trip, then choose origin and destination airports from the
          suggestions before searching.
        </p>
      ) : null}

      {result?.status === "no_offers" ? (
        <FormMessage variant="info" className="mt-3">
          No cash offers were returned for this route and date. Try different
          dates or airports.
        </FormMessage>
      ) : null}

      {result ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {result.dateFlexibilityNote}
        </p>
      ) : null}

      {result && result.offers.length > 0 ? (
        <div className="scrollbar-thin mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {result.offers.slice(0, 12).map((offer) => (
            <FlightOfferCard key={offer.offerId} offer={offer} />
          ))}
          {result.offers.length > 12 ? (
            <p className="text-center text-xs text-muted-foreground">
              Showing 12 of {result.offers.length} offers.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
