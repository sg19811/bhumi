import { supabase } from "@/app/lib/supabase";
import { PROJECT_LAND_TYPES } from "@/app/lib/farm-plots/types";
import { CORRIDOR_SLUGS } from "@/app/lib/farm-plots/corridors";

// All queries are defensive: if the migration isn't applied yet (corridor column
// missing), Supabase returns an error and we fall back to zero/empty — never throw.

export async function getCorridorCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const s of CORRIDOR_SLUGS) counts[s] = 0;
  const { data, error } = await supabase
    .from("listings")
    .select("corridor")
    .eq("status", "active")
    .in("land_type", PROJECT_LAND_TYPES);
  if (error || !Array.isArray(data)) return counts;
  for (const row of data) {
    const c = (row as { corridor?: string }).corridor;
    if (c && c in counts) counts[c] += 1;
  }
  return counts;
}

export async function getProjectListings(corridor?: string, limit = 24): Promise<Record<string, unknown>[]> {
  let q = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .in("land_type", PROJECT_LAND_TYPES)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (corridor) q = q.eq("corridor", corridor);
  const { data, error } = await q;
  if (error || !Array.isArray(data)) return [];
  return data as Record<string, unknown>[];
}
