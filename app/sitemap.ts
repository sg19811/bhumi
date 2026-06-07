import { MetadataRoute } from "next";
import { supabase } from "@/app/lib/supabase";

const BASE = "https://bhumi.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: listings } = await supabase.from("listings").select("id, updated_at, district, land_type").eq("status", "active");

  const staticPages = ["", "/explore", "/listings", "/buy", "/requirements", "/legal", "/legal/wizard", "/legal/checklist", "/legal/due-diligence", "/legal/lawyers", "/legal/services", "/legal/articles", "/legal/compare", "/legal/talk-to-lawyer", "/about", "/how-it-works", "/faq", "/tools", "/tools/area-converter", "/tools/emi-calculator", "/privacy", "/terms", "/listing/new"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));

  // Published legal content (drafts are excluded by RLS on the anon client).
  const [{ data: legalStates }, { data: legalArticles }] = await Promise.all([
    supabase.from("legal_state_rules").select("state, updated_at").eq("published", true),
    supabase.from("legal_articles").select("slug, updated_at").eq("published", true),
  ]);
  const legalStatePages = (legalStates ?? []).map((s) => ({
    url: `${BASE}/legal/state/${encodeURIComponent(s.state)}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
  }));
  const legalArticlePages = (legalArticles ?? []).map((a) => ({
    url: `${BASE}/legal/articles/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
  }));

  const listingPages = (listings ?? []).map((l) => ({
    url: `${BASE}/listing/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
  }));

  const districts = [...new Set((listings ?? []).map((l) => l.district).filter(Boolean))];
  const regionPages = districts.map((d) => ({
    url: `${BASE}/region/${encodeURIComponent(d)}`,
    lastModified: new Date(),
  }));

  const landTypes = [...new Set((listings ?? []).map((l) => l.land_type).filter(Boolean))];
  const landPages = landTypes.map((t) => ({
    url: `${BASE}/land/${encodeURIComponent(t)}`,
    lastModified: new Date(),
  }));

  // District × land-type combos that actually have listings (long-tail SEO).
  const pairs = [...new Set((listings ?? []).filter((l) => l.district && l.land_type).map((l) => `${l.district}|||${l.land_type}`))];
  const comboPages = pairs.map((p) => {
    const [d, t] = p.split("|||");
    return { url: `${BASE}/region/${encodeURIComponent(d)}/${encodeURIComponent(t)}`, lastModified: new Date() };
  });

  return [...staticPages, ...legalStatePages, ...legalArticlePages, ...regionPages, ...landPages, ...comboPages, ...listingPages];
}
