import { Pill } from "@/components/ui/Pill";

export function AuthIllustration() {
  return (
    <div className="grid h-full min-h-[360px] place-items-center rounded-auth-visual border border-border bg-[radial-gradient(ellipse_at_50%_35%,#263957_0%,#111a2c_48%,#0a0e18_78%)] p-8 md:min-h-[540px]">
      <div
        className="w-full max-w-[420px] -rotate-2 rounded-panel border border-panel-border bg-card/95 p-[22px] shadow-auth-panel"
        aria-hidden
      >
        <p className="mb-2 text-xs text-muted-foreground">
          Illustrative example — not live flight or pricing data
        </p>
        <Pill>SMART REDEMPTION FOUND</Pill>
        <div className="my-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Mumbai → London</p>
            <h3 className="font-heading text-lg text-foreground">
              One great journey.
            </h3>
          </div>
          <p className="font-heading text-[28px] font-bold text-primary">
            −42%
          </p>
        </div>
        <div className="border-t border-border pt-[18px]">
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Cash fare</span>
            <strong className="text-foreground">₹58,400</strong>
          </div>
          <div className="mt-3 flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Points + taxes</span>
            <strong className="text-primary">42,000 pts + ₹8,200</strong>
          </div>
        </div>
        <p className="mt-[18px] text-xs text-muted-foreground">
          Your points. Put to better use.
        </p>
      </div>
    </div>
  );
}
