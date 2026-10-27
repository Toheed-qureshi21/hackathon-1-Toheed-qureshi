import { ChevronDownIcon } from "@/components/landing/LandingIcons";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Does RedeemTrip hold or access my credit card and loyalty passwords?",
    answer:
      "Never. RedeemTrip operates on read-only API handshakes or anonymous balance inputs. We do not initiate point transfers on your behalf or store banking login credentials. You are seamlessly handed off directly to official airline booking portals or Duffel's booking engine to finalize reservations.",
  },
  {
    question: "How is 'Cents Per Point' (CPP) and INR yield calculated?",
    answer:
      "We subtract mandatory taxes and carrier fuel surcharges from the lowest available cash retail ticket price for the identical route and cabin, then divide that net savings by the total reward points required. If a flight costs ₹58,400 in cash and you pay 42,000 pts + ₹8,200 taxes, your net savings of ₹50,200 yields ~1.20 INR (~1.44¢ USD) per point.",
  },
  {
    question: "Can I transfer points from Indian credit cards like HDFC, Axis, and Amex India?",
    answer:
      "Yes! RedeemTrip specifically models Indian loyalty programs alongside US, UK, and EU accounts. This includes transfer ratios for HDFC SmartBuy / Infinia, Axis Edge Rewards / Atlas, American Express India Membership Rewards, and SBI Card partners.",
  },
  {
    question: "What happens if an award seat disappears while I am transferring points?",
    answer:
      "Our real-time engine flags instant vs delayed transfer partners. We advise users on partner programs that offer 24-48 hour courtesy award seat holds (such as Flying Blue, Singapore KrisFlyer, and Virgin Atlantic) before initiating the final transfer from your bank.",
  },
];

export function FaqSection() {
  return (
    <section className="relative w-full bg-[#050913] py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-border/40">
      <div className="mx-auto max-w-4xl space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="font-heading text-xs font-semibold text-primary uppercase tracking-wider">
            Clarity &amp; Assurance
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Frequently Answered Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Everything you need to know about points safety, airline booking handoffs, and yield metrics.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-border bg-card p-5 sm:p-6 shadow-md transition-colors open:border-[#3b4968] open:bg-secondary/70 focus-within:ring-2 focus-within:ring-ring"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-base sm:text-lg font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none">
                <span>{faq.question}</span>
                <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#080d19] text-ai-blue transition-transform duration-200 group-open:rotate-180">
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="pt-4 text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        {/* Bottom Call to Action Banner */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              Ready to fly Business Class for the cost of Economy taxes?
            </h3>
            <p className="text-sm text-muted-foreground">
              Start planning your next trip and discover high-yield rewards optimization.
            </p>
          </div>
          <Link
            href="/planner"
            className="inline-flex shrink-0 items-center justify-center rounded-button bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_0_24px_rgba(199,243,107,0.3)] transition-all hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full md:w-auto"
          >
            Launch Search
          </Link>
        </div>
      </div>
    </section>
  );
}
