import {
  DUFFEL_API_VERSION,
  DUFFEL_REQUEST_TIMEOUT_MS,
  getDuffelAccessToken,
  getDuffelApiBaseUrl,
} from "@/lib/duffel/config";

export type DuffelErrorCode =
  | "not_configured"
  | "timeout"
  | "rate_limit"
  | "network"
  | "invalid_response"
  | "provider_error"
  | "not_found";

export class DuffelApiError extends Error {
  readonly code: DuffelErrorCode;
  readonly status?: number;

  constructor(code: DuffelErrorCode, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export type DuffelHttpClient = {
  request: (input: {
    path: string;
    method?: "GET" | "POST";
    query?: Record<string, string | undefined>;
    body?: unknown;
    timeoutMs?: number;
  }) => Promise<unknown>;
};

function buildUrl(path: string, query?: Record<string, string | undefined>) {
  const url = new URL(`${getDuffelApiBaseUrl()}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

export function mapDuffelApiError(error: unknown): DuffelApiError {
  if (error instanceof DuffelApiError) return error;
  if (error instanceof Error && error.name === "AbortError") {
    return new DuffelApiError("timeout", "Duffel request timed out");
  }
  const message = error instanceof Error ? error.message : "Duffel request failed";
  const lower = message.toLowerCase();
  if (lower.includes("fetch") || lower.includes("network")) {
    return new DuffelApiError("network", "Unable to reach Duffel");
  }
  return new DuffelApiError("provider_error", "Duffel request failed");
}

export function createDuffelHttpClient(): DuffelHttpClient {
  return {
    async request({ path, method = "GET", query, body, timeoutMs }) {
      const token = getDuffelAccessToken();
      if (!token) {
        throw new DuffelApiError(
          "not_configured",
          "Duffel is not configured on the server",
        );
      }

      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        timeoutMs ?? DUFFEL_REQUEST_TIMEOUT_MS,
      );

      try {
        const response = await fetch(buildUrl(path, query), {
          method,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Duffel-Version": DUFFEL_API_VERSION,
            ...(body !== undefined
              ? { "Content-Type": "application/json" }
              : {}),
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        const text = await response.text();
        let parsed: unknown = null;
        if (text) {
          try {
            parsed = JSON.parse(text);
          } catch {
            throw new DuffelApiError(
              "invalid_response",
              "Duffel returned malformed JSON",
              response.status,
            );
          }
        }

        if (!response.ok) {
          const providerMessage =
            typeof parsed === "object" &&
            parsed !== null &&
            "errors" in parsed &&
            Array.isArray((parsed as { errors: unknown[] }).errors)
              ? String(
                  (parsed as { errors: { message?: string }[] }).errors[0]
                    ?.message ?? "",
                )
              : "";

          if (response.status === 429) {
            throw new DuffelApiError(
              "rate_limit",
              "Duffel rate limit reached",
              response.status,
            );
          }
          if (response.status === 404) {
            throw new DuffelApiError(
              "not_found",
              providerMessage || "Duffel resource not found",
              response.status,
            );
          }
          console.error(
            "[duffel] Non-success response:",
            response.status,
            providerMessage.split("\n")[0],
          );
          throw new DuffelApiError(
            "provider_error",
            providerMessage || "Duffel request failed",
            response.status,
          );
        }

        return parsed;
      } catch (error) {
        if (error instanceof DuffelApiError) throw error;
        throw mapDuffelApiError(error);
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export function publicDuffelErrorMessage(code: DuffelErrorCode): string {
  switch (code) {
    case "not_configured":
      return "Cash flight search is not configured. Add DUFFEL_ACCESS_TOKEN on the server.";
    case "timeout":
      return "Flight search timed out. Try again with the same trip details.";
    case "rate_limit":
      return "Flight search is busy. Please wait a moment and try again.";
    case "network":
      return "Unable to reach the flight search provider. Check your connection.";
    case "invalid_response":
      return "Flight search returned an unexpected response. Please try again.";
    case "not_found":
      return "Flight search could not find matching routes for those locations.";
    default:
      return "Flight search is unavailable right now. Please try again.";
  }
}

export function mapDuffelErrorToStatus(code: DuffelErrorCode): number {
  switch (code) {
    case "not_configured":
      return 503;
    case "timeout":
      return 504;
    case "rate_limit":
      return 429;
    case "network":
      return 503;
    case "not_found":
      return 404;
    case "invalid_response":
      return 502;
    default:
      return 502;
  }
}
