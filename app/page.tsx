import { ArbitrageTerminal } from "@/components/landing/ArbitrageTerminal";
import { FaqSection } from "@/components/landing/FaqSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { GlobalShowcaseSection } from "@/components/landing/GlobalShowcaseSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { MethodologySection } from "@/components/landing/MethodologySection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RedeemTrip — Travel smarter. Redeem better.",
  description:
    "Maximize your travel points and miles. RedeemTrip compares cash fares, credit card rewards, and airline loyalty options to identify high-yield flight redemptions.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Shared Site Navigation */}
      <SiteNavbar />

      {/* Main Landing Page Content */}
      <main className="w-full flex-1 pt-16">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Real-Time Valuation & Route Matrix (Arbitrage Terminal) */}
        <ArbitrageTerminal />

        {/* 3. Methodology & Workflow (3 Decisive Steps) */}
        <MethodologySection />

        {/* 4. Algorithmic Precision Features */}
        <FeaturesGrid />

        {/* 5. Global Rewards Holographic Showcase (BOM - LHR Corridor) */}
        <GlobalShowcaseSection />

        {/* 6. FAQ & Final Call to Action */}
        <FaqSection />
      </main>

      {/* Site Footer */}
      <SiteFooter />
    </div>
  );
}
