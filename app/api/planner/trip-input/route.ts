import { jsonError, jsonOk, jsonValidationError } from "@/lib/auth/api-response";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { tripPlannerInputSchema } from "@/schemas/tripPlannerSchema";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonError("Authentication required", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = tripPlannerInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  return jsonOk({
    status: "validated",
    tripInput: parsed.data,
  });
}
