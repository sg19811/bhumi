// UTM helpers — pure URL building. Used by share-link creation and any
// place that needs an attributed link. See growth-engine-spec §4 (v1).

export interface UtmParams {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
}

/**
 * Append UTM params and an optional referral code to a URL, without
 * clobbering existing query params. Empty/nullish values are skipped.
 */
export function withUtm(url: string, utm: UtmParams = {}, ref?: string | null): string {
  const u = new URL(url);
  const set = (k: string, v?: string | null) => {
    if (v) u.searchParams.set(k, v);
  };
  set("utm_source", utm.source);
  set("utm_medium", utm.medium);
  set("utm_campaign", utm.campaign);
  set("utm_content", utm.content);
  set("ref", ref);
  return u.toString();
}
