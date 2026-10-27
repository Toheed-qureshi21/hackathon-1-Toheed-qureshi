import {
  REWARD_PROGRAM_OPTIONS,
  type TripPlannerInput,
} from "@/schemas/tripPlannerSchema";

/** One confirmed point offsets 0.01 of the cash-fare currency (1 cent per point). */
export const CURRENCY_CENTS_PER_POINT = 1;

export type PointsCreditResult = {
  cashAmount: number;
  priceWithPoints: number;
  pointsCredit: number;
  pointsUsed: number;
  leftoverPoints: number;
};

export type ConfirmedPointsContext = {
  programId: string;
  programLabel: string;
  pointsUnitLabel: string;
  balancePoints: number;
};

export function applyPointsCredit(
  cashAmount: number,
  confirmedPoints: number,
): PointsCreditResult {
  const safeCash = Number.isFinite(cashAmount) && cashAmount > 0 ? cashAmount : 0;
  const safePoints =
    Number.isFinite(confirmedPoints) && confirmedPoints > 0
      ? Math.floor(confirmedPoints)
      : 0;
  const cashCents = Math.round(safeCash * 100);
  const creditCents = Math.min(cashCents, safePoints * CURRENCY_CENTS_PER_POINT);
  const priceCents = Math.max(0, cashCents - creditCents);

  return {
    cashAmount: cashCents / 100,
    priceWithPoints: priceCents / 100,
    pointsCredit: creditCents / 100,
    pointsUsed: creditCents,
    leftoverPoints: Math.max(0, safePoints - creditCents),
  };
}

export function formatCreditMoney(value: number): string {
  return value.toFixed(2);
}

export function firstConfirmedPointsContext(
  trip: TripPlannerInput | null | undefined,
): ConfirmedPointsContext | null {
  if (!trip) return null;
  const entry = trip.rewards.find(
    (reward) =>
      reward.balanceStatus === "confirmed" &&
      reward.balancePoints !== null &&
      reward.balancePoints > 0,
  );
  if (!entry || entry.balancePoints === null) return null;
  const meta = REWARD_PROGRAM_OPTIONS.find((option) => option.id === entry.programId);
  return {
    programId: entry.programId,
    programLabel: meta?.label ?? entry.programId,
    pointsUnitLabel: meta?.pointsLabel ?? "Points",
    balancePoints: entry.balancePoints,
  };
}
