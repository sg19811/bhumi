import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

export default async function Listings() {
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-800">
          Bhūmi
        </Link>
        <Link
          href="/listing/new"
          className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
        >
          + List your land
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">All listings</h1>
        <p className="text-gray-500 mb-8">
          {listings?.length ?? 0} properties available
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            Could not load listings: {error.message}
          </div>
        )}

        {(!listings || listings.length === 0) && !error && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">
              No listings yet. Be the first to list your land!
            </p>
            <Link
              href="/listing/new"
              className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
            >
              Create a listing
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings?.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-400 text-sm">
                Photo coming soon
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-lg leading-tight">
                    {listing.title}
                  </h2>
                  {listing.is_verified && (
                    <span className="ml-2 shrink-0 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <p className="text-2xl font-bold text-green-800 mb-1">
                  ₹{Number(listing.price).toLocaleString("en-IN")}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    {listing.price_basis === "per_acre"
                      ? "/ acre"
                      : listing.price_basis === "per_guntha"
                        ? "/ guntha"
                        : listing.price_basis === "per_sqft"
                          ? "/ sq ft"
                          : "total"}
                  </span>
                </p>

                <p className="text-sm text-gray-500 mb-3">
                  {listing.area_value} {listing.area_unit} ·{" "}
                  {listing.land_type?.replace(/_/g, " ")} ·{" "}
                  {[listing.village, listing.taluka, listing.district]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                <div className="flex flex-wrap gap-2 text-xs">
                  {listing.water_source && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      💧 {listing.water_source}
                    </span>
                  )}
                  {listing.road_access && (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded">
                      🛣️ {listing.road_access}
                    </span>
                  )}
                  {listing.electricity && (
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                      ⚡ Electricity
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
