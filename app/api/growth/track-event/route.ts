import { logGrowthEvent } from "@/app/lib/growth-events";

export const dynamic = "force-dynamic";

// Event types a browser/client is allowed to log (mirrors the growth_events
// anon-insert RLS allow-list). Anything else must come from trusted server code.
const CLIENT_EVENTS = new Set([
  "page_view", "listing_view", "listing_share_clicked",
  "whatsapp_share_clicked", "telegram_post_clicked", "referral_link_clicked",
  "qr_scanned", "short_link_clicked", "saved_listing", "compare_used",
]);

// POST /api/growth/track-event — log a client-originated growth event.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const eventType = String(body.event_type ?? "");
  if (!CLIENT_EVENTS.has(eventType)) {
    return Response.json({ ok: false, error: "Unsupported event type." }, { status: 400 });
  }

  const str = (v: unknown) => (v ? String(v) : null);
  const ok = await logGrowthEvent({
    event_type: eventType,
    user_id: str(body.user_id),
    session_id: str(body.session_id),
    asset_id: str(body.asset_id),
    share_link_id: str(body.share_link_id),
    referral_code: str(body.referral_code),
    entity_type: str(body.entity_type),
    entity_id: str(body.entity_id),
    channel: str(body.channel),
    state: str(body.state),
    district: str(body.district),
    taluka: str(body.taluka),
    land_type: str(body.land_type),
    metadata: body.metadata && typeof body.metadata === "object" ? (body.metadata as Record<string, unknown>) : {},
  });

  return Response.json({ ok });
}
