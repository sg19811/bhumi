import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { AGENT_TYPES, agentTypeLabel, type AgentType } from "@/app/lib/agent-types";
import { sendEmail, founderRecipient, escapeHtml } from "@/app/lib/email";

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

  // Notify the team (defaults to isha@acrehubindia.com). Best-effort: a failed/
  // unconfigured email never blocks the application — it still shows in admin.
  const html = `<div style="font-family:Arial,sans-serif;color:#1d1b14;max-width:560px">
    <h2 style="color:#38461f">New agent application</h2>
    <table style="border-collapse:collapse;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0;color:#8a8473">Name</td><td style="padding:4px 0;color:#1d1b14">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#8a8473">Phone</td><td style="padding:4px 0;color:#1d1b14">${escapeHtml(phone)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#8a8473">Location</td><td style="padding:4px 0;color:#1d1b14">${escapeHtml([district, state].filter(Boolean).join(", "))}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#8a8473">Agent type</td><td style="padding:4px 0;color:#1d1b14">${escapeHtml(agentTypeLabel(agentType))}</td></tr>
    </table>
    <p style="margin-top:16px;color:#1d1b14">Please go to <a href="https://acrehubindia.com/admin/agents/applications" style="color:#445626;font-weight:600">acrehubindia.com/admin/agents/applications</a> to verify.</p>
  </div>`;
  await sendEmail({ to: founderRecipient(), subject: "New agent application — AcreHub", html });

  return Response.json({ application_id: inserted?.id, status: "pending_review" });
}
