import Link from "next/link";
import Image from "next/image";
import TrustScore from "@/app/components/TrustScore";
import CompareToggle from "@/app/components/CompareToggle";
import CardSaveButton from "@/app/components/CardSaveButton";
import { isProjectType } from "@/app/lib/farm-plots/types";
import { formatINR, formatINRShort, pricePerAcre } from "@/app/lib/format";

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
  const ppa = pricePerAcre(listing);
  const isNew = listing.created_at && Date.now() - new Date(listing.created_at).getTime() < 14 * 24 * 60 * 60 * 1000;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-green-50">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-green-700/40">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21v-8m0 0c0-3.5 2.2-6.5 6-7.2C18 9.5 15.8 13 12 13Zm0 0C8.2 13 6 9.8 6 6.4 9.8 7 12 9.6 12 13Z" />
            </svg>
            <span className="text-xs font-medium">Photo coming soon</span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <TrustScore listing={listing} variant="badge" />
        </div>
        <div className="absolute right-3 top-3">
          <CompareToggle id={listing.id} />
        </div>
        {isNew && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-green-800 shadow-sm backdrop-blur">
            New
          </span>
        )}
        <div className="absolute bottom-3 right-3">
          <CardSaveButton listingId={listing.id} />
        </div>
      </div>

      <div className="p-4">
        {isProjectType(listing.land_type) && (
          <p className="mb-1 flex flex-wrap items-center gap-x-1.5 text-xs">
            <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-800">Project</span>
            {listing.project_name && <span className="truncate text-gray-600">{listing.project_name}</span>}
            {listing.plot_count ? <span className="text-gray-400">· {listing.plot_count} plots</span> : null}
          </p>
        )}
        {listing.is_co_buy_eligible && (
          <p className="mb-1"><span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">👥 Buying Circle</span></p>
        )}
        <h3 className="line-clamp-2 font-semibold leading-snug text-gray-900 group-hover:text-green-800">
          {listing.title}
        </h3>
        <p className="mt-1.5 text-xl font-bold text-green-800" title={formatINR(listing.price)}>
          {formatINRShort(listing.price)}
          <span className="ml-1 text-sm font-normal text-gray-500">{priceBasisLabel(listing.price_basis)}</span>
        </p>
        {ppa && listing.price_basis !== "per_acre" && (
          <p className="text-xs text-gray-400">≈ {formatINRShort(ppa)} / acre</p>
        )}
        {listing.previous_price && Number(listing.previous_price) > Number(listing.price) && (
          <p className="text-xs"><span className="font-medium text-red-600">↓ Reduced</span> <span className="ml-1 text-gray-400 line-through">{formatINRShort(listing.previous_price)}</span></p>
        )}
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
