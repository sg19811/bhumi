import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { sendEmail, escapeHtml } from "@/app/lib/email";
import { formatINRShort } from "@/app/lib/format";

export const dynamic = "force-dynamic";

const BASE = "https://acrehubindia.com";
// Replies always go to isha. The "from" address uses ALERT_FROM_EMAIL when set
// (e.g. isha@acrehubindia.com once the domain is verified in Resend); until then
// it falls back to the default verified sender so emails still go out.
const REPLY_TO = "isha@acrehubindia.com";
const DAY = 86400000;

// Only notify reasonably recent sign-ups, so we don't email stale signals forever.
const SIGNAL_MAX_AGE_DAYS = 120;

type Listing = { id: string; title: string; district: string | null; land_type: string | null; price: number | null; village: string | null; taluka: string | null };
type Signal = { contact: string; district: string | null; land_type: string | null };

function matches(listing: Listing, sig: Signal): boolean {
  if (sig.land_type && listing.land_type !== sig.land_type) return false;
  if (sig.district) {
    const ld = (listing.district ?? "").toLowerCase();
    const sd = sig.district.toLowerCase().trim();
    if (!ld || (!ld.includes(sd) && !sd.includes(ld))) return false;
  }
  return true;
}

function buildEmail(listings: Listing[]): string {
  const rows = listings.map((l) => {
    const loc = [l.village, l.taluka, l.district].filter(Boolean).join(", ");
    return `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee">
        <a href="${BASE}/listing/${escapeHtml(l.id)}" style="color:#38461f;font-weight:600;text-decoration:none">${escapeHtml(l.title)}</a><br>
        <span style="color:#8a8473;font-size:13px">${escapeHtml(loc)} · ${escapeHtml(formatINRShort(l.price ?? 0))}</span>
      </td>
    </tr>`;
  }).join("");
  return `<div style="font-family:Arial,sans-serif;color:#1d1b14;max-width:560px">
    <h2 style="color:#38461f">New land matching what you wanted</h2>
    <p style="color:#1d1b14;font-size:14px">You asked us to tell you when matching land is listed on AcreHub. Here's what's new:</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
    <p style="margin-top:16px"><a href="${BASE}/explore" style="color:#445626;font-weight:600">Browse all land →</a></p>
    <p style="color:#8a8473;font-size:12px;margin-top:24px">You're getting this because you signed up for new-land alerts on AcreHub. Reply to this email to stop.</p>
  </div>`;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const key = new URL(request.url).searchParams.get("key");
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}` && key !== secret) return new Response("Unauthorized", { status: 401 });
  }

  const now = Date.now();
  const since = new Date(now - DAY).toISOString();

  // Listings published in the last 24h.
  const { data: fresh } = await db
    .from("listings")
    .select("id, title, district, land_type, price, village, taluka")
    .eq("status", "active")
    .gte("created_at", since);
  const listings = (fresh ?? []) as Listing[];
  if (listings.length === 0) return Response.json({ ok: true, sent: 0, note: "no new listings" });

  // Recent demand signals that left an email.
  const { data: signalRows } = await db
    .from("demand_signals")
    .select("contact, district, land_type, created_at")
    .gte("created_at", new Date(now - SIGNAL_MAX_AGE_DAYS * DAY).toISOString());
  const signals = (signalRows ?? []).filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s.contact ?? ""))) as Signal[];

  // One email per recipient with all their matches (dedupe by lowercased email).
  const perEmail = new Map<string, Listing[]>();
  for (const sig of signals) {
    const hits = listings.filter((l) => matches(l, sig));
    if (hits.length === 0) continue;
    const key = sig.contact.toLowerCase();
    const existing = perEmail.get(key) ?? [];
    for (const h of hits) if (!existing.some((e) => e.id === h.id)) existing.push(h);
    perEmail.set(key, existing);
  }

  let sent = 0;
  for (const [email, matchedListings] of perEmail) {
    const ok = await sendEmail({
      to: email,
      replyTo: REPLY_TO,
      subject: "New land matching what you wanted — AcreHub",
      html: buildEmail(matchedListings),
    });
    if (ok) sent++;
  }

  return Response.json({ ok: true, recipients: perEmail.size, sent, new_listings: listings.length });
}
