import { cookies } from "next/headers";
import { recordReferralEvent } from "@/app/lib/referrals";
import type { ReferralEventType } from "@/app/lib/growth-types";

export const dynamic = "force-dynamic";

// Event types a client may attribute (subset of the referral_events enum).
// Server-side flows (signup, agent-apply, co-buy) attribute directly instead.
const CLIENT_REFERRAL_EVENTS = new Set<ReferralEventType>([
  "requirement_submitted",
  "enquiry_submitted",
]);

// POST /api/growth/referrals/attribute — record a referral event for a
// client-side action, using the visitor's ref cookie. Best-effort.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const eventType = String(body.event_type ?? "") as ReferralEventType;
  if (!CLIENT_REFERRAL_EVENTS.has(eventType)) {
    return Response.json({ ok: false, error: "Unsupported event type." }, { status: 400 });
  }

  const ref = (await cookies()).get("ref")?.value;
  if (!ref) return Response.json({ ok: true, attributed: false }); // no referral to attribute

  const ok = await recordReferralEvent({
    referralCode: ref,
    eventType,
    entityType: body.entity_type ? String(body.entity_type) : null,
    entityId: body.entity_id ? String(body.entity_id) : null,
  });
  return Response.json({ ok, attributed: ok });
}
