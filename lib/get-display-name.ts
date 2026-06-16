import type { User } from "@supabase/supabase-js";

export function getDisplayName(user: User | null, fallback = "daar") {
  if (!user) return fallback;

  const name = user.user_metadata?.full_name || user.user_metadata?.name;

  if (typeof name === "string" && name.trim().length > 0) {
    return name.trim();
  }

  return fallback;
}
