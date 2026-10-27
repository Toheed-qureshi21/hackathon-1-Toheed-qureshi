"use client";

import {
  FlightLandIcon,
  FlightTakeoffIcon,
  QueryStatsIcon,
  SwapIcon,
  WalletIcon,
} from "@/components/landing/LandingIcons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

type CabinFilter = "all" | "business" | "first";

interface RouteCardData {
  id: string;
  cabin: "business" | "first";
  tag: string;
  yieldTag: string;
  yieldHighlight: boolean;
  depTime: string;
  depAirport: string;
  duration: string;
  stopInfo: string;
  arrTime: string;
  arrAirport: string;
  cashFare: string;
  points: string;
  surcharges: string;
  savings: string;
  savingsPct: string;
  transferPartner: string;
}

const ROUTE_CARDS: RouteCardData[] = [
  {
    id: "virgin-bom-lhr",
    cabin: "business",
    tag: "Direct • Boeing 787-9",
    yieldTag: "Top Yield: 1.67 CPP",
    yieldHighlight: true,
    depTime: "02:40",
    depAirport: "BOM (T2)",
    duration: "9h 25m",
    stopInfo: "Non-stop",
    arrTime: "07:35",
    arrAirport: "LHR (T3)",
    cashFare: "₹58,400",
    points: "42,000 pts",
    surcharges: "+ ₹8,200",
    savings: "₹24,520",
    savingsPct: "42%",
    transferPartner: "Amex MR (1:1)",
  },
  {
    id: "emirates-bom-dxb-lhr",
    cabin: "business",
    tag: "1-Stop DXB • A380-800",
    yieldTag: "Yield: 1.42 CPP",
    yieldHighlight: false,
    depTime: "04:30",
    depAirport: "BOM (T2)",
    duration: "11h 40m",
    stopInfo: "2h 10m DXB",
    arrTime: "14:10",
    arrAirport: "LHR (T3)",
    cashFare: "₹64,200",
    points: "48,000 pts",
    surcharges: "+ ₹14,900",
    savings: "₹21,300",
    savingsPct: "33%",
    transferPartner: "Citi / HDFC",
  },
  {
    id: "qatar-bom-doh-lhr",
    cabin: "first",
    tag: "Qsuite Available • A350-1000",
    yieldTag: "Yield: 2.15 CPP",
    yieldHighlight: true,
    depTime: "04:10",
    depAirport: "BOM (T2)",
    duration: "10h 50m",
    stopInfo: "1h 45m DOH",
    arrTime: "13:00",
    arrAirport: "LHR (T4)",
    cashFare: "₹142,000",
    points: "65,000 pts",
    surcharges: "+ ₹18,400",
    savings: "₹78,600",
    savingsPct: "55%",
    transferPartner: "BA Avios Link",
  },
];

