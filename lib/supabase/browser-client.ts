import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) {
    return browserClient;
  }

  const { url, publishableKey, isConfigured } = getSupabasePublicEnv();

  if (!isConfigured || !url || !publishableKey) {
    browserClient = null;
    return null;
  }

  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}

export function isSupabaseAuthConfigured(): boolean {
  return getSupabasePublicEnv().isConfigured;
}
