import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

// Is this phone number already attached to an account? The signup form calls this
// before creating the account, so it can show a friendly "use another number"
// warning. Anon users can't read other people's profiles under RLS, so the check
// must run server-side with the service-role client.
// Note: this only gates NEW signups — existing accounts are left as-is (no
// retroactive constraint), which is why there's no DB unique index on phone.
export async function POST(request: Request) {
  let phone = "";
  try {
    const body = (await request.json()) as { phone?: string };
    phone = String(body?.phone ?? "").replace(/\D/g, ""); // digits only
  } catch {
    return NextResponse.json({ available: true });
  }
  if (!phone) return NextResponse.json({ available: true });

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("phone", phone)
    .limit(1);

  // Fail open on a lookup error so a check outage can't block signups.
  if (error) return NextResponse.json({ available: true });
  return NextResponse.json({ available: (data?.length ?? 0) === 0 });
}
