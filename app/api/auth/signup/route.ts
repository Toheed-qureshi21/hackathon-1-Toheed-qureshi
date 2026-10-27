import { jsonError, jsonOk, jsonValidationError } from "@/lib/auth/api-response";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";
import { mapAuthProviderError } from "@/lib/auth/map-auth-error";
import { getAppOrigin, getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClientFromCookies } from "@/lib/supabase/server";
import { signupApiSchema } from "@/schemas/authApiSchema";

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

  const parsed = signupApiSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const { fullName, email, password } = parsed.data;

  try {
    const supabase = await createSupabaseServerClientFromCookies();
    const origin = getAppOrigin();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.log({error});
      
      return jsonError(mapAuthProviderError(error.message), 400);
    }

    if (data.session && data.user) {
      await ensureUserProfile(data.user, { fullName });
      return jsonOk({
        status: "session_created",
        redirectTo: "/planner",
      });
    }

    return jsonOk({
      status: "verification_pending",
      message:
        "Check your email to confirm your account before signing in.",
    });
  } catch {
    return jsonError("Unable to create account right now. Please try again.", 500);
  }
}
