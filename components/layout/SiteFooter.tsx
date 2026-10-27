import { Logo } from "@/components/branding/Logo";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-[#080b14] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand Column */}
        <div className="flex flex-col items-center md:items-start space-y-2 text-center md:text-left">
          <Logo className="text-xl" />
          <p className="text-xs text-muted-foreground">
            Travel smarter. Redeem better. Make your points and miles go further.
          </p>
        </div>

        {/* Links Navigation */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-6 text-xs font-heading font-medium text-muted-foreground"
        >
          <a
            href="#flight-search"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Route Matrix
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            How It Works
          </a>
          <Link
            href="/planner"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            AI Planner
          </Link>
          <Link
            href="/login"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Sign up
          </Link>
        </nav>

        {/* Status & Copyright */}
        <div className="flex flex-col items-center md:items-end text-xs text-muted-foreground/80 space-y-1">
          <div className="flex items-center gap-1.5 font-heading">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Operational &bull; Live Inventory</span>
          </div>
          <div>&copy; 2026 RedeemTrip. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
