import type { RewardEntryInput } from "@/schemas/tripPlannerSchema";

/** User-facing balance line from saved trip data — never inferred from program name. */
export function formatSavedBalanceDisplay(
  entry: Pick<RewardEntryInput, "balanceStatus" | "balancePoints">,
  pointsUnitLabel: string,
): string {
  if (entry.balanceStatus === "unknown") {
    return "Balance not provided";
  }
  if (entry.balanceStatus === "confirmed" && entry.balancePoints !== null) {
    return `${entry.balancePoints.toLocaleString()} ${pointsUnitLabel}`;
  }
  return "Balance not provided";
}

export function formatMonthlyEarningDisplay(
  monthlyPointsEstimate: number | null | undefined,
): string | null {
  if (monthlyPointsEstimate === null || monthlyPointsEstimate === undefined) {
    return null;
  }
  return `${monthlyPointsEstimate.toLocaleString()} points per month`;
}
