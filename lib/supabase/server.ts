import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export async function createSupabaseServerClientFromCookies() {
  const { url, publishableKey, isConfigured } = getSupabasePublicEnv();
  if (!isConfigured || !url || !publishableKey) {
    throw new Error("Supabase is not configured");
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export function createSupabaseProxyClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, publishableKey, isConfigured } = getSupabasePublicEnv();
  if (!isConfigured || !url || !publishableKey) {
    return null;
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options as CookieOptions);
        });
      },
    },
  });
}
