import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { AGENT_TYPES, type AgentType } from "@/app/lib/agent-types";

export const dynamic = "force-dynamic";

// Standard error shape (spec section 5): { error: { code, message } }
function fail(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

// Normalize an Indian phone to +91XXXXXXXXXX where possible.
function normalizePhone(raw: unknown): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 10) return `+91${d}`;
  if (d.length === 12 && d.startsWith("91")) return `+${d}`;
  if (d.length === 11 && d.startsWith("0")) return `+91${d.slice(1)}`;
  return d ? `+${d}` : "";
}

// kebab-case name + short random suffix (collision-resistant slug).
function slugify(name: string): string {
  const base =
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "agent";
  const suffix = Math.random().toString(16).slice(2, 8);
  return `${base}-${suffix}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_INPUT", "Invalid request.", 400);
  }

  // Ethics acknowledgement must be exactly boolean true.
  if (body.ethics_acknowledged !== true) {
    return fail("ETHICS_NOT_ACKNOWLEDGED", "Please accept the agent ethics commitment to continue.", 400);
  }

  const name = String(body.name ?? "").trim();
  const phone = normalizePhone(body.phone);
  const state = String(body.state ?? "").trim();
  const district = String(body.district ?? "").trim();
  const agentType = String(body.agent_type ?? "").trim();

  if (name.length < 2 || name.length > 100) {
    return fail("INVALID_INPUT", "Please enter your full name.", 400);
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return fail("INVALID_INPUT", "Please enter a valid phone number.", 400);
  }
  if (!state || !district) {
    return fail("INVALID_INPUT", "State and district are required.", 400);
  }
  if (!AGENT_TYPES.includes(agentType as AgentType)) {
    return fail("INVALID_INPUT", "Please choose what kind of agent you are.", 400);
  }

  const { data: inserted, error } = await db
    .from("agent_profiles")
    .insert({
      slug: slugify(name),
      name,
      phone,
      whatsapp: body.whatsapp ? normalizePhone(body.whatsapp) : null,
      email: body.email ? String(body.email).trim() : null,
      state,
      district,
      taluka: body.taluka ? String(body.taluka).trim() : null,
      agent_type: agentType,
      bio: body.bio ? String(body.bio).trim().slice(0, 500) : null,
      profile_status: "draft",
      verification_status: "pending_review",
      trust_tier: 1,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    // Unique violation on phone → already registered.
    if (error.code === "23505" && /phone/i.test(error.message ?? "")) {
      return fail("PHONE_EXISTS", "This phone number is already registered as an agent.", 409);
    }
    return fail("INSERT_FAILED", "Couldn't submit your application. Please try again.", 500);
  }

  return Response.json({ application_id: inserted?.id, status: "pending_review" });
}
