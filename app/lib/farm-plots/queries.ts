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

export async function getProjectListings(
  opts: { city?: string; corridor?: string; limit?: number } = {},
): Promise<Record<string, unknown>[]> {
  const { city, corridor, limit = 24 } = opts;
  let q = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .in("land_type", PROJECT_LAND_TYPES)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (corridor) q = q.eq("corridor", corridor);
  if (city) q = q.eq("nearest_city", city);
  const { data, error } = await q;
  if (error || !Array.isArray(data)) return [];
  return data as Record<string, unknown>[];
}

/** Other active projects by the same developer (for the developer profile card). */
export async function getProjectsByDeveloper(
  developerName: string,
  excludeId?: string,
  limit = 6,
): Promise<Record<string, unknown>[]> {
  if (!developerName) return [];
  let q = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .eq("developer_name", developerName)
    .in("land_type", PROJECT_LAND_TYPES)
    .order("created_at", { ascending: false })
    .limit(limit + 1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q;
  if (error || !Array.isArray(data)) return [];
  return (data as Record<string, unknown>[]).slice(0, limit);
}

/** Count of active project listings per city (matched on nearest_city). */
export async function getCityCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const { data, error } = await supabase
    .from("listings")
    .select("nearest_city")
    .eq("status", "active")
    .in("land_type", PROJECT_LAND_TYPES);
  if (error || !Array.isArray(data)) return counts;
  for (const row of data) {
    const c = (row as { nearest_city?: string }).nearest_city;
    if (c) counts[c] = (counts[c] ?? 0) + 1;
  }
  return counts;
}
