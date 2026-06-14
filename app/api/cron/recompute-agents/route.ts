import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { pricePerAcre, acresOf } from "@/app/lib/format";

export const dynamic = "force-dynamic";

// Agent learning (spec 9.4), in JS so it can reuse the project's price/area
// normalization (this DB has no price_per_acre/acreage columns). Recomputes each
// active agent's observed_* attributes nightly. Schedule via Vercel cron, or call
// manually with ?key=<CRON_SECRET>.

const DAY = 86400000;

function mode(values: (string | null | undefined)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 0;
  for (const [k, n] of counts) if (n > bestN) { best = k; bestN = n; }
  return best;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[idx];
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const key = new URL(request.url).searchParams.get("key");
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}` && key !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const { data: agents } = await db.from("agent_profiles").select("id").eq("profile_status", "active");
  if (!agents || agents.length === 0) return Response.json({ ok: true, agents_updated: 0 });

  // Cutoffs computed once per request (Date.now is fine in a route handler).
  const now = Date.now();
  const cutoff90 = new Date(now - 90 * DAY).toISOString();
  const cutoff30 = new Date(now - 30 * DAY).toISOString();

  let updated = 0;
  for (const { id } of agents) {
    const [{ data: listings }, { data: events }, { count: recentCount }] = await Promise.all([
      db.from("listings").select("district, taluka, price, price_basis, area_value, area_unit, created_at").eq("agent_id", id),
      db.from("agent_events").select("event_type").eq("agent_id", id).gte("created_at", cutoff90),
      db.from("whatsapp_inbox").select("id", { count: "exact", head: true }).eq("agent_id", id).gte("received_at", cutoff30),
    ]);

    const rows = listings ?? [];
    const recent = rows.filter((l) => l.created_at && l.created_at > cutoff90);

    const perAcres = rows.map((l) => pricePerAcre(l)).filter((n): n is number => n != null && n > 0).sort((a, b) => a - b);
    const acreages = rows.map((l) => acresOf(l)).filter((n): n is number => n != null && n > 0);

    const published = (events ?? []).filter((e) => e.event_type === "listing_published").length;
    const corrected = (events ?? []).filter((e) => e.event_type === "admin_correction").length;
    const accuracy = published > 0 ? Math.max(0, 1 - corrected / published) : 0.5;

    await db
      .from("agent_profiles")
      .update({
        observed_primary_district: mode(recent.map((l) => l.district)),
        observed_primary_taluka: mode(recent.map((l) => l.taluka)),
        observed_price_min_per_acre: perAcres.length ? Math.round(percentile(perAcres, 0.1)!) : null,
        observed_price_max_per_acre: perAcres.length ? Math.round(percentile(perAcres, 0.9)!) : null,
        observed_acreage_min: acreages.length ? Math.min(...acreages) : null,
        observed_acreage_max: acreages.length ? Math.max(...acreages) : null,
        accuracy_score: Number(accuracy.toFixed(3)),
        recent_submissions_count: recentCount ?? 0,
      })
      .eq("id", id);
    updated++;
  }

  return Response.json({ ok: true, agents_updated: updated });
}
