import {
  CalculatorIcon,
  NetworkHubIcon,
  RadarIcon,
  ReceiptIcon,
} from "@/components/landing/LandingIcons";

const FEATURES = [
  {
    icon: CalculatorIcon,
    title: "Fintech Precision",
    description:
      "True net calculations evaluate currency conversion, program transfer rates, and opportunity cost against standard benchmarks.",
    metric: "Yield formula: (Cash − Surcharges) / Points",
  },
  {
    icon: NetworkHubIcon,
    title: "Transfer Optimization",
    description:
      "Monitors monthly bank transfer bonuses (e.g. +25% Amex to Flying Blue) to stretch existing balances even further.",
    metric: "Over 24 live transfer bonuses mapped",
  },
  {
    icon: ReceiptIcon,
    title: "Surcharge Transparency",
    description:
      "Never get blindsided by unexpected carrier-imposed fuel fees. We clearly show cash outlays before transfer initiation.",
    metric: "Carrier fuel surcharges audited hourly",
  },
  {
    icon: RadarIcon,
    title: "Alert Watcher",
    description:
      "Real-time notifications the moment premium award inventory opens for London, Tokyo, Zurich, or New York.",
    metric: "Sub-second GDS webhook triggers",
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative w-full bg-[#050913] py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-border/40">
      <div className="mx-auto max-w-7xl space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <div className="font-heading text-xs font-semibold text-primary uppercase tracking-wider">
            Algorithmic Precision
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Engineered for Loyalty Power-Users
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Every nuance of seat releases, award categories, phantom availability, and excise fees factored in real time.
          </p>
        </div>

        {/* Features 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-md transition-all duration-200 hover:border-[#3b4968] hover:bg-secondary/70 hover:shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/80 bg-[#080d19] text-primary transition-colors group-hover:border-primary/50">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-5 border-t border-border/40 pt-3 text-xs font-heading font-medium text-ai-blue">
                  {feature.metric}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
