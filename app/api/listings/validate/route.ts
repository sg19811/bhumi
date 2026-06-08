import { NextResponse } from "next/server";
import { validateListing } from "@/app/lib/validation/listing";

export const dynamic = "force-dynamic";

// Server-side validation gate for listing create/edit. The create/edit forms POST
// the listing payload here before writing; invalid payloads come back with
// per-field messages the form surfaces. (Validation runs server-side regardless of
// the client; enforcing it at the write boundary is a documented follow-up.)
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body" }, { status: 400 });
  }
  const { ok, fieldErrors } = validateListing(body);
  if (ok) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false, fieldErrors }, { status: 422 });
}
