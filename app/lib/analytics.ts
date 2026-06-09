// General-purpose client event tracking. Sends to GA4 (gtag) and PostHog if
// either is loaded; a no-op otherwise. Safe to call anywhere in client code —
// never throws, never blocks the page. Use for conversion events you'll want as
// goals in Google Analytics (e.g. listing_posted, requirement_posted).

type Props = Record<string, unknown>;

export function trackEvent(name: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      posthog?: { capture: (event: string, props?: Props) => void };
    };
    w.gtag?.("event", name, props);
    w.posthog?.capture(name, props);
  } catch {
    // analytics must never break the page
  }
}
