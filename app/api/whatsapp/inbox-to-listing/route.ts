import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { getUserId } from "@/app/lib/ai/require-user";
import { cleanSurveyNumber, type ListingDraft } from "@/app/lib/whatsapp-to-listing";

export const dynamic = "force-dynamic";

const BASE = "https://acrehubindia.com";

function fail(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

async function adminUserId(req: Request): Promise<string | null> {
  const userId = await getUserId(req);
  if (!userId) return null;
  const { data } = await db.from("profiles").select("role").eq("user_id", userId).maybeSingle();
  return data?.role === "admin" ? userId : null;
}

export async function POST(req: Request) {
  const userId = await adminUserId(req);
  if (!userId) return fail("UNAUTHORIZED", "Admins only.", 401);

  let body: { inbox_id?: string; listing_data?: Partial<ListingDraft> };
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_DATA", "Invalid request.", 400);
  }

  const inboxId = String(body.inbox_id ?? "");
  const d = body.listing_data ?? {};
  if (!inboxId) return fail("INVALID_DATA", "Missing inbox_id.", 400);
  if (!d.title || !d.district) return fail("INVALID_DATA", "Title and district are required.", 400);

  // Inbox row must exist and not already be published.
  const { data: inbox } = await db
    .from("whatsapp_inbox")
    .select("id, agent_id, resulting_listing_id")
    .eq("id", inboxId)
    .maybeSingle();
  if (!inbox) return fail("INBOX_NOT_FOUND", "That inbox message no longer exists.", 404);
  if (inbox.resulting_listing_id) return fail("ALREADY_PUBLISHED", "This message was already published.", 409);

  // 1. Insert the listing.
  const { data: listing, error: insertErr } = await db
    .from("listings")
    .insert({
      owner_user_id: null,
      agent_id: inbox.agent_id,
      source_type: "whatsapp",
      inbox_id: inboxId,
      status: "active",
      title: d.title,
      description: d.description ?? "",
      land_type: d.land_type ?? "other",
      price: d.price ?? null,
      price_basis: d.price_basis ?? "total",
      area_value: d.area_value ?? null,
      area_unit: d.area_unit ?? "acre",
      district: d.district,
      taluka: d.taluka || null,
      village: d.village || null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      water_source: d.water_source || null,
      road_access: d.road_access || null,
      electricity: !!d.electricity,
      survey_number_clean: cleanSurveyNumber(d.survey_number),
      location_visibility: d.location_visibility || "public",
      survey_number_visibility: d.survey_number_visibility || "qualified_buyer_only",
      land_record_id: d.land_record_id ?? null,
    })
    .select("id")
    .maybeSingle();

  if (insertErr || !listing) {
    return fail("INSERT_FAILED", "Couldn't create the listing. Please try again.", 500);
  }
  const listingId = listing.id;

  // 2. Link the agent as the primary agent (best-effort).
  if (inbox.agent_id) {
    await db.from("agent_listing_links").insert({
      agent_id: inbox.agent_id,
      listing_id: listingId,
      relationship: "primary_agent",
      is_primary: true,
    });
  }

  // 3. Mark the inbox row published.
  await db
    .from("whatsapp_inbox")
    .update({
      processed_status: "published",
      resulting_listing_id: listingId,
      processed_by: userId,
      processed_at: new Date().toISOString(),
    })
    .eq("id", inboxId);

  // 4. Record the event (best-effort).
  await db.from("agent_events").insert({
    agent_id: inbox.agent_id,
    event_type: "listing_published",
    listing_id: listingId,
    inbox_id: inboxId,
  });

  return Response.json({ listing_id: listingId, public_url: `${BASE}/listing/${listingId}` });
}
