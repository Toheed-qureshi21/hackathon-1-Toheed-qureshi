import { createSupabaseServerClientFromCookies } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { User } from "@supabase/supabase-js";

export async function getAuthenticatedUser(): Promise<User | null> {
  if (!getSupabasePublicEnv().isConfigured) {
    return null;
  }

  const supabase = await createSupabaseServerClientFromCookies();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
