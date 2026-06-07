import { NextResponse } from "next/server";
import { supabaseAdmin as db } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const norm = (s: unknown) => (s ?? "").toString().trim().toLowerCase();
const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Public, anonymized signal: which districts buyers want most that we under-serve.
// Computed server-side (the demand tables are admin-read-only) and returned as
// plain district names — no counts — to nudge sellers toward demand.
export async function GET() {
  const since = new Date(Date.now() - 90 * 86400000).toISOString();
  const [s, d, b, l] = await Promise.all([
    db.from("search_logs").select("district").gte("created_at", since).limit(5000),
    db.from("demand_signals").select("district").gte("created_at", since),
    db.from("buyer_interests").select("preferred_district, status").gte("created_at", since),
    db.from("listings").select("district").eq("status", "active"),
  ]);

  const demand = new Map<string, number>();
  const supply = new Map<string, number>();
  const add = (m: Map<string, number>, k: string, w: number) => { if (k) m.set(k, (m.get(k) ?? 0) + w); };

  for (const r of s.data ?? []) add(demand, norm(r.district), 1);
  for (const r of d.data ?? []) add(demand, norm(r.district), 2);
  for (const r of b.data ?? []) { if (!r.status || r.status === "active") add(demand, norm(r.preferred_district), 3); }
  for (const r of l.data ?? []) add(supply, norm(r.district), 1);

  const areas = [...demand.entries()]
    .map(([key, dem]) => ({ key, dem, sup: supply.get(key) ?? 0 }))
    .filter((x) => x.dem >= 2) // ignore one-off noise
    .sort((a, b2) => (b2.dem - b2.sup) - (a.dem - a.sup))
    .slice(0, 5)
    .map((x) => cap(x.key));

  return NextResponse.json({ areas });
}
