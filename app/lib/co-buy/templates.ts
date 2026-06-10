// Message-template interpolation. Replaces {{key}} with values; leaves unknown
// variables as a visible placeholder so the admin notices and fills them manually.
export function interpolateTemplate(body: string, vars: Record<string, string | number | null | undefined>): string {
  return body.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v !== undefined && v !== null && v !== "" ? String(v) : `[${key}]`;
  });
}

// Default templates seeded operationally (or insert via SQL). Keys match the spec.
export const DEFAULT_TEMPLATE_KEYS = [
  "co_buy_interest_acknowledgement", "site_visit_invitation", "legal_review_reminder",
  "service_estimate_message", "circle_welcome", "document_request", "milestone_update", "follow_up_after_call",
];
