import { CheckDoubleIcon, GlobeIcon } from "@/components/landing/LandingIcons";
import Image from "next/image";
import Link from "next/link";

export function GlobalShowcaseSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-border/40">
      {/* Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(126,167,255,0.08)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Visual Display Box */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-[540px] rounded-2xl border border-border bg-[#020f1f] p-2 shadow-2xl">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image
                src="/images/landing/rewards-network.png"
                alt="Global financial rewards holographic network connecting Mumbai, London, Dubai, Tokyo and New York with illuminated flight and point arbitrage nodes"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020f1f]/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Narrative Column */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-ai-blue shadow-sm">
            <GlobeIcon className="h-4 w-4 text-primary" />
            <span>GLOBAL REWARDS MATRIX • MUMBAI &amp; LONDON CORRIDOR</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Unlock International Flight Arbitrage Across Global Alliances
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Indian travelers and global executives accumulate millions of loyalty points that expire or redeem at subpar valuations. RedeemTrip bridges Indian card ecosystems (HDFC Infinia, Axis Magnus, Amex Platinum) with international frequent flyer programs to multiply purchasing power by 4x to 6x.
          </p>

          {/* Node Status Checklist Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-foreground font-heading text-sm font-semibold">
                <CheckDoubleIcon className="h-4 w-4 text-primary shrink-0" />
                <span>Mumbai (BOM) → London (LHR)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Virgin Atlantic, British Airways, Qatar Qsuite, Emirates Skywards
              </p>
            </div>

            <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-foreground font-heading text-sm font-semibold">
                <CheckDoubleIcon className="h-4 w-4 text-primary shrink-0" />
                <span>Direct Bank Handshakes</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Instant 1:1 points transfers mapped with zero latency
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 rounded-button bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_0_20px_rgba(199,243,107,0.35)] transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>Explore Global Routes</span>
              <GlobeIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
