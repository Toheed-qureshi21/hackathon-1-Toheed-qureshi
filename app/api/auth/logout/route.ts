import { jsonError, jsonOk } from "@/lib/auth/api-response";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClientFromCookies } from "@/lib/supabase/server";

export async function POST() {
  if (!getSupabasePublicEnv().isConfigured) {
    return jsonError(
      "Authentication is not configured. Contact support or try again later.",
      503,
    );
  }

  try {
    const supabase = await createSupabaseServerClientFromCookies();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return jsonError("Unable to sign out. Please try again.", 400);
    }

    return jsonOk({
      status: "signed_out",
      redirectTo: "/login",
    });
  } catch {
    return jsonError("Unable to sign out right now. Please try again.", 500);
  }
}
