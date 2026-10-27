import { Pill } from "@/components/ui/Pill";
import { plannerWorkspaceTitleClassName } from "@/lib/plannerFieldStyles";
import { SUGGESTED_PROMPTS } from "@/schemas/plannerChat";
import { cn } from "@/lib/utils";

type PlannerEmptyStateProps = {
  onSelectPrompt: (prompt: string) => void;
};

export function PlannerEmptyState({ onSelectPrompt }: PlannerEmptyStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center text-center">
      <Pill>Your AI travel copilot</Pill>
      <h1 className={cn("mt-4", plannerWorkspaceTitleClassName)}>
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
            className="rounded-planner-xl border border-border bg-surface-planner-panel/80 px-4 py-4 text-left text-sm text-foreground transition-colors hover:border-ai-blue/40 hover:bg-surface-planner-elevated focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring-planner/30"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
