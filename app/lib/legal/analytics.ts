// Lightweight analytics shim for the Legal Navigator.
// Zero dependencies: if PostHog is ever loaded (window.posthog), events flow to
// it; otherwise this is a no-op. Event + property names match spec section 13.
//
// To enable later: add the PostHog snippet/loader (a separate, approved change)
// and these calls start reporting automatically — no edits needed here.

type Props = Record<string, unknown>;

export type LegalEvent =
  | "legal_hub_viewed"
  | "legal_wizard_started"
  | "legal_wizard_step_completed"
  | "legal_wizard_abandoned"
  | "legal_wizard_completed"
  | "legal_result_shared"
  | "legal_state_page_viewed"
  | "legal_article_viewed"
  | "legal_checklist_generated"
  | "legal_dd_step_completed"
  | "legal_lawyer_card_clicked"
  | "legal_service_card_clicked"
  | "legal_lead_captured"
  | "legal_lawyer_cta_clicked"
  | "legal_disclaimer_expanded";

export function track(event: LegalEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;
  const ph = (window as unknown as { posthog?: { capture: (e: string, p?: Props) => void } }).posthog;
  try {
    ph?.capture(event, props);
  } catch {
    // never let analytics break the page
  }
}

// Read UTM params from the current URL for attribution on lead capture.
export function readUtm(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
    const v = p.get(k);
    if (v) out[k] = v;
  }
  return out;
}
