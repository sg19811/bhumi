import { NextResponse } from "next/server";
import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { logGrowthEvent } from "@/app/lib/growth-events";

export const dynamic = "force-dynamic";

// GET /go/[shortCode] — resolve a tracked link: count the click, log a
// growth_event, drop the referral cookie, then redirect to the target.
// Next 16: params is a Promise and must be awaited.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;
  const origin = new URL(request.url).origin;

  const { data: link } = await db
    .from("share_links")
    .select("id, target_url, asset_id, referral_code, channel, utm_source, utm_medium, utm_campaign, expires_at")
    .eq("short_code", shortCode)
    .maybeSingle();

  // Unknown or expired link → send them somewhere useful rather than erroring.
  if (!link) return NextResponse.redirect(`${origin}/`, 302);
  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(`${origin}/`, 302);
  }

  // Count + log are best-effort; never block the redirect on analytics.
  await db.rpc("increment_share_link_clicks", { p_short_code: shortCode });
  await logGrowthEvent({
    event_type: "short_link_clicked",
    share_link_id: link.id,
    asset_id: link.asset_id,
    referral_code: link.referral_code,
    channel: link.channel,
    utm_source: link.utm_source,
    utm_medium: link.utm_medium,
    utm_campaign: link.utm_campaign,
  });

  const res = NextResponse.redirect(link.target_url, 302);
  // Carry the sharer's referral code forward for downstream attribution.
  if (link.referral_code) {
    res.cookies.set("ref", link.referral_code, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}
