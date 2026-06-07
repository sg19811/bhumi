import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import SearchFilters from "@/app/components/SearchFilters";
import SearchLogger from "@/app/components/SearchLogger";
import MapLoader from "@/app/components/MapLoader";
import ListingCard from "@/app/components/ListingCard";

export default async function Explore({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const sp = await searchParams;
  let query = supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false });
  if (sp.q) query = query.or(`title.ilike.%${sp.q}%,district.ilike.%${sp.q}%,taluka.ilike.%${sp.q}%,village.ilike.%${sp.q}%`);
  if (sp.land_type) query = query.eq("land_type", sp.land_type);
  if (sp.max_price) query = query.lte("price", Number(sp.max_price));
  if (sp.max_area) query = query.lte("area_value", Number(sp.max_area));
  if (sp.verified === "true") query = query.eq("is_verified", true);
  const { data: listings } = await query;

  const markers = (listings ?? []).map((l) => ({ id: l.id, latitude: l.latitude, longitude: l.longitude, title: l.title, price: l.price, area_value: l.area_value, area_unit: l.area_unit }));

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SearchLogger />
      <Header />
      <SearchFilters />
      {sp.q && <p className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm text-gray-500">Results for &quot;{sp.q}&quot;</p>}
      <div className="h-[380px] border-b border-gray-200 sm:h-[420px]"><MapLoader markers={markers} zoom={9} height="100%" /></div>
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
        <h2 className="text-xl font-semibold">{markers.length} {markers.length === 1 ? "listing" : "listings"} found</h2>
        <p className="mb-6 mt-0.5 text-sm text-gray-500">Click a pin for details, or browse below.</p>
        {markers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-lg text-gray-400">No listings match your search.</p>
            <Link href="/buy" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Tell us what you want</Link>
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(listings ?? []).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>
    </div>
  );
}
