import { FlightOfferCard } from "@/components/planner/FlightOfferCard";
import type { FlightSearchSuccessResponse } from "@/schemas/flightSearchSchema";

type ChatFlightSearchBubbleProps = {
  result: FlightSearchSuccessResponse;
};

export function ChatFlightSearchBubble({ result }: ChatFlightSearchBubbleProps) {
  if (result.status === "no_offers") {
    return (
      <p className="text-sm text-muted-foreground">
        No cash offers were returned for this route and date. Try different dates
        or airports.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground">
        Found {result.offers.length} cash offer
        {result.offers.length === 1 ? "" : "s"} from Duffel (not points or awards).
      </p>
      <p className="text-xs text-muted-foreground">{result.dateFlexibilityNote}</p>
      <div className="scrollbar-thin max-h-[min(420px,50vh)] space-y-3 overflow-y-auto pr-1">
        {result.offers.slice(0, 8).map((offer) => (
          <FlightOfferCard key={offer.offerId} offer={offer} compact />
        ))}
      </div>
      {result.offers.length > 8 ? (
        <p className="text-xs text-muted-foreground">
          Showing 8 of {result.offers.length} offers in chat.
        </p>
      ) : null}
    </div>
  );
}
