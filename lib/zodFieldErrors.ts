import type { z } from "zod";

export function fieldErrorsFromZod(
  error: z.ZodError,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const issue of error.issues) {
    const key =
      issue.path.length > 0 ? issue.path.map(String).join(".") : "form";
    if (out[key] === undefined) {
      out[key] = issue.message;
    }
  }
  return out;
}
