import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { sendEmail, founderRecipient } from "@/app/lib/email";

export const dynamic = "force-dynamic";

const BASE = "https://acrehubindia.com";
const norm = (s: unknown) => (s ?? "").toString().trim().toLowerCase();
const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Weekly founder digest: where demand outstrips supply, emailed via Resend.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const key = new URL(request.url).searchParams.get("key");
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}` && key !== secret) return new Response("Unauthorized", { status: 401 });
  }

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [s, d, b, l] = await Promise.all([
    db.from("search_logs").select("district, land_type").gte("created_at", since).limit(5000),
    db.from("demand_signals").select("district, land_type").gte("created_at", since),
    db.from("buyer_interests").select("preferred_district, land_types, status").gte("created_at", since),
    db.from("listings").select("district, land_type").eq("status", "active"),
  ]);

  const dd = new Map<string, number>();
  const ds = new Map<string, number>();
  const td = new Map<string, number>();
  const add = (m: Map<string, number>, k: string, w: number) => { if (k) m.set(k, (m.get(k) ?? 0) + w); };
  for (const r of s.data ?? []) { add(dd, norm(r.district), 1); add(td, norm(r.land_type), 1); }
  for (const r of d.data ?? []) { add(dd, norm(r.district), 2); add(td, norm(r.land_type), 2); }
  for (const r of b.data ?? []) { if (!r.status || r.status === "active") { add(dd, norm(r.preferred_district), 3); (r.land_types ?? []).forEach((t: string) => add(td, norm(t), 3)); } }
  for (const r of l.data ?? []) add(ds, norm(r.district), 1);

  const districts = [...dd.entries()]
    .map(([k, dem]) => ({ k, dem, sup: ds.get(k) ?? 0 }))
    .filter((x) => x.dem >= 2)
    .sort((a, b2) => (b2.dem - b2.sup) - (a.dem - a.sup))
    .slice(0, 6);
  const types = [...td.entries()].map(([k, dem]) => ({ k, dem })).filter((x) => x.dem >= 2).sort((a, b2) => b2.dem - a.dem).slice(0, 4);

  const digest = {
    window: "last 30 days",
    sourcing_priorities: districts.map((x) => ({ district: cap(x.k), demand: x.dem, active_listings: x.sup })),
    top_land_types: types.map((x) => ({ land_type: x.k, demand: x.dem })),
  };

  const to = founderRecipient();

  let emailed = false;
  if (districts.length || types.length) {
    const rows = districts
      .map((x) => `<li style="margin-bottom:6px"><strong>${cap(x.k)}</strong> — demand ${x.dem}, ${x.sup} active listing${x.sup === 1 ? "" : "s"}${x.sup === 0 ? " <span style=\"color:#b45309\">(source!)</span>" : ""}</li>`)
      .join("");
    const typeRow = types.map((x) => `${cap(x.k.replace(/_/g, " "))} (${x.dem})`).join(", ");
    const html = `<div style="font-family:Arial,sans-serif;color:#1d1b14;max-width:560px">
      <h2 style="color:#38461f">Source here — your weekly AcreHub intelligence</h2>
      <p>Where buyer demand most outstrips your supply (last 30 days):</p>
      <ul style="padding-left:18px">${rows || "<li>No clear district signal yet.</li>"}</ul>
      ${typeRow ? `<p><strong>Most-wanted land types:</strong> ${typeRow}</p>` : ""}
      <p><a href="${BASE}/admin/intelligence" style="color:#445626;font-weight:600">Open Founder Intelligence →</a></p>
      <p style="color:#8a8473;font-size:12px;margin-top:24px">Weighted demand: requirement ×3, notify-me ×2, search ×1.</p>
    </div>`;
    emailed = await sendEmail({ to, subject: "Source here — your weekly AcreHub intelligence", html });
  }

  return Response.json({ ok: true, emailed, digest });
}
