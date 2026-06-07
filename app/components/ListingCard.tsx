import Link from "next/link";

function priceBasisLabel(basis?: string) {
  return basis === "per_acre"
    ? "/ acre"
    : basis === "per_guntha"
      ? "/ guntha"
      : basis === "per_sqft"
        ? "/ sq ft"
        : "total";
}

/**
 * Shared listing card used across Explore, Saved and Listings so every
 * surface presents land the same way. Pure presentational — links to the
 * listing detail page exactly as the inline cards did before.
 */
export default function ListingCard({ listing }: { listing: any }) {
  const photo = listing.photos?.[0];
  const location = [listing.village, listing.taluka, listing.district].filter(Boolean).join(", ");

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-green-50">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-green-700/40">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21v-8m0 0c0-3.5 2.2-6.5 6-7.2C18 9.5 15.8 13 12 13Zm0 0C8.2 13 6 9.8 6 6.4 9.8 7 12 9.6 12 13Z" />
            </svg>
            <span className="text-xs font-medium">Photo coming soon</span>
          </div>
        )}
        {listing.is_verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-green-800 shadow-sm backdrop-blur">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-gray-900 group-hover:text-green-800">
          {listing.title}
        </h3>
        <p className="mt-1.5 text-xl font-bold text-green-800">
          ₹{Number(listing.price).toLocaleString("en-IN")}
          <span className="ml-1 text-sm font-normal text-gray-500">{priceBasisLabel(listing.price_basis)}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {listing.area_value} {listing.area_unit}
          {listing.land_type ? ` · ${listing.land_type.replace(/_/g, " ")}` : ""}
          {location ? ` · ${location}` : ""}
        </p>

        {(listing.water_source || listing.road_access || listing.electricity) && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {listing.water_source && (
              <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">💧 {listing.water_source}</span>
            )}
            {listing.road_access && (
              <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">🛣️ {listing.road_access}</span>
            )}
            {listing.electricity && (
              <span className="rounded-md bg-yellow-50 px-2 py-1 text-yellow-700">⚡ Electricity</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
