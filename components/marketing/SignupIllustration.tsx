import { Pill } from "@/components/ui/Pill";
import Image from "next/image";

export function SignupIllustration() {
  return (
    <div className="relative isolate min-h-[360px] overflow-hidden rounded-auth-panel border border-border bg-card md:min-h-[580px]">
      <Image
        src="/images/auth/signup-showcase.png"
        alt=""
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
        <div className="w-full max-w-md rounded-auth-panel border border-border bg-card/90 p-5 shadow-auth-panel backdrop-blur-md">
          <p className="mb-2 text-xs text-muted-foreground">
            Illustrative example — not live savings or availability data
          </p>
          <Pill className="normal-case">Rewards planning preview</Pill>
          <p className="mt-3 font-heading text-lg text-foreground">
            Plan smarter from day one
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            After you create an account, you&apos;ll be able to chat through
            trip details and connect rewards search in a later release.
          </p>
        </div>
      </div>
    </div>
  );
}
