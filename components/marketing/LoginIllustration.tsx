import { Pill } from "@/components/ui/Pill";
import Image from "next/image";

export function LoginIllustration() {
  return (
    <div className="relative isolate min-h-[360px] overflow-hidden rounded-auth-panel border border-border bg-card md:min-h-[580px]">
      <Image
        src="/images/auth/login-showcase.png"
        alt=""
        fill
        className="object-cover opacity-70"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
        <div className="ml-auto w-full max-w-md rounded-auth-panel border border-border bg-card/90 p-5 shadow-auth-panel backdrop-blur-md">
          <p className="mb-2 text-xs text-muted-foreground">
            Illustrative example — not live flight or pricing data
          </p>
          <Pill className="normal-case">Sample redemption preview</Pill>
          <p className="mt-3 font-heading text-lg text-foreground">
            Compare cash and points side by side
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            See how RedeemTrip will help you weigh fares, taxes, and rewards
            balances when search is connected.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Example cash</p>
              <p className="mt-1 font-semibold text-foreground">—</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Example points</p>
              <p className="mt-1 font-semibold text-primary">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
