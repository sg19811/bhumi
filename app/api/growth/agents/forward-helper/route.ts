import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { generateShortCode, shortLinkUrl } from "@/app/lib/share-links";
import { renderNamedTemplate } from "@/app/lib/content-templates";

export const dynamic = "force-dynamic";

// POST /api/growth/agents/forward-helper
// Body: { listing_id, agent_user_id?, referral_code?, agent_name?,
//         groups: [{ id?, label }] }
// For each group, mints a distinct tracked short link (own utm_content so clicks
// are attributable per group) and returns a pre-filled wa.me URL the agent taps
// and sends manually. See growth-engine-spec-aggressive-v2.md §8.3 / §10.1.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const listingId = String(body.listing_id ?? "");
  const groups = Array.isArray(body.groups) ? (body.groups as Array<{ id?: string; label?: string }>) : [];
  if (!listingId || groups.length === 0) {
    return Response.json({ ok: false, error: "listing_id and at least one group are required." }, { status: 400 });
  }

  const { data: listing } = await db
    .from("listings")
    .select("id, title, price, price_basis, district, taluka, village, area_value, area_unit, land_type, is_verified")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) {
    return Response.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const targetUrl = `https://acrehubindia.com/listing/${listing.id}`;
  const referralCode = body.referral_code ? String(body.referral_code) : null;
  const agentUserId = body.agent_user_id ? String(body.agent_user_id) : null;
  const agentName = body.agent_name ? String(body.agent_name) : "Acrehub agent";

  const location = [listing.village || listing.taluka, listing.district].filter(Boolean).join(", ");
  const acreage = listing.area_value ? `${listing.area_value} ${listing.area_unit ?? ""}`.trim() : "";
  const priceText = listing.price ? `₹${Number(listing.price).toLocaleString("en-IN")}` : "";
  const trustLabel = listing.is_verified ? "Verified" : "Owner-listed";

  const shares: Array<{ share_group_label: string; wa_me_url: string; short_url: string }> = [];

  for (const g of groups) {
    const label = String(g.label ?? "").trim() || "Group";

    // Mint a tracked short link for this group (retry on code collision).
    let shortCode = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateShortCode();
      const { data, error } = await db
        .from("share_links")
        .insert({
          short_code: candidate,
          target_url: targetUrl,
          entity_type: "listing",
          entity_id: listing.id,
          referral_code: referralCode,
          channel: "agent_share",
          utm_source: "agent",
          utm_medium: "whatsapp",
          utm_campaign: "agent_forward",
          utm_content: label,
          created_by: agentUserId,
        })
        .select("short_code")
        .maybeSingle();
      if (!error && data) {
        shortCode = data.short_code;
        break;
      }
      if (error && error.code !== "23505") break;
    }
    if (!shortCode) continue; // skip this group rather than fail the whole batch

    const trackedUrl = shortLinkUrl(origin, shortCode);
    const text =
      (await renderNamedTemplate("agent_forward", {
        title: listing.title,
        location,
        acreage,
        price_per_acre: priceText,
        trust_label: trustLabel,
        tracked_url: trackedUrl,
        agent_name: agentName,
      })) ?? `${listing.title}\n${location}\n${trackedUrl}`;

    shares.push({
      share_group_label: label,
      wa_me_url: `https://wa.me/?text=${encodeURIComponent(text)}`,
      short_url: trackedUrl,
    });
  }

  return Response.json({ ok: true, shares });
}
