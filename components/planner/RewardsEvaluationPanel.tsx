"use client";

import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  formatMonthlyEarningDisplay,
  formatSavedBalanceDisplay,
} from "@/lib/rewards/display-labels";
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
import { formatOfferMoney } from "@/components/planner/FlightOfferCard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

function ModeledPriceCompare({
  cashAmount,
  cashCurrency,
  outOfPocketAmount,
  outOfPocketCurrency,
  pointsCoversScenario,
}: {
  cashAmount: string;
  cashCurrency: string;
  outOfPocketAmount: string;
  outOfPocketCurrency: string;
  pointsCoversScenario: boolean;
}) {
  const cashLabel = formatOfferMoney(cashAmount, cashCurrency);
  const oopLabel = formatOfferMoney(outOfPocketAmount, outOfPocketCurrency);

  return (
    <div className="mt-4 rounded-planner-lg border border-border bg-background/50 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Modeled fare comparison
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className="font-heading text-2xl font-bold text-red-400 line-through decoration-red-400 decoration-2"
          aria-label={`Cash fare ${cashLabel}`}
        >
          {cashLabel}
        </span>
        <span className="text-lg text-muted-foreground" aria-hidden>
          →
        </span>
        <span className="font-heading text-2xl font-bold text-primary">
          {oopLabel}
        </span>
        <span className="text-sm font-medium text-muted-foreground">+ points</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {pointsCoversScenario
          ? "Strikethrough is lowest Duffel cash. Highlighted amount is taxes/fees only for your scenario (hypothetical award)."
          : "Strikethrough is cash fare. Highlighted amount is taxes/fees if you had enough points for this scenario."}
      </p>
    </div>
  );
}

type AssumptionDraft = {
  programId: UserRedemptionAssumption["programId"] | "";
  pointsRequired: string;
  taxesAndFeesAmount: string;
  taxesAndFeesCurrency: string;
  source: UserRedemptionAssumption["source"];
};

type RewardsEvaluationPanelProps = {
  tripInput: TripPlannerInput | null;
  flightSearch: FlightSearchSuccessResponse | null;
  evaluation: RewardsEvaluationSuccessResponse | null;
  isEvaluating: boolean;
  error: string | null;
  onEvaluate: (assumptions: UserRedemptionAssumption[]) => void;
  className?: string;
};

const TRIP_FORM_REWARDS_HASH = "#planner-trip-form";

