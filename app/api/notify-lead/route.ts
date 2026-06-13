import { sendEmail, escapeHtml, founderRecipient } from "@/app/lib/email";

export const dynamic = "force-dynamic";

const BASE = "https://acrehubindia.com";

// Lead tables we alert on, with a human label and the fields worth showing.
// Anything not listed is ignored, so wiring an extra table's webhook is harmless.
const LEAD_META: Record<string, { subject: string; fields: [string, string][] }> = {
  inquiries: { subject: "New buyer inquiry", fields: [["Message", "message"], ["Phone", "contact_phone"], ["Listing", "listing_id"]] },
  buyer_interests: { subject: "New buyer requirement", fields: [["Intent", "intent"], ["Budget min", "budget_min"], ["Budget max", "budget_max"], ["District", "preferred_district"], ["Land types", "land_types"], ["Notes", "notes"], ["Phone", "contact_phone"]] },
  legal_inquiries: { subject: "New 'talk to a lawyer' request", fields: [["Name", "name"], ["Phone", "phone"], ["Email", "email"], ["State", "state"], ["Reason", "reason"], ["Urgency", "urgency"], ["Concern", "legal_concern"], ["From page", "source_page"]] },
  site_visit_requests: { subject: "New site-visit request", fields: [["Name", "name"], ["Phone", "phone"], ["Listing", "listing_id"], ["Preferred date", "preferred_date"], ["Notes", "notes"]] },
  verification_requests: { subject: "New listing verification request", fields: [["Listing", "listing_id"], ["Notes", "notes"]] },
};

function fmt(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (Array.isArray(v)) return v.length ? escapeHtml(v.join(", ")) : null;
  if (typeof v === "number") return v.toLocaleString("en-IN");
  return escapeHtml(String(v));
}

function buildHtml(table: string, record: Record<string, unknown>): string {
  const meta = LEAD_META[table];
  const rows = meta.fields
    .map(([label, key]) => [label, fmt(record[key])] as const)
    .filter(([, v]) => v !== null)
    .map(([label, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#8a8473;vertical-align:top">${label}</td><td style="padding:4px 0;color:#1d1b14">${v}</td></tr>`)
    .join("");
  const listingId = record.listing_id;
  const listingLink = listingId ? `<p><a href="${BASE}/listing/${escapeHtml(listingId)}" style="color:#445626;font-weight:600">View the listing →</a></p>` : "";
  return `<div style="font-family:Arial,sans-serif;color:#1d1b14;max-width:560px">
    <h2 style="color:#38461f">${escapeHtml(meta.subject)}</h2>
    <table style="border-collapse:collapse;font-size:14px">${rows || "<tr><td>(no details)</td></tr>"}</table>
    ${listingLink}
    <p><a href="${BASE}/admin" style="color:#445626;font-weight:600">Open the admin dashboard →</a></p>
    <p style="color:#8a8473;font-size:12px;margin-top:24px">Automated lead alert from AcreHub.</p>
  </div>`;
}

export async function POST(request: Request) {
  // Auth: Supabase DB Webhooks can send a custom header / we also accept ?key=.
  const secret = process.env.LEAD_WEBHOOK_SECRET || process.env.CRON_SECRET;
  if (secret) {
    const key = new URL(request.url).searchParams.get("key");
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}` && key !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let payload: { type?: string; table?: string; record?: Record<string, unknown> };
  try {
    payload = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { type, table, record } = payload;
  if (type !== "INSERT" || !table || !record || !LEAD_META[table]) {
    // Not a lead insert we care about — acknowledge so Supabase doesn't retry.
    return Response.json({ ok: true, skipped: true });
  }

  const sent = await sendEmail({
    to: founderRecipient(),
    subject: `${LEAD_META[table].subject} — AcreHub`,
    html: buildHtml(table, record),
  });

  return Response.json({ ok: true, table, emailed: sent });
}
