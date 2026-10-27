const DEFAULT_DUFFEL_API_BASE_URL = "https://api.duffel.com";
export const DUFFEL_API_VERSION = "v2";
export const DUFFEL_REQUEST_TIMEOUT_MS = 55_000;

export function getDuffelAccessToken(): string | null {
  const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
  return token ? token : null;
}

export function getDuffelApiBaseUrl(): string {
  const configured = process.env.DUFFEL_API_BASE_URL?.trim();
  const base = configured || DEFAULT_DUFFEL_API_BASE_URL;
  return base.replace(/\/$/, "");
}
