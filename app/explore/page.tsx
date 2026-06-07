import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import SearchFilters from "@/app/components/SearchFilters";
import SearchLogger from "@/app/components/SearchLogger";
import SavedSearches from "@/app/components/SavedSearches";
import ActiveFilters from "@/app/components/ActiveFilters";
import ExploreSplit from "@/app/components/ExploreSplit";
import { cleanSearchTerm } from "@/app/lib/search";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore agricultural land for sale — Bhūmi",
  description: "Browse verified farmland, orchards, and farmhouse plots on a map. Filter by budget, land type, water, and road access.",
};

export default async function Explore({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const sp = await searchParams;
  const sortMap: Record<string, { col: string; asc: boolean }> = {
    price_asc: { col: "price", asc: true },
    price_desc: { col: "price", asc: false },
    area_desc: { col: "area_value", asc: false },
  };
  const sort = sp.sort && sortMap[sp.sort] ? sortMap[sp.sort] : { col: "created_at", asc: false };

  let query = supabase.from("listings").select("*").eq("status", "active");
  const term = cleanSearchTerm(sp.q);
  if (term) query = query.or(`title.ilike.%${term}%,district.ilike.%${term}%,taluka.ilike.%${term}%,village.ilike.%${term}%`);
  if (sp.land_type) query = query.eq("land_type", sp.land_type);
  if (sp.min_price) query = query.gte("price", Number(sp.min_price));
  if (sp.max_price) query = query.lte("price", Number(sp.max_price));
  if (sp.max_area) query = query.lte("area_value", Number(sp.max_area));
  if (sp.water_source) query = query.eq("water_source", sp.water_source);
  if (sp.road_access) query = query.eq("road_access", sp.road_access);
  if (sp.verified === "true") query = query.eq("is_verified", true);
  query = query.order(sort.col, { ascending: sort.asc });
  const { data: listings } = await query;

  const markers = (listings ?? []).map((l) => ({ id: l.id, latitude: l.latitude, longitude: l.longitude, title: l.title, price: l.price, area_value: l.area_value, area_unit: l.area_unit }));

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SearchLogger />
      <Header />
      <SearchFilters />
      {sp.q && <p className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm text-gray-500">Results for &quot;{sp.q}&quot;</p>}
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        <h2 className="text-xl font-semibold">{markers.length} {markers.length === 1 ? "listing" : "listings"} found</h2>
        <p className="mb-5 mt-0.5 text-sm text-gray-500">Click a pin for details, or browse the list.</p>
        <ActiveFilters />
        <SavedSearches />

        {markers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-lg text-gray-400">No listings match your search.</p>
            <Link href="/buy" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Tell us what you want</Link>
          </div>
        ) : (
          <ExploreSplit listings={listings ?? []} markers={markers} />
        )}
      </main>
    </div>
  );
}
