// Client helper: run the server-side listing validation gate before writing.
// Returns null when valid (or when the gate itself is unreachable — fail-open so a
// gate outage can't block the core create/edit flow), or a combined message on a
// real 422 validation failure.
export async function validateListingPayload(payload: unknown): Promise<string | null> {
  try {
    const res = await fetch("/api/listings/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return null;
    if (res.status === 422) {
      const data = await res.json().catch(() => ({}));
      const fieldErrors = (data?.fieldErrors ?? {}) as Record<string, string>;
      const msgs = Object.values(fieldErrors);
      return msgs.length ? msgs.join(" · ") : "Please check the highlighted fields.";
    }
    return null; // unexpected status — don't block the core flow
  } catch {
    return null; // network/gate failure — fail open
  }
}
