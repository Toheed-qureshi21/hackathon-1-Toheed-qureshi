import { jsonError, jsonOk, jsonValidationError } from "@/lib/auth/api-response";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";
import { mapAuthProviderError } from "@/lib/auth/map-auth-error";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClientFromCookies } from "@/lib/supabase/server";
import { loginApiSchema } from "@/schemas/authApiSchema";

export async function POST(request: Request) {
  if (!getSupabasePublicEnv().isConfigured) {
    return jsonError(
      "Authentication is not configured. Contact support or try again later.",
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = loginApiSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createSupabaseServerClientFromCookies();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const status = error.message.toLowerCase().includes("invalid")
        ? 401
        : 400;
      return jsonError(mapAuthProviderError(error.message), status);
    }

    if (data.user) {
      await ensureUserProfile(data.user);
    }

    return jsonOk({
      status: "session_created",
      redirectTo: "/planner",
    });
  } catch {
    return jsonError("Unable to sign in right now. Please try again.", 500);
  }
}
