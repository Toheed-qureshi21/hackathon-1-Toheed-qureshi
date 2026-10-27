"use client";

import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { plannerSectionLabelClassName } from "@/lib/plannerFieldStyles";
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

  const canEvaluate = Boolean(tripInput);
  const hasCashOffers = Boolean(flightSearch && flightSearch.offers.length > 0);

  const programOptions = useMemo(
    () =>
      REWARD_PROGRAM_OPTIONS.filter((p) =>
        tripInput?.rewards.some((r) => r.programId === p.id),
      ),
    [tripInput],
  );

  const defaultTaxCurrency = useMemo(() => {
    const first = flightSearch?.offers[0]?.totalCurrency;
    return first?.toUpperCase() ?? "GBP";
  }, [flightSearch]);

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

  const accounts =
    evaluation?.rewardsAccounts ??
    tripInput?.rewards.map((entry) => {
      const meta = REWARD_PROGRAM_OPTIONS.find((p) => p.id === entry.programId);
      return {
        programId: entry.programId,
        programLabel: meta?.label ?? entry.programId,
        pointsUnitLabel: meta?.pointsLabel ?? "Points",
        balanceStatus: entry.balanceStatus,
        balancePoints: entry.balancePoints,
        balanceProvenance: "User-confirmed balance",
        hasRedemptionAssumption: false,
        comparisonNote:
          "Save and run comparison to refresh analysis with the latest trip data.",
      };
    }) ??
    [];

  const monthlyDisplay = evaluation?.monthlyPointsSummary ?? null;
  const monthlyFromTrip = tripInput?.monthlyPointsEstimate;

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
            Uses balances and monthly earning from your saved trip. Cash fares from
            Duffel. No live award search.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={!canEvaluate || isEvaluating}
          onClick={() => onEvaluate(assumptions)}
        >
          {isEvaluating ? "Updating…" : "Refresh analysis"}
        </Button>
      </div>

      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      {!tripInput ? (
        <p className="text-sm text-muted-foreground">
          Save the trip form to connect your rewards programs and balances here.
        </p>
      ) : null}

      {tripInput && accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add rewards programs on the trip form — we will show confirmed balances or
          unknown status here (not points required for a flight).
        </p>
      ) : null}

      {tripInput && accounts.length > 0 ? (
        <div className="space-y-4">
          <div>
            <p className={cn(plannerSectionLabelClassName, "text-muted-foreground")}>
              Your saved rewards (from trip form)
            </p>
            <ul className="mt-2 space-y-2">
              {accounts.map((account) => (
                <li
                  key={account.programId}
                  className="rounded-planner-md border border-border bg-surface-planner-elevated px-3 py-2.5 text-sm"
                >
                  <p className="font-heading font-semibold text-foreground">
                    {account.programLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="text-foreground">Points balance: </span>
                    {account.balanceStatus === "confirmed" &&
                    account.balancePoints !== null
                      ? `${account.balancePoints.toLocaleString()} ${account.pointsUnitLabel} · ${account.balanceProvenance}`
                      : account.balanceStatus === "unknown"
                        ? "Unknown · not treated as zero"
                        : "—"}
                  </p>
                  {"comparisonNote" in account ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {account.comparisonNote}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-planner-md border border-border bg-surface-planner-input px-3 py-2.5 text-sm">
            <p className={cn(plannerSectionLabelClassName, "text-muted-foreground")}>
              Monthly points earned (from trip form)
            </p>
            <p className="mt-1 text-foreground">
              {monthlyDisplay ? (
                monthlyDisplay.label
              ) : monthlyFromTrip !== null && monthlyFromTrip !== undefined ? (
                `${monthlyFromTrip.toLocaleString()} points/month (saved on trip form — refresh analysis to use in timelines)`
              ) : (
                "Not provided — add on the trip form if you want an estimated timeline after a shortfall."
              )}
            </p>
          </div>
        </div>
      ) : null}

      {evaluation ? (
        <FormMessage variant="info" className="mt-4">
          {evaluation.awardAvailabilityNote}
        </FormMessage>
      ) : tripInput ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Live award availability and official redemption prices are not available.
          Refresh analysis after saving trip changes or cash search.
        </p>
      ) : null}

      {!hasCashOffers && tripInput ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Search cash flights to rank Duffel fares by currency. Balances above already
          come from your saved trip.
        </p>
      ) : null}

      {tripInput && programOptions.length > 0 ? (
        <div className="mt-4 rounded-planner-lg border border-dashed border-border p-4">
          <p className="text-xs font-medium text-foreground">
            Optional: hypothetical redemption scenario
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter <strong className="font-normal text-foreground">points required</strong>{" "}
            and <strong className="font-normal text-foreground">taxes/fees</strong> for a
            specific redemption you want to model — not your account balance or monthly
            earning (those are already on the trip form).
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
                    taxesAndFeesCurrency:
                      d.taxesAndFeesCurrency || defaultTaxCurrency,
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
              <Label htmlFor="re-assumption-points">Points required for redemption</Label>
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
              <Label htmlFor="re-assumption-taxes">Redemption taxes &amp; fees (cash)</Label>
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
              <Label htmlFor="re-assumption-currency">Taxes/fees currency</Label>
              <Input
                id="re-assumption-currency"
                maxLength={3}
                value={draft.taxesAndFeesCurrency || defaultTaxCurrency}
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
              My estimate (unverified)
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
              Add scenario
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
                    {a.pointsRequired.toLocaleString()} pts required · {a.taxesAndFeesAmount}{" "}
                    {a.taxesAndFeesCurrency} taxes/fees
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
          <p className="text-xs text-muted-foreground">
            {evaluation.tripContextSummary}
          </p>

          {evaluation.cashOffersByCurrency.length > 0 ? (
            evaluation.cashOffersByCurrency.map((group) => (
              <div key={group.currency}>
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  Cash fares ({group.currency})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Lowest Duffel total price first — not award tickets.
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
                        <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                          Duffel test data
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            ))
          ) : null}

          {evaluation.redemptionEvaluations.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Hypothetical redemption vs cash (not a confirmed award)
              </h3>
              {evaluation.redemptionEvaluations.map((row) => (
                <div
                  key={row.programId}
                  className="rounded-planner-lg border border-border p-4 text-sm"
                >
                  <p className="font-heading font-semibold">{row.programLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.pointsRequired.toLocaleString()} points required ·{" "}
                    {row.taxesAndFeesAmount} {row.taxesAndFeesCurrency} taxes/fees ·{" "}
                    {row.requirementProvenanceLabel}
                  </p>
                  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Your balance (saved trip)</dt>
                      <dd>
                        {row.balanceStatus === "confirmed" && row.balancePoints !== null
                          ? `${row.balancePoints.toLocaleString()}`
                          : row.balanceStatus === "unknown"
                            ? "Unknown"
                            : "Not on trip form"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Shortfall vs points required</dt>
                      <dd>{row.shortfallExplanation}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Potential value per point</dt>
                      <dd>
                        {row.valuePerPointStatus === "calculated" && row.valuePerPoint
                          ? `${row.valuePerPoint} ${row.valuePerPointCurrency} per point — ${row.valuePerPointExplanation}`
                          : row.valuePerPointExplanation}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">
                        Timeline (uses monthly earning from trip form)
                      </dt>
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
                What is still needed
              </h3>
              <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                {evaluation.missingForFullComparison.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-[11px] text-muted-foreground/90">
            {evaluation.responsibleUseNote}
          </p>
        </div>
      ) : null}
    </section>
  );
}
