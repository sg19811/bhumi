import { getAdminUserId } from "@/app/lib/ai/require-user";
import { findMatchingBuyers, type MatchInput } from "@/app/lib/agent-matching";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await getAdminUserId(req))) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Admins only." } }, { status: 401 });
  }
  let body: { listing_draft?: Partial<MatchInput>; limit?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: { code: "INVALID_REQUEST", message: "Invalid request." } }, { status: 400 });
  }

  const d = body.listing_draft ?? {};
  if (!d.district) {
    return Response.json({ matches: [] });
  }
  const matches = await findMatchingBuyers(
    {
      district: String(d.district),
      taluka: String(d.taluka ?? ""),
      land_type: String(d.land_type ?? "other"),
      acreage: Number(d.acreage) || 0,
      price_per_acre: d.price_per_acre ?? null,
    },
    body.limit ?? 3
  );
  return Response.json({ matches });
}
