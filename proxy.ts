import { createSupabaseProxyClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_LOGIN = "/login";
const AUTH_SIGNUP = "/signup";
const PLANNER = "/planner";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({ request });

  if (!getSupabasePublicEnv().isConfigured) {
    return response;
  }

  const supabase = createSupabaseProxyClient(request, response);
  if (!supabase) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);

  if (pathname === PLANNER && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = AUTH_LOGIN;
    loginUrl.searchParams.set("next", PLANNER);
    return NextResponse.redirect(loginUrl);
  }

  if (
    isAuthenticated &&
    (pathname === AUTH_LOGIN || pathname === AUTH_SIGNUP)
  ) {
    const plannerUrl = request.nextUrl.clone();
    plannerUrl.pathname = PLANNER;
    plannerUrl.search = "";
    return NextResponse.redirect(plannerUrl);
  }

  return response;
}

export const config = {
  matcher: ["/planner", "/login", "/signup"],
};
