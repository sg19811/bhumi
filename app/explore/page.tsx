import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import SearchFilters from "@/app/components/SearchFilters";
import SearchLogger from "@/app/components/SearchLogger";
import MapLoader from "@/app/components/MapLoader";

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
      {sp.q && <p className="px-6 py-2 text-sm text-gray-500 bg-gray-50">Results for &quot;{sp.q}&quot;</p>}
      <div className="h-[400px] border-b"><MapLoader markers={markers} zoom={9} height="400px" /></div>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold mb-1">{markers.length} {markers.length === 1 ? "listing" : "listings"} found</h2>
        <p className="text-sm text-gray-500 mb-6">Click a pin for details, or browse below.</p>
        {markers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No listings match your search.</p>
            <Link href="/buy" className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">Tell us what you want</Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(listings ?? []).map((listing) => (
            <Link key={listing.id} href={`/listing/${listing.id}`} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow block">
              <div className="bg-gray-100 h-32 flex items-center justify-center text-gray-400 text-sm">
                {listing.photos?.length > 0 ? <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" /> : "Photo coming soon"}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold leading-tight">{listing.title}</h3>
                  {listing.is_verified && <span className="ml-2 shrink-0 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">✓ Verified</span>}
                </div>
                <p className="text-lg font-bold text-green-800">₹{Number(listing.price).toLocaleString("en-IN")}<span className="text-sm font-normal text-gray-500 ml-1">{listing.price_basis === "per_acre" ? "/ acre" : listing.price_basis === "per_guntha" ? "/ guntha" : "total"}</span></p>
                <p className="text-sm text-gray-500">{listing.area_value} {listing.area_unit} · {listing.land_type?.replace(/_/g, " ")} · {[listing.village, listing.taluka, listing.district].filter(Boolean).join(", ")}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
