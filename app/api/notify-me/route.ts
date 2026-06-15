import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { sendEmail, founderRecipient, escapeHtml } from "@/app/lib/email";
import { landLabel } from "@/app/lib/land";

export const dynamic = "force-dynamic";

// "Be first to know about new land" sign-up. Saves the demand signal AND emails
// the team so they can act on it. Best-effort email — a failure never blocks the
// sign-up (the signal is still saved and visible in admin).
export async function POST(req: Request) {
  let body: { contact?: unknown; district?: unknown; land_type?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const contact = String(body.contact ?? "").trim();
  if (!contact) return Response.json({ ok: false, error: "Contact is required." }, { status: 400 });

  const district = body.district ? String(body.district).trim() : null;
  const land_type = body.land_type ? String(body.land_type).trim() : null;

  const { error } = await db.from("demand_signals").insert({ district, land_type, contact });
  if (error) return Response.json({ ok: false, error: "Couldn't save. Please try again." }, { status: 500 });

  const html = `<div style="font-family:Arial,sans-serif;color:#1d1b14;max-width:560px">
    <h2 style="color:#38461f">New "notify me" land request</h2>
    <table style="border-collapse:collapse;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0;color:#8a8473">Looking for</td><td style="padding:4px 0;color:#1d1b14">${escapeHtml(land_type ? landLabel(land_type) : "Any land")}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#8a8473">Where</td><td style="padding:4px 0;color:#1d1b14">${escapeHtml(district || "Anywhere")}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#8a8473">Contact</td><td style="padding:4px 0;color:#1d1b14">${escapeHtml(contact)}</td></tr>
    </table>
    <p style="margin-top:16px;color:#1d1b14">They asked to be notified when matching land is listed. See all signals at <a href="https://acrehubindia.com/admin" style="color:#445626;font-weight:600">acrehubindia.com/admin</a>.</p>
  </div>`;
  await sendEmail({ to: founderRecipient(), subject: "New 'notify me' land request — AcreHub", html });

  return Response.json({ ok: true });
}
