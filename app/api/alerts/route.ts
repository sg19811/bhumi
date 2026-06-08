import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { cleanSearchTerm } from "@/app/lib/search";

export const dynamic = "force-dynamic";

const BASE = "https://acrehubindia.com";

function escapeHtml(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

// Apply a saved search's querystring filters to a listings query (mirrors /explore).
function applyFilters(query: any, params: URLSearchParams) {
  const g = (k: string) => params.get(k);
  const term = cleanSearchTerm(g("q"));
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,district.ilike.%${term}%,taluka.ilike.%${term}%,village.ilike.%${term}%`);
  if (g("land_type")) query = query.eq("land_type", g("land_type"));
  if (g("min_price")) query = query.gte("price", Number(g("min_price")));
  if (g("max_price")) query = query.lte("price", Number(g("max_price")));
  if (g("max_area")) query = query.lte("area_value", Number(g("max_area")));
  if (g("water_source")) query = query.eq("water_source", g("water_source"));
  if (g("road_access")) query = query.eq("road_access", g("road_access"));
  if (g("verified") === "true") query = query.eq("is_verified", true);
  return query;
}

function buildEmail(label: string, query: string, matches: any[]) {
  const items = matches
    .map((m) => {
      const loc = [m.village, m.taluka, m.district].filter(Boolean).join(", ");
      return `<li style="margin-bottom:8px"><a href="${BASE}/listing/${m.id}" style="color:#445626;font-weight:600">${escapeHtml(m.title)}</a> — ₹${Number(m.price).toLocaleString("en-IN")}${loc ? ` · ${escapeHtml(loc)}` : ""}</li>`;
    })
    .join("");
  return `<div style="font-family:Arial,sans-serif;color:#1d1b14;max-width:560px">
    <h2 style="color:#38461f">New land matching your search</h2>
    <p>${matches.length} new listing${matches.length > 1 ? "s" : ""} matched <strong>${escapeHtml(label || query || "your search")}</strong> on AcreHub:</p>
    <ul style="padding-left:18px">${items}</ul>
    <p><a href="${BASE}/explore?${escapeHtml(query)}" style="color:#445626">View all matches →</a></p>
    <p style="color:#8a8473;font-size:12px;margin-top:24px">You're receiving this because you saved a search on AcreHub. Remove the saved search on the site to stop these alerts.</p>
  </div>`;
}

export async function GET(request: Request) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>". Also allow ?key= for manual testing.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const key = new URL(request.url).searchParams.get("key");
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}` && key !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL || "AcreHub <onboarding@resend.dev>";

  const { data: searches } = await db.from("saved_searches").select("*");
  let checked = 0;
  let emailed = 0;

  for (const s of searches ?? []) {
    checked++;
    const since = s.last_notified_at ?? s.created_at;

    let q = db
      .from("listings")
      .select("id, title, price, district, taluka, village")
      .eq("status", "active")
      .gt("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10);
    q = applyFilters(q, new URLSearchParams(s.query || ""));
    const { data: matches } = await q;

    if (matches && matches.length > 0 && resendKey) {
      const { data: u } = await db.auth.admin.getUserById(s.user_id);
      const email = u?.user?.email;
      if (email) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: email,
            subject: "New land matching your search on AcreHub",
            html: buildEmail(s.label, s.query, matches),
          }),
        });
        emailed++;
      }
    }

    // Advance the watermark so we only alert on genuinely new listings next run.
    await db.from("saved_searches").update({ last_notified_at: new Date().toISOString() }).eq("id", s.id);
  }

  return Response.json({ ok: true, checked, emailed });
}
