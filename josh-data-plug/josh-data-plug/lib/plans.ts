import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/auth";
import type { Plan } from "@/lib/types";

export async function getPlans(opts: { network?: string; limit?: number } = {}): Promise<Plan[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from("plans")
      .select("id, network, name, size, validity, price, active")
      .eq("active", true)
      .order("price", { ascending: true });
    if (opts.network) query = query.eq("network", opts.network);
    if (opts.limit) query = query.limit(opts.limit);
    const { data } = await query;
    return ((data ?? []) as Plan[]).map((p) => ({ ...p, price: Number(p.price) }));
  } catch {
    return [];
  }
}
