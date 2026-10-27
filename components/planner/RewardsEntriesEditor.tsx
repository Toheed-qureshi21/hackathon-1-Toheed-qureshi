"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { plannerSectionLabelClassName } from "@/lib/plannerFieldStyles";
import {
  REWARD_PROGRAM_OPTIONS,
  type TripPlannerFormValues,
} from "@/schemas/tripPlannerSchema";
import { cn } from "@/lib/utils";

type RewardsEntriesEditorProps = {
  rewards: TripPlannerFormValues["rewards"];
  fieldErrors: Record<string, string | undefined>;
  disabled?: boolean;
  onChange: (rewards: TripPlannerFormValues["rewards"]) => void;
};

export function RewardsEntriesEditor({
  rewards,
  fieldErrors,
  disabled = false,
  onChange,
}: RewardsEntriesEditorProps) {
  function updateEntry(
    index: number,
    patch: Partial<TripPlannerFormValues["rewards"][number]>,
  ) {
    onChange(
      rewards.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  }

  function addEntry() {
    onChange([
      ...rewards,
      {
        programId: "iberia",
        balanceStatus: "unknown",
        balanceUnknown: true,
        balancePoints: "",
      },
    ]);
  }

  function removeEntry(index: number) {
    onChange(rewards.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          Rewards balances
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Select programs or products you hold. These are initial options to
          investigate — not all programs transfer points to one another. Enter
          balances you have confirmed; use unknown when you are not sure.
        </p>
      </div>

      {rewards.length === 0 ? (
        <p className="rounded-planner-lg border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
          Add at least one rewards account you want considered for this trip.
        </p>
      ) : null}

      <ul className="space-y-4">
        {rewards.map((entry, index) => {
          const programLabel =
            REWARD_PROGRAM_OPTIONS.find((p) => p.id === entry.programId)
              ?.label ?? entry.programId;
          const balanceError = fieldErrors[`rewards.${index}.balancePoints`];

          return (
            <li
              key={`${entry.programId}-${index}`}
              className="rounded-planner-lg border border-border bg-surface-planner-input p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <p className={cn(plannerSectionLabelClassName, "normal-case")}>
                  Account {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-2 py-1 text-xs"
                  disabled={disabled}
                  onClick={() => removeEntry(index)}
                >
                  Remove
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor={`reward-program-${index}`}>Program / product</Label>
                  <Select
                    id={`reward-program-${index}`}
                    disabled={disabled}
                    value={entry.programId}
                    onChange={(e) =>
                      updateEntry(index, {
                        programId: e.target
                          .value as TripPlannerFormValues["rewards"][number]["programId"],
                      })
                    }
                  >
                    {REWARD_PROGRAM_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Points currency:{" "}
                    {
                      REWARD_PROGRAM_OPTIONS.find((p) => p.id === entry.programId)
                        ?.pointsLabel
                    }
                  </p>
                </div>

                <div className="grid gap-1.5 sm:col-span-2">
                  <Checkbox
                    id={`reward-unknown-${index}`}
                    label="I don't know my current balance"
                    checked={entry.balanceUnknown}
                    disabled={disabled}
                    onChange={(e) =>
                      updateEntry(index, {
                        balanceUnknown: e.target.checked,
                        balancePoints: e.target.checked ? "" : entry.balancePoints,
                        balanceStatus: e.target.checked ? "unknown" : "confirmed",
                      })
                    }
                  />
                </div>

                {!entry.balanceUnknown ? (
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor={`reward-balance-${index}`}>
                      Confirmed balance ({programLabel})
                    </Label>
                    <Input
                      id={`reward-balance-${index}`}
                      inputMode="numeric"
                      disabled={disabled}
                      placeholder="e.g. 68500"
                      hasError={Boolean(balanceError)}
                      value={entry.balancePoints}
                      onChange={(e) =>
                        updateEntry(index, {
                          balancePoints: e.target.value.replace(/\D/g, ""),
                          balanceStatus: "confirmed",
                        })
                      }
                      aria-describedby={
                        balanceError ? `reward-balance-${index}-error` : undefined
                      }
                    />
                    {balanceError ? (
                      <p
                        id={`reward-balance-${index}-error`}
                        className="text-xs text-destructive"
                        role="alert"
                      >
                        {balanceError}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Enter 0 only if you have confirmed zero points in this
                        program.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        variant="secondary"
        disabled={disabled || rewards.length >= 10}
        onClick={addEntry}
      >
        Add rewards account
      </Button>
    </div>
  );
}
