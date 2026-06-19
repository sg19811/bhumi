import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { generateShortCode, shortLinkUrl } from "@/app/lib/share-links";

export const dynamic = "force-dynamic";

// Allowed share_links.channel values (must match the DB CHECK constraint).
const CHANNELS = new Set([
  "whatsapp", "telegram", "email", "sms", "qr",
  "agent_share", "direct", "seo", "referral",
]);

// POST /api/growth/share-link — create a tracked short link.
// Body: { target_url (required), asset_id?, entity_type?, entity_id?,
//         referral_code?, channel?, utm_*?, created_by?, expires_at? }
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const targetUrl = String(body.target_url ?? "").trim();
  if (!targetUrl) {
    return Response.json({ ok: false, error: "target_url is required." }, { status: 400 });
  }
  try {
    new URL(targetUrl);
  } catch {
    return Response.json({ ok: false, error: "target_url must be a valid URL." }, { status: 400 });
  }

  const channel = body.channel ? String(body.channel) : null;
  if (channel && !CHANNELS.has(channel)) {
    return Response.json({ ok: false, error: "Unsupported channel." }, { status: 400 });
  }

  const str = (v: unknown) => (v ? String(v) : null);
  const row = {
    target_url: targetUrl,
    asset_id: str(body.asset_id),
    entity_type: str(body.entity_type),
    entity_id: str(body.entity_id),
    referral_code: str(body.referral_code),
    channel,
    utm_source: str(body.utm_source),
    utm_medium: str(body.utm_medium),
    utm_campaign: str(body.utm_campaign),
    utm_content: str(body.utm_content),
    utm_term: str(body.utm_term),
    created_by: str(body.created_by),
    expires_at: str(body.expires_at),
  };

  // Generate a unique short_code, retrying only on a unique-violation collision.
  let shortCode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateShortCode();
    const { data, error } = await db
      .from("share_links")
      .insert({ ...row, short_code: candidate })
      .select("short_code")
      .maybeSingle();
    if (!error && data) {
      shortCode = data.short_code;
      break;
    }
    if (error && error.code !== "23505") break; // non-collision error → stop
  }

  if (!shortCode) {
    return Response.json({ ok: false, error: "Couldn't create share link." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  return Response.json({ ok: true, short_code: shortCode, short_url: shortLinkUrl(origin, shortCode) });
}
