"use client";

import {
  getSupabaseBrowserClient,
  isSupabaseAuthConfigured,
} from "@/lib/supabase/browser-client";
import { useEffect, useState } from "react";

export type AuthSessionStatus = "loading" | "authenticated" | "unauthenticated";

function initialAuthStatus(): AuthSessionStatus {
  return isSupabaseAuthConfigured() ? "loading" : "unauthenticated";
}

export function useAuthSession(): { status: AuthSessionStatus } {
  const [status, setStatus] = useState<AuthSessionStatus>(initialAuthStatus);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return;
    }

    let active = true;

    client.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setStatus(session ? "authenticated" : "unauthenticated");
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "authenticated" : "unauthenticated");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { status };
}
