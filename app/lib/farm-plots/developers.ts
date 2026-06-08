import { supabase } from "@/app/lib/supabase";
import { PROJECT_LAND_TYPES } from "@/app/lib/farm-plots/types";

// Developers aren't a table yet — a "developer" is the distinct `developer_name`
// on project listings. These helpers derive a stable slug and resolve it back.

export function slugifyDeveloper(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Distinct developer names across active project listings. */
export async function getDeveloperNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("developer_name")
    .eq("status", "active")
    .in("land_type", PROJECT_LAND_TYPES)
    .not("developer_name", "is", null);
  if (error || !Array.isArray(data)) return [];
  const set = new Set<string>();
  for (const r of data) {
    const n = (r as { developer_name?: string }).developer_name;
    if (n && n.trim()) set.add(n.trim());
  }
  return [...set];
}

/** Resolve a developer slug back to its name (null if no live developer matches). */
export async function resolveDeveloperSlug(slug: string): Promise<string | null> {
  const names = await getDeveloperNames();
  return names.find((n) => slugifyDeveloper(n) === slug) ?? null;
}
