import { MetadataRoute } from "next";
import { supabase } from "@/app/lib/supabase";

const BASE = "https://bhumi.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: listings } = await supabase.from("listings").select("id, updated_at").eq("status", "active");

  const staticPages = ["", "/explore", "/listings", "/buy", "/requirements", "/eligibility", "/about", "/how-it-works", "/faq", "/tools/area-converter", "/privacy", "/terms", "/listing/new"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));

  const listingPages = (listings ?? []).map((l) => ({
    url: `${BASE}/listing/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
  }));

  return [...staticPages, ...listingPages];
}
