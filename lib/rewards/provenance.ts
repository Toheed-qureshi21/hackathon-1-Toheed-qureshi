/** How a value used in rewards evaluation was obtained. */
export const DATA_PROVENANCE = {
  duffelCashOffer: "duffel_cash_offer",
  userConfirmedBalance: "user_confirmed_balance",
  userSuppliedAssumption: "user_supplied_assumption",
  independentlyVerifiedRedemption: "independently_verified_redemption",
  userEstimate: "user_estimate",
  unknown: "unknown",
} as const;

export type DataProvenanceKind =
  (typeof DATA_PROVENANCE)[keyof typeof DATA_PROVENANCE];

export const PROVENANCE_LABELS: Record<DataProvenanceKind, string> = {
  duffel_cash_offer: "Duffel cash fare (provider)",
  user_confirmed_balance: "User-confirmed balance",
  user_supplied_assumption: "User-supplied redemption assumption (unverified)",
  independently_verified_redemption:
    "Independently verified redemption requirement",
  user_estimate: "User-provided estimate",
  unknown: "Unknown or not provided",
};