export function ArbitrageTerminal() {
  const [cabinFilter, setCabinFilter] = useState<CabinFilter>("all");

  const filteredCards = ROUTE_CARDS.filter((card) => {
    if (cabinFilter === "all") return true;
    return card.cabin === cabinFilter;
  });

  return (
    <section
      id="flight-search"
      className="relative w-full bg-[#050913] py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-border/40 scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="font-heading text-xs font-semibold text-primary uppercase tracking-wider">
              Arbitrage Terminal
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Real-Time Valuation &amp; Route Matrix
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Explore illustrative high-spread routes where loyalty transfers outperform retail flight expenditure.
            </p>
          </div>

          {/* Cabin Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setCabinFilter("all")}
              className={cn(
                "rounded px-3.5 py-1.5 text-xs font-heading font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                cabinFilter === "all"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All Cabins
            </button>
            <button
              type="button"
              onClick={() => setCabinFilter("business")}
              className={cn(
                "rounded px-3.5 py-1.5 text-xs font-heading font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                cabinFilter === "business"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Business Class
            </button>
            <button
              type="button"
              onClick={() => setCabinFilter("first")}
              className={cn(
                "rounded px-3.5 py-1.5 text-xs font-heading font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                cabinFilter === "first"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              First Class
            </button>
          </div>
        </div>

        {/* Quick Route Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-lg">
          {/* Origin */}
          <div className="flex flex-col space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Origin Hub
            </span>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-[#080d19] px-3.5 py-2.5">
              <FlightTakeoffIcon className="h-5 w-5 text-ai-blue shrink-0" />
              <div>
                <div className="font-heading text-sm font-bold text-foreground">BOM</div>
                <div className="text-xs text-muted-foreground">Mumbai, India</div>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="flex flex-col space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Destination
            </span>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-[#080d19] px-3.5 py-2.5">
              <FlightLandIcon className="h-5 w-5 text-ai-blue shrink-0" />
              <div>
                <div className="font-heading text-sm font-bold text-foreground">LHR</div>
                <div className="text-xs text-muted-foreground">London Heathrow, UK</div>
              </div>
            </div>
          </div>

          {/* Connected Balances */}
          <div className="flex flex-col space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Connected Balances
            </span>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-[#080d19] px-3.5 py-2.5">
              <WalletIcon className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="font-heading text-sm font-bold text-foreground">128,400 pts</div>
                <div className="text-xs text-primary">Amex + Chase + HDFC</div>
              </div>
            </div>
          </div>

          {/* Compute Action */}
          <div className="flex flex-col justify-end pt-1 md:pt-0">
            <Link
              href="/planner"
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-button bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(199,243,107,0.3)] transition-all hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <QueryStatsIcon className="h-4 w-4 shrink-0" />
              <span>Launch AI Planner</span>
            </Link>
          </div>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xl transition-all duration-200 hover:border-[#3b4968] hover:bg-secondary/70 hover:shadow-2xl"
            >
              <div className="space-y-4">
                {/* Card Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-[#080d19] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-ai-blue border border-border/50">
                    {card.tag}
                  </span>
                  <span
                    className={cn(
                      "rounded px-2.5 py-1 text-[11px] font-heading font-bold uppercase tracking-wider",
                      card.yieldHighlight
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-secondary text-foreground border border-border",
                    )}
                  >
                    {card.yieldTag}
                  </span>
                </div>

                {/* Route Times and Duration */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="font-heading text-2xl font-bold text-foreground">{card.depTime}</div>
                    <div className="text-xs text-muted-foreground">{card.depAirport}</div>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <span className="text-[11px] text-muted-foreground font-medium">{card.duration}</span>
                    <div className="relative my-1.5 h-[2px] w-20 bg-border">
                      <div
                        className={cn(
                          "absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full",
                          card.yieldHighlight ? "bg-primary" : "bg-ai-blue",
                        )}
                      />
                    </div>
                    <span className="text-[11px] text-ai-blue font-medium">{card.stopInfo}</span>
                  </div>

                  <div className="text-right">
                    <div className="font-heading text-2xl font-bold text-foreground">{card.arrTime}</div>
                    <div className="text-xs text-muted-foreground">{card.arrAirport}</div>
                  </div>
                </div>

                {/* Cash vs Points Breakdown Box */}
                <div className="space-y-2 rounded-lg border border-border/60 bg-[#080d19] p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cash Retail Fare</span>
                    <span className="font-heading text-muted-foreground line-through">{card.cashFare}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">Points Required</span>
                    <span className="font-heading text-lg font-bold text-foreground">{card.points}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Taxes &amp; Surcharges</span>
                    <span className="font-heading text-ai-blue">{card.surcharges}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Net Savings
                    </span>
                    <span className="font-heading text-sm font-bold text-primary">
                      {card.savings} ({card.savingsPct})
                    </span>
                  </div>
                </div>
              </div>

              {/* Transfer Footnote & Action */}
              <div className="flex items-center justify-between pt-5 border-t border-border/40 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <SwapIcon className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Transfer: <strong className="text-foreground">{card.transferPartner}</strong>
                  </span>
                </div>
                <Link
                  href="/planner"
                  className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-heading font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Plan with AI
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
