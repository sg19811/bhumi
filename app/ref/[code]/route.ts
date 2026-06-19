import { NextResponse } from "next/server";
import { logGrowthEvent } from "@/app/lib/growth-events";
import { resolveReferrerUserId } from "@/app/lib/referrals";

export const dynamic = "force-dynamic";

// GET /ref/[code] — drop the referral cookie for a valid code, log the click,
// then redirect. Optional ?to=/internal/path (internal-only, no open redirect).
// Next 16: params is a Promise and must be awaited.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const reqUrl = new URL(request.url);
  const to = reqUrl.searchParams.get("to");
  const dest = to && to.startsWith("/") ? `${reqUrl.origin}${to}` : `${reqUrl.origin}/`;

  // Only honor codes that resolve to a real, active referrer.
  const referrer = await resolveReferrerUserId(code);
  if (!referrer) return NextResponse.redirect(dest, 302);

  await logGrowthEvent({
    event_type: "referral_link_clicked",
    referral_code: code,
    user_id: referrer,
    metadata: { dest },
  });

  const res = NextResponse.redirect(dest, 302);
  res.cookies.set("ref", code, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
  });
  return res;
}