export function RewardsEvaluationPanel({
  tripInput,
  flightSearch,
  evaluation,
  isEvaluating,
  error,
  onEvaluate,
  className,
}: RewardsEvaluationPanelProps) {
  const [assumptions, setAssumptions] = useState<UserRedemptionAssumption[]>([]);
  const [showScenarioForm, setShowScenarioForm] = useState(true);

  const defaultProgramId = tripInput?.rewards[0]?.programId ?? "";
  const defaultTaxCurrency =
    flightSearch?.offers[0]?.totalCurrency.toUpperCase() ?? "GBP";

  const [draft, setDraft] = useState<AssumptionDraft>({
    programId: "",
    pointsRequired: "",
    taxesAndFeesAmount: "",
    taxesAndFeesCurrency: "GBP",
    source: "user_supplied",
  });

  const openScenarioForm = useCallback(() => {
    setDraft({
      programId: (defaultProgramId || "") as AssumptionDraft["programId"],
      pointsRequired: "",
      taxesAndFeesAmount: "",
      taxesAndFeesCurrency: defaultTaxCurrency,
      source: "user_supplied",
    });
    setShowScenarioForm(true);
  }, [defaultProgramId, defaultTaxCurrency]);

  const programOptions = useMemo(
    () =>
      REWARD_PROGRAM_OPTIONS.filter((p) =>
        tripInput?.rewards.some((r) => r.programId === p.id),
      ),
    [tripInput],
  );

  const savedAccounts = useMemo(() => {
    if (!tripInput?.rewards.length) return [];
    return tripInput.rewards.map((entry) => {
      const meta = REWARD_PROGRAM_OPTIONS.find((p) => p.id === entry.programId);
      return {
        programId: entry.programId,
        programLabel: meta?.label ?? entry.programId,
        pointsUnitLabel: meta?.pointsLabel ?? "Points",
        balanceDisplay: formatSavedBalanceDisplay(entry, meta?.pointsLabel ?? "Points"),
        balanceStatus: entry.balanceStatus,
        balancePoints: entry.balancePoints,
      };
    });
  }, [tripInput]);

  const monthlyDisplay =
    evaluation?.monthlyPointsSummary.status === "provided"
      ? formatMonthlyEarningDisplay(
          evaluation.monthlyPointsSummary.monthlyPointsEarned,
        )
      : formatMonthlyEarningDisplay(tripInput?.monthlyPointsEstimate);

  const primary = evaluation?.primaryComparison ?? null;
  const redemptionRow = evaluation?.redemptionEvaluations[0] ?? null;
  const hasCashSearch = Boolean(flightSearch && flightSearch.offers.length > 0);

  const addScenarioAndRefresh = useCallback(() => {
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
    const merged = [
      ...assumptions.filter((a) => a.programId !== next.programId),
      next,
    ];
    setAssumptions(merged);
    setShowScenarioForm(false);
    onEvaluate(merged);
  }, [assumptions, draft, onEvaluate]);

  const canEvaluate = Boolean(tripInput);
  const showInlineScenario = hasCashSearch && !redemptionRow;
  const primaryAccount = savedAccounts[0] ?? null;

  const modeledPriceCompare = useMemo(() => {
    if (!redemptionRow) return null;
    const cashAmount =
      redemptionRow.comparedCashFareAmount ?? primary?.lowestCashAmount ?? null;
    const cashCurrency =
      redemptionRow.comparedCashFareCurrency ?? primary?.lowestCashCurrency ?? null;
    if (!cashAmount || !cashCurrency) return null;
    return {
      cashAmount,
      cashCurrency,
      outOfPocketAmount: redemptionRow.taxesAndFeesAmount,
      outOfPocketCurrency: redemptionRow.taxesAndFeesCurrency,
      pointsCoversScenario: redemptionRow.shortfallStatus === "sufficient",
    };
  }, [primary, redemptionRow]);

  const glanceWithPoints = modeledPriceCompare
    ? `${modeledPriceCompare.outOfPocketAmount} ${modeledPriceCompare.outOfPocketCurrency} + points`
    : showInlineScenario
      ? "Enter award cost below"
      : primary?.lowestCashAmount && primary.lowestCashCurrency
        ? `${primary.lowestCashAmount} ${primary.lowestCashCurrency} cash only`
        : "—";

  const draftProgramId =
    draft.programId || (defaultProgramId as AssumptionDraft["programId"]);
  const draftCurrency = draft.taxesAndFeesCurrency || defaultTaxCurrency;

  return (
    <section
      className={cn(
        "rounded-planner-xl border border-border bg-surface-planner-panel p-5 shadow-sm",
        className,
      )}
      aria-labelledby="rewards-comparison-heading"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="rewards-comparison-heading"
            className="font-heading text-base font-semibold text-foreground"
          >
            Rewards comparison
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Balances and monthly earning come from your saved trip form. Cash fares
            are shown separately in cash flight search.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={!canEvaluate || isEvaluating}
          onClick={() => onEvaluate(assumptions)}
        >
          {isEvaluating ? "Updating…" : "Refresh"}
        </Button>
      </div>

      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      {!tripInput ? (
        <p className="text-sm text-muted-foreground">
          Save the trip form to include your rewards programs here.
        </p>
      ) : null}

      {tripInput && savedAccounts.length > 0 ? (
        <div className="rounded-planner-lg border border-border bg-surface-planner-elevated p-4">
          <p className={cn(plannerSectionLabelClassName, "text-muted-foreground")}>
            Saved rewards (trip form)
          </p>
          <ul className="mt-3 space-y-3">
            {savedAccounts.map((account) => (
              <li key={account.programId} className="text-sm">
                <p className="font-heading font-semibold text-foreground">
                  {account.programLabel}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  Balance:{" "}
                  <span className="text-foreground">{account.balanceDisplay}</span>
                </p>
                {account.balanceStatus === "unknown" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Unknown is not treated as zero. Update your balance in the{" "}
                    <Link
                      href={TRIP_FORM_REWARDS_HASH}
                      className="text-primary underline underline-offset-2"
                    >
                      trip form
                    </Link>
                    , then save and refresh.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Monthly earning:{" "}
            {monthlyDisplay ? (
              <span className="text-foreground">{monthlyDisplay}</span>
            ) : (
              <span className="text-foreground">Not provided on trip form</span>
            )}
          </p>
          <Link
            href={TRIP_FORM_REWARDS_HASH}
            className="mt-3 inline-block text-xs font-medium text-primary underline underline-offset-2"
          >
            Edit rewards on trip form
          </Link>
        </div>
      ) : null}

      {tripInput && savedAccounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No rewards programs on the saved trip.{" "}
          <Link href={TRIP_FORM_REWARDS_HASH} className="text-primary underline">
            Add them on the trip form
          </Link>
          .
        </p>
      ) : null}

      {!hasCashSearch && tripInput ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Run cash flight search (above) for Duffel fare baselines before comparing
          hypothetical redemption out-of-pocket to cash.
        </p>
      ) : null}

      {primary ? (
        <div
          className={cn(
            "mt-4 rounded-planner-lg border p-4",
            primary.status === "points_out_of_pocket"
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-surface-planner-input/50",
          )}
        >
          <p className={cn(plannerSectionLabelClassName, "text-muted-foreground")}>
            Comparison result
          </p>
          <p className="mt-2 font-heading text-base font-semibold text-foreground">
            {primary.headline}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{primary.subline}</p>

          {primary.lowestCashAmount && primary.lowestCashCurrency ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-planner-md border border-border bg-background/40 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Cash (Duffel)
                </p>
                <p className="mt-1 font-heading text-sm font-semibold text-foreground">
                  {primary.lowestCashAmount} {primary.lowestCashCurrency}
                </p>
              </div>
              <div className="rounded-planner-md border border-primary/30 bg-primary/5 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Your points (trip form)
                </p>
                <p className="mt-1 font-heading text-sm font-semibold text-foreground">
                  {primaryAccount?.balanceDisplay ??
                    (primary.balancePoints !== null
                      ? `${primary.balancePoints!.toLocaleString()} ${primary.pointsUnitLabel ?? "pts"}`
                      : "Balance not provided")}
                </p>
              </div>
              <div className="rounded-planner-md border border-border bg-background/40 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Modeled pay with points
                </p>
                <p className="mt-1 font-heading text-sm font-semibold text-foreground">
                  {glanceWithPoints}
                </p>
              </div>
            </div>
          ) : null}

          {modeledPriceCompare ? (
            <ModeledPriceCompare
              cashAmount={modeledPriceCompare.cashAmount}
              cashCurrency={modeledPriceCompare.cashCurrency}
              outOfPocketAmount={modeledPriceCompare.outOfPocketAmount}
              outOfPocketCurrency={modeledPriceCompare.outOfPocketCurrency}
              pointsCoversScenario={modeledPriceCompare.pointsCoversScenario}
            />
          ) : null}

          {redemptionRow ? (
            <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
              {redemptionRow.valuePerPointStatus === "calculated" &&
              redemptionRow.valuePerPoint ? (
                <div>
                  <dt className="font-medium text-foreground">
                    Potential value per point (assumption)
                  </dt>
                  <dd>
                    {redemptionRow.valuePerPoint} {redemptionRow.valuePerPointCurrency}{" "}
                    — {redemptionRow.valuePerPointExplanation}
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="font-medium text-foreground">Value per point</dt>
                  <dd>{redemptionRow.valuePerPointExplanation}</dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-foreground">Shortfall vs assumption</dt>
                <dd>{redemptionRow.shortfallExplanation}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Earning timeline</dt>
                <dd>
                  {redemptionRow.earningTimelineStatus === "calculated" &&
                  redemptionRow.earningTimelineMonths
                    ? `~${redemptionRow.earningTimelineMonths} month(s) — ${redemptionRow.earningTimelineExplanation}`
                    : redemptionRow.earningTimelineExplanation}
                </dd>
              </div>
            </dl>
          ) : null}

          {primary.status === "points_out_of_pocket" &&
          primary.notionalCashSavingsAmount &&
          primary.notionalCashSavingsCurrency ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Modeled difference vs lowest comparable cash: up to{" "}
              {primary.notionalCashSavingsAmount} {primary.notionalCashSavingsCurrency}.
              Hypothetical only — not verified award availability.
            </p>
          ) : null}
        </div>
      ) : null}

      {evaluation?.missingForFullComparison.length && !showInlineScenario ? (
        <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
          {evaluation.missingForFullComparison.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {tripInput && showInlineScenario && showScenarioForm ? (
        <div className="mt-4 rounded-planner-lg border border-dashed border-border p-4">
          <p className="text-xs font-medium text-foreground">
            Award cost for this trip (you enter — not your saved balance)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Example: if the airline would charge 45,000 points + {defaultTaxCurrency} 120 in
            taxes for this route, enter those numbers. We compare that to your{" "}
            {primaryAccount?.balanceDisplay ?? "saved balance"} and{" "}
            {primary?.lowestCashAmount ?? "…"} {primary?.lowestCashCurrency ?? ""} cash.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="re-scenario-program">Program</Label>
              <select
                id="re-scenario-program"
                className="mt-1 w-full rounded-planner-md border border-border bg-surface-planner-input px-3 py-2 text-sm"
                value={draftProgramId}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    programId: e.target.value as AssumptionDraft["programId"],
                  }))
                }
              >
                {programOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="re-scenario-pts">Points required for this award</Label>
              <Input
                id="re-scenario-pts"
                inputMode="numeric"
                placeholder="e.g. 45000"
                value={draft.pointsRequired}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    pointsRequired: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="re-scenario-tax">Taxes &amp; fees (cash)</Label>
              <Input
                id="re-scenario-tax"
                placeholder="e.g. 120.00"
                value={draft.taxesAndFeesAmount}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    taxesAndFeesAmount: e.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="re-scenario-ccy">Currency</Label>
              <Input
                id="re-scenario-ccy"
                maxLength={3}
                value={draftCurrency}
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
          <Button type="button" className="mt-3" variant="secondary" onClick={addScenarioAndRefresh}>
            Compare my {primaryAccount?.balancePoints?.toLocaleString() ?? "saved"}{" "}
            points to cash
          </Button>
        </div>
      ) : null}

      {tripInput && redemptionRow && !showInlineScenario ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() => {
            openScenarioForm();
            setShowScenarioForm(true);
          }}
        >
          Change award cost assumption
        </Button>
      ) : null}

      {evaluation ? (
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          {evaluation.awardAvailabilityNote}
        </p>
      ) : null}
    </section>
  );
}
