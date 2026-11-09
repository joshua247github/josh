import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Current user + profile, or nulls. Never throws (safe for layouts). */
export async function getSession(): Promise<{
  user: { id: string; email?: string } | null;
  profile: Profile | null;
}> {
  if (!supabaseConfigured()) return { user: null, profile: null };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null };
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, wallet_balance, created_at")
      .eq("id", user.id)
      .maybeSingle();
    return { user: { id: user.id, email: user.email }, profile: (profile as Profile) ?? null };
  } catch {
    return { user: null, profile: null };
  }
}

export async function getActiveAnnouncement(): Promise<string> {
  const fallback = "Instant data delivery 24/7";
  if (!supabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("announcements")
      .select("message")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.message ?? fallback;
  } catch {
    return fallback;
  }
}
