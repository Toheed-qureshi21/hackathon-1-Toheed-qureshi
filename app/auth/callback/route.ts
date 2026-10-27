import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClientFromCookies } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next");

  if (!getSupabasePublicEnv().isConfigured) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/planner";

  try {
    const supabase = await createSupabaseServerClientFromCookies();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      return NextResponse.redirect(new URL("/login", requestUrl.origin));
    }

    await ensureUserProfile(data.user);

    return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
  } catch {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }
}
