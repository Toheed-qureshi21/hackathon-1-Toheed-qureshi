import { jsonError, jsonOk } from "@/lib/auth/api-response";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function GET() {
  if (!getSupabasePublicEnv().isConfigured) {
    return jsonError("Authentication is not configured", 503);
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  return jsonOk({
    user: {
      id: user.id,
      email: user.email,
    },
  });
}
