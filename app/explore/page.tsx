import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import SearchFilters from "@/app/components/SearchFilters";
import SearchLogger from "@/app/components/SearchLogger";
import SavedSearches from "@/app/components/SavedSearches";
import ActiveFilters from "@/app/components/ActiveFilters";
import ExploreSplit from "@/app/components/ExploreSplit";
import NotifyMe from "@/app/components/NotifyMe";
import { cleanSearchTerm } from "@/app/lib/search";
import { districtsForState } from "@/app/lib/legal/districts";
import { getLocale } from "@/app/lib/i18n-server";
import { t as translate } from "@/app/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore agricultural land for sale — AcreHub",
  description: "Browse verified farmland, orchards, and farmhouse plots on a map. Filter by budget, land type, water, and road access.",
};

export default async function Explore({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const t = (k: string) => translate(locale, k);
  const sortMap: Record<string, { col: string; asc: boolean }> = {
    price_asc: { col: "price", asc: true },
    price_desc: { col: "price", asc: false },
    area_desc: { col: "area_value", asc: false },
  };
  const sort = sp.sort && sortMap[sp.sort] ? sortMap[sp.sort] : { col: "created_at", asc: false };

  let query = supabase.from("listings").select("*").eq("status", "active");
  const term = cleanSearchTerm(sp.q);
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,district.ilike.%${term}%,taluka.ilike.%${term}%,village.ilike.%${term}%`);
  if (sp.land_type) query = query.eq("land_type", sp.land_type);
  if (sp.min_price) query = query.gte("price", Number(sp.min_price));
  if (sp.max_price) query = query.lte("price", Number(sp.max_price));
  if (sp.max_area) query = query.lte("area_value", Number(sp.max_area));
  if (sp.water_source) query = query.eq("water_source", sp.water_source);
  if (sp.road_access) query = query.eq("road_access", sp.road_access);
  if (sp.verified === "true") query = query.eq("is_verified", true);
  if (sp.co_buy === "1") query = query.eq("is_co_buy_eligible", true);
  // Location: state (maps to its districts), district, taluka.
  if (sp.state) {
    const ds = districtsForState(sp.state);
    if (ds.length) query = query.or(ds.map((d) => `district.ilike.${d}`).join(","));
  }
  const districtTerm = cleanSearchTerm(sp.district);
  if (districtTerm) query = query.ilike("district", `%${districtTerm}%`);
  const talukaTerm = cleanSearchTerm(sp.taluka);
  if (talukaTerm) query = query.ilike("taluka", `%${talukaTerm}%`);
  query = query.order(sort.col, { ascending: sort.asc });
  const { data: listings } = await query;

  const markers = (listings ?? []).map((l) => ({ id: l.id, latitude: l.latitude, longitude: l.longitude, title: l.title, price: l.price, area_value: l.area_value, area_unit: l.area_unit }));

  // Build district/taluka dropdown options from districts/talukas that actually
  // exist in active listings (so the filters never offer a zero-result location).
  const { data: locRows } = await supabase.from("listings").select("district, taluka").eq("status", "active");
  const districtDisplay = new Map<string, string>(); // lowercase key → display name
  const talukaSets = new Map<string, Map<string, string>>(); // district key → (taluka key → display)
  for (const r of locRows ?? []) {
    const d = (r.district ?? "").trim();
    const tk = (r.taluka ?? "").trim();
    if (!d) continue;
    const dk = d.toLowerCase();
    if (!districtDisplay.has(dk)) districtDisplay.set(dk, d);
    if (tk) {
      const m = talukaSets.get(dk) ?? new Map<string, string>();
      if (!m.has(tk.toLowerCase())) m.set(tk.toLowerCase(), tk);
      talukaSets.set(dk, m);
    }
  }
  const byName = (a: string, b: string) => a.localeCompare(b);
  const districtOptions = [...districtDisplay.values()].sort(byName);
  const talukasByDistrict: Record<string, string[]> = {};
  for (const [dk, m] of talukaSets) talukasByDistrict[dk] = [...m.values()].sort(byName);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SearchLogger />
      <Header />
      <SearchFilters districtOptions={districtOptions} talukasByDistrict={talukasByDistrict} />
      {sp.q && <p className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm text-gray-500">{t("explore.resultsFor")}: &quot;{sp.q}&quot;</p>}
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        <h2 className="text-xl font-semibold">{markers.length} {t("explore.found")}</h2>
        <p className="mb-5 mt-0.5 text-sm text-gray-500">{t("explore.sub")}</p>
        <ActiveFilters />
        <SavedSearches />

        {markers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-lg text-gray-400">{t("explore.emptyTitle")}</p>
            <Link href="/buy" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">{t("explore.emptyCta")}</Link>
            <NotifyMe
              district={sp.q || sp.district}
              landType={sp.land_type}
              prompt={`No matches${sp.q ? ` for "${sp.q}"` : ""} yet — get notified the moment land like this is listed.`}
            />
          </div>
        ) : (
          <ExploreSplit listings={listings ?? []} markers={markers} />
        )}
      </main>
    </div>
  );
}
