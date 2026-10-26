import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-[11px] font-heading text-2xl font-bold text-foreground",
        className,
      )}
    >
      <Image
        src="/brand/logo.svg"
        alt=""
        width={38}
        height={38}
        priority
        aria-hidden
      />
      <span>
        Redeem<span className="text-primary">Trip</span>
      </span>
    </Link>
  );
}
