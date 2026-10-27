import {
  AiSparkleIcon,
  BoltIcon,
  ExternalLinkIcon,
  TicketIcon,
  WalletIcon,
} from "@/components/landing/LandingIcons";

export function MethodologySection() {
  return (
    <section
      id="how-it-works"
      className="relative w-full bg-background py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-border/40 scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-2">
          <div className="font-heading text-xs font-semibold text-primary uppercase tracking-wider">
            Methodology &amp; Workflow
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            High-Yield Redemptions in 3 Decisive Steps
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            From multi-program wallet sync to direct airline partner booking without leaving value on the table.
          </p>
        </div>

        {/* 3 Steps Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1 */}
          <div className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 sm:p-7 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-4xl font-bold text-primary/30">01</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-primary">
                  <WalletIcon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Input Journey &amp; Rewards
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Specify your origin, destination, and flexible travel windows. Securely link or manually state your points balances across Amex, Chase, Citi, Capital One, and global airline programs.
              </p>
            </div>

            {/* Micro Visual Element */}
            <div className="mt-6 rounded-lg border border-border/60 bg-[#080d19] p-3.5 space-y-2 font-heading text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Amex MR:</span>
                <span className="font-bold text-foreground">142,500</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Chase UR:</span>
                <span className="font-bold text-foreground">98,200</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Air India / Flying Blue:</span>
                <span className="font-bold text-foreground">64,000</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 sm:p-7 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-4xl font-bold text-primary/30">02</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-primary">
                  <AiSparkleIcon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                AI Copilot Valuation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our valuation terminal cross-references live seat inventory across Star Alliance, SkyTeam, and oneworld. It accounts for bonus transfer windows, surcharges, and real net yields.
              </p>
            </div>

            {/* Micro Visual Element: Simulated Engine Processing */}
            <div className="mt-6 rounded-lg border border-border/60 bg-[#080d19] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Transfer Analysis</span>
                <span className="font-heading font-semibold text-primary">+30% Amex &gt; Virgin Promo</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[84%] rounded-full bg-primary" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BoltIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  Arbitrage score: <strong className="text-foreground">94/100 Optimal</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 sm:p-7 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-4xl font-bold text-primary/30">03</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-primary">
                  <TicketIcon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                One-Click Booking Handoff
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Execute precise point transfers with step-by-step guides or direct deep-links. Transition directly into the airline award checkout or Duffel booking flow with zero guesswork.
              </p>
            </div>

            {/* Micro Visual Element */}
            <div className="mt-6 flex items-center justify-between rounded-lg border border-border/60 bg-[#080d19] p-3.5">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-foreground">Direct Award Deep-Link</div>
                <div className="text-[11px] text-ai-blue font-mono">virginatlantic.com/booking</div>
              </div>
              <ExternalLinkIcon className="h-5 w-5 text-primary shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
