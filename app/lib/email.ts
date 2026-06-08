// Server-only email helper (Resend). NEVER import into a "use client" file.
// All founder-facing alerts default to isha@acrehubindia.com (override with the
// FOUNDER_EMAIL env var). Sending is a no-op unless RESEND_API_KEY is set, so the
// app stays quiet in local/dev without keys.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** The address every app alert/notification is sent to. */
export function founderRecipient(): string {
  return process.env.FOUNDER_EMAIL || "isha@acrehubindia.com";
}

export function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

/**
 * Send one email via Resend. Returns true if accepted, false if skipped
 * (no API key / no recipient) or on error — callers can treat false as "not sent".
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL || "AcreHub <onboarding@resend.dev>";
  if (!resendKey || !to) return false;
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
