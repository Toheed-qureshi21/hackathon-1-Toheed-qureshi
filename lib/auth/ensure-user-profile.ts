import prisma from "@/lib/prisma";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function resolveDisplayName(user: SupabaseUser, fallbackName?: string): string {
  if (fallbackName?.trim()) {
    return fallbackName.trim();
  }
  const metaName = user.user_metadata?.full_name;
  if (typeof metaName === "string" && metaName.trim()) {
    return metaName.trim();
  }
  if (user.email) {
    return user.email.split("@")[0] ?? "Traveler";
  }
  return "Traveler";
}

export async function ensureUserProfile(
  user: SupabaseUser,
  options?: { fullName?: string },
): Promise<void> {
  const email = user.email;
  if (!email) {
    return;
  }

  const name = resolveDisplayName(user, options?.fullName);

  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      name,
    },
    update: {
      email,
      name,
    },
  });
}
