"use client";

import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  REWARD_PROGRAM_OPTIONS,
  type TripPlannerInput,
} from "@/schemas/tripPlannerSchema";
import type {
  RewardsEvaluationSuccessResponse,
  UserRedemptionAssumption,
} from "@/schemas/rewardsEvaluationSchema";
import type { FlightSearchSuccessResponse } from "@/schemas/flightSearchSchema";
import { cn } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";

type AssumptionDraft = {
  programId: UserRedemptionAssumption["programId"] | "";
  pointsRequired: string;
  taxesAndFeesAmount: string;
  taxesAndFeesCurrency: string;
  source: UserRedemptionAssumption["source"];
};

const emptyDraft = (): AssumptionDraft => ({
  programId: "",
  pointsRequired: "",
  taxesAndFeesAmount: "",
  taxesAndFeesCurrency: "GBP",
  source: "user_supplied",
});

type RewardsEvaluationPanelProps = {
  tripInput: TripPlannerInput | null;
  flightSearch: FlightSearchSuccessResponse | null;
  evaluation: RewardsEvaluationSuccessResponse | null;
  isEvaluating: boolean;
  error: string | null;
  onEvaluate: (assumptions: UserRedemptionAssumption[]) => void;
  className?: string;
};

export function RewardsEvaluationPanel({
  tripInput,
  flightSearch,
  evaluation,
  isEvaluating,
  error,
  onEvaluate,
  className,
}: RewardsEvaluationPanelProps) {
  const [draft, setDraft] = useState<AssumptionDraft>(emptyDraft);
  const [assumptions, setAssumptions] = useState<UserRedemptionAssumption[]>(
    [],
  );

  const canEvaluate = Boolean(
    tripInput && flightSearch && flightSearch.offers.length > 0,
  );

  const programOptions = useMemo(
    () =>
      REWARD_PROGRAM_OPTIONS.filter((p) =>
        tripInput?.rewards.some((r) => r.programId === p.id),
      ),
    [tripInput],
  );

  const addAssumption = useCallback(() => {
    if (!draft.programId || !draft.pointsRequired.trim()) return;
    const points = Number.parseInt(draft.pointsRequired.replace(/\D/g, ""), 10);
    if (!Number.isFinite(points) || points <= 0) return;
    const next: UserRedemptionAssumption = {
      programId: draft.programId,
      pointsRequired: points,
      taxesAndFeesAmount: draft.taxesAndFeesAmount.trim() || "0",
      taxesAndFeesCurrency: draft.taxesAndFeesCurrency.trim().toUpperCase(),
      source: draft.source,
    };
    setAssumptions((prev) => {
      const filtered = prev.filter((a) => a.programId !== next.programId);
      return [...filtered, next];
    });
    setDraft(emptyDraft());
  }, [draft]);

  const removeAssumption = (programId: string) => {
    setAssumptions((prev) => prev.filter((a) => a.programId !== programId));
  };

  return (
    <section
      className={cn(
        "rounded-planner-xl border border-border bg-surface-planner-panel p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Rewards comparison
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Deterministic rules engine — not award search. Cash from Duffel;
            redemption numbers are yours unless marked verified elsewhere.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={!canEvaluate || isEvaluating}
          onClick={() => onEvaluate(assumptions)}
        >
          {isEvaluating ? "Evaluating…" : "Run comparison"}
        </Button>
      </div>

      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      {!tripInput ? (
        <p className="text-sm text-muted-foreground">
          Save the trip form before running a rewards comparison.
        </p>
      ) : null}

      {tripInput && (!flightSearch || flightSearch.offers.length === 0) ? (
        <p className="text-sm text-muted-foreground">
          Search cash flights first so the engine can rank real Duffel fares.
        </p>
      ) : null}

      {tripInput && programOptions.length > 0 ? (
        <div className="mt-4 rounded-planner-lg border border-dashed border-border p-4">
          <p className="text-xs font-medium text-foreground">
            Optional redemption assumption (not verified award inventory)
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="re-assumption-program">Program</Label>
              <select
                id="re-assumption-program"
                className="mt-1 w-full rounded-planner-md border border-border bg-surface-planner-input px-3 py-2 text-sm"
                value={draft.programId}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    programId: e.target.value as AssumptionDraft["programId"],
                  }))
                }
              >
                <option value="">Select…</option>
                {programOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="re-assumption-points">Points required</Label>
              <Input
                id="re-assumption-points"
                inputMode="numeric"
                value={draft.pointsRequired}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    pointsRequired: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <Label htmlFor="re-assumption-taxes">Taxes &amp; fees</Label>
              <Input
                id="re-assumption-taxes"
                value={draft.taxesAndFeesAmount}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    taxesAndFeesAmount: e.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
                placeholder="e.g. 120.00"
              />
            </div>
            <div>
              <Label htmlFor="re-assumption-currency">Currency</Label>
              <Input
                id="re-assumption-currency"
                maxLength={3}
                value={draft.taxesAndFeesCurrency}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    taxesAndFeesCurrency: e.target.value
                      .replace(/[^a-zA-Z]/g, "")
                      .toUpperCase(),
                  }))
                }
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="radio"
                checked={draft.source === "user_supplied"}
                onChange={() =>
                  setDraft((d) => ({ ...d, source: "user_supplied" }))
                }
              />
              User-supplied (unverified)
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="radio"
                checked={draft.source === "independently_verified"}
                onChange={() =>
                  setDraft((d) => ({
                    ...d,
                    source: "independently_verified",
                  }))
                }
              />
              Verified elsewhere by me
            </label>
            <Button type="button" variant="secondary" onClick={addAssumption}>
              Add assumption
            </Button>
          </div>
          {assumptions.length > 0 ? (
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {assumptions.map((a) => (
                <li
                  key={a.programId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-planner-md border border-border px-3 py-2"
                >
                  <span>
                    {REWARD_PROGRAM_OPTIONS.find((p) => p.id === a.programId)?.label}:{" "}
                    {a.pointsRequired.toLocaleString()} pts · {a.taxesAndFeesAmount}{" "}
                    {a.taxesAndFeesCurrency} · {a.source.replace("_", " ")}
                  </span>
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => removeAssumption(a.programId)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {evaluation ? (
        <div className="mt-6 space-y-4">
          <FormMessage variant="info">{evaluation.awardAvailabilityNote}</FormMessage>
          <p className="text-xs text-muted-foreground">
            {evaluation.tripContextSummary}
          </p>
          <p className="text-xs text-muted-foreground">
            {evaluation.responsibleUseNote}
          </p>

          {evaluation.cashOffersByCurrency.map((group) => (
            <div key={group.currency}>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Cash ranking ({group.currency})
              </h3>
              <p className="text-xs text-muted-foreground">
                {evaluation.cashRankingCriteria}
              </p>
              <ol className="mt-2 space-y-2">
                {group.rankedOffers.slice(0, 5).map((offer) => (
                  <li
                    key={offer.offerId}
                    className="rounded-planner-md border border-border bg-surface-planner-elevated px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-primary">#{offer.rank}</span>{" "}
                    {offer.totalAmount} {offer.totalCurrency} · {offer.sliceSummary}
                    {!offer.liveMode ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (test mode)
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ))}

          {evaluation.redemptionEvaluations.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Redemption comparisons (not confirmed awards)
              </h3>
              {evaluation.redemptionEvaluations.map((row) => (
                <div
                  key={row.programId}
                  className="rounded-planner-lg border border-border p-4 text-sm"
                >
                  <p className="font-heading font-semibold">{row.programLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.requirementProvenanceLabel}
                  </p>
                  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Balance</dt>
                      <dd>
                        {row.balanceStatus === "confirmed" && row.balancePoints !== null
                          ? `${row.balancePoints.toLocaleString()} (${row.balanceProvenance})`
                          : row.balanceStatus === "unknown"
                            ? "Unknown"
                            : "Not listed"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Shortfall</dt>
                      <dd>{row.shortfallExplanation}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Value per point</dt>
                      <dd>
                        {row.valuePerPointStatus === "calculated" && row.valuePerPoint
                          ? `${row.valuePerPoint} ${row.valuePerPointCurrency} per point — ${row.valuePerPointExplanation}`
                          : row.valuePerPointExplanation}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Earning timeline</dt>
                      <dd>
                        {row.earningTimelineStatus === "calculated" &&
                        row.earningTimelineMonths
                          ? `~${row.earningTimelineMonths} month(s) — ${row.earningTimelineExplanation}`
                          : row.earningTimelineExplanation}
                      </dd>
                    </div>
                  </dl>
                  {row.uncertaintyNotes.length > 0 ? (
                    <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                      {row.uncertaintyNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {evaluation.missingForFullComparison.length > 0 ? (
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Missing for a fuller comparison
              </h3>
              <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                {evaluation.missingForFullComparison.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
