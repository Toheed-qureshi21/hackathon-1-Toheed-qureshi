import { Pill } from "@/components/ui/Pill";
import { SUGGESTED_PROMPTS } from "@/schemas/plannerChat";

type PlannerEmptyStateProps = {
  onSelectPrompt: (prompt: string) => void;
};

export function PlannerEmptyState({ onSelectPrompt }: PlannerEmptyStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center text-center">
      <Pill>Your AI travel copilot</Pill>
      <h1 className="mt-4 font-heading text-[clamp(1.75rem,4vw,2.25rem)] tracking-tight text-foreground">
        Where would you like your points to take you?
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Tell me where you want to go, and I&apos;ll help you find the smartest
        way to use your rewards.
      </p>
      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="rounded-card border border-border bg-secondary/60 px-4 py-4 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
