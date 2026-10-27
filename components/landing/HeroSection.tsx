import {
  ArrowRightIcon,
  CheckVerifiedIcon,
  FlightTakeoffIcon,
  PlayIcon,
} from "@/components/landing/LandingIcons";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-border/40">
      {/* Ambient Atmospheric Glows */}
      <div
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[340px] w-[700px] rounded-full bg-primary/10 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-ai-blue/10 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left Copy Column */}
          <div className="flex w-full flex-col items-start lg:w-1/2 space-y-6">
            {/* Status / Engine Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-foreground shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Next-Gen Aviation Yield Engine</span>
              <span className="text-muted-foreground/60">/</span>
              <span className="font-heading font-medium text-ai-blue">v4.8 Core</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              Make Every Point Take You Further.
            </h1>

            {/* Supporting Copy */}
            <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              RedeemTrip compares cash fares, credit card points, airline miles, loyalty programs, and taxes to pinpoint high-yield flight redemptions in seconds.
            </p>

            {/* CTA Cluster */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/planner"
                className="inline-flex items-center justify-center gap-2 rounded-button bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_0_24px_rgba(199,243,107,0.35)] transition-all hover:brightness-105 hover:shadow-[0_0_32px_rgba(199,243,107,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-auto"
              >
                <span>Plan My Trip</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-button border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-auto"
              >
                <PlayIcon className="h-5 w-5 text-ai-blue" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Micro Metrics Bar */}
            <div className="w-full pt-4">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-lg border border-border/80 bg-[#0b1120] p-3.5 sm:p-4">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tracked Programs
                  </div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-foreground mt-1">
                    140+
                  </div>
                  <div className="text-xs text-ai-blue mt-0.5 hidden sm:block">
                    Alliances & Banks
                  </div>
                </div>

                <div className="rounded-lg border border-border/80 bg-[#0b1120] p-3.5 sm:p-4">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Average Yield
                  </div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-primary mt-1">
                    2.84 CPP
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    vs 1.1¢ standard
                  </div>
                </div>

                <div className="rounded-lg border border-border/80 bg-[#0b1120] p-3.5 sm:p-4">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Surcharge Engine
                  </div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-foreground mt-1">
                    100% Net
                  </div>
                  <div className="text-xs text-ai-blue mt-0.5 hidden sm:block">
                    Zero hidden fees
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/70">
                * Illustrative benchmarks based on frequent flyer program valuations.
              </p>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="relative w-full lg:w-1/2 flex items-center justify-center pt-4 lg:pt-0 pb-16 sm:pb-12 lg:pb-8">
            {/* Window Frame Container */}
            <div className="relative w-full max-w-[540px] aspect-[4/3] rounded-[32px] sm:rounded-[44px] overflow-hidden border border-border bg-[#020f1f] p-2 shadow-2xl">
              <div className="relative w-full h-full rounded-[24px] sm:rounded-[36px] overflow-hidden">
                <Image
                  src="/images/landing/hero-flight-window.png"
                  alt="Twilight view of aircraft wing soaring over London and European city lights through an executive aircraft cabin window"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                {/* Ambient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020f1f]/80 via-transparent to-[#020f1f]/30 pointer-events-none" />

                {/* Top Left Floating Tag */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 rounded-full border border-border/80 bg-[#020f1f]/85 px-3 py-1 backdrop-blur-md flex items-center gap-2 shadow-md">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-heading text-[11px] font-semibold tracking-wider text-foreground uppercase">
                    FLIGHT RADAR • BOM &gt; LHR
                  </span>
                </div>

                {/* Top Right Cabin Tag */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-full border border-border/80 bg-[#020f1f]/85 px-3 py-1 backdrop-blur-md text-ai-blue font-heading text-[11px] font-medium shadow-md">
                  Club World / J-Class
                </div>
              </div>
            </div>

            {/* Floating Live Valuation HUD Card */}
            <div className="absolute -bottom-8 sm:-bottom-4 left-2 right-2 sm:left-auto sm:right-4 max-w-md w-auto rounded-xl border border-border bg-card/95 p-4 sm:p-5 backdrop-blur-xl shadow-2xl space-y-3 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-heading font-bold text-sm text-foreground">
                  <span className="rounded bg-[#020f1f] px-2 py-0.5 border border-border/60">BOM</span>
                  <FlightTakeoffIcon className="h-4 w-4 text-primary" />
                  <span className="rounded bg-[#020f1f] px-2 py-0.5 border border-border/60">LHR</span>
                </div>
                <span className="rounded bg-primary/20 border border-primary/40 px-2 py-0.5 font-heading text-xs font-bold uppercase tracking-wider text-primary">
                  -42% Net Cost
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg bg-[#020f1f] p-2.5 border border-border/50">
                  <div className="text-[11px] text-muted-foreground">Retail Cash Fare</div>
                  <div className="font-heading text-lg font-bold text-foreground tracking-tight">₹58,400</div>
                  <div className="text-[10px] text-destructive">Standard Checkout</div>
                </div>
                <div className="rounded-lg bg-[#020f1f] p-2.5 border border-primary/30">
                  <div className="text-[11px] font-semibold text-primary">Optimized Points Deal</div>
                  <div className="font-heading text-lg font-bold text-primary tracking-tight">42k pts</div>
                  <div className="text-[10px] text-muted-foreground">+ ₹8,200 taxes &amp; fees</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <CheckVerifiedIcon className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Yield: <strong className="font-heading font-semibold text-foreground">1.39 INR/pt</strong> (~1.67 CPP)
                  </span>
                </div>
                <span className="font-heading text-[11px] text-ai-blue font-medium">
                  Virgin Atlantic via Amex
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
