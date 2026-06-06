import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import MapLoader from "@/app/components/MapLoader";

export default async function Explore() {
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const markers = (listings ?? []).map((l) => ({
    id: l.id,
    latitude: l.latitude,
    longitude: l.longitude,
    title: l.title,
    price: l.price,
    area_value: l.area_value,
    area_unit: l.area_unit,
  }));

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-800">Bhūmi</Link>
        <div className="flex gap-4">
          <Link href="/buy" className="text-sm text-gray-600 hover:text-green-700">
            I want to buy
          </Link>
          <Link
            href="/listing/new"
            className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
          >
            + List your land
          </Link>
        </div>
      </header>

      <div className="h-[450px] border-b">
        <MapLoader markers={markers} zoom={9} height="450px" />    
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold mb-1">
          {markers.length} {markers.length === 1 ? "listing" : "listings"} found
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Click a map pin to see details, or browse below.
        </p>

        {markers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">
              No listings in this area yet.
            </p>
            <Link
              href="/buy"
              className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
            >
              Tell us what you&apos;re looking for
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(listings ?? []).map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow block"
            >
              <div className="bg-gray-100 h-32 flex items-center justify-center text-gray-400 text-sm">
                Photo coming soon
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold leading-tight">{listing.title}</h3>
                  {listing.is_verified && (
                    <span className="ml-2 shrink-0 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-green-800">
                  ₹{Number(listing.price).toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-gray-500">
                  {listing.area_value} {listing.area_unit} ·{" "}
                  {listing.land_type?.replace(/_/g, " ")} ·{" "}
                  {[listing.village, listing.taluka, listing.district]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
