import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import MapLoader from "@/app/components/MapLoader";
import WhatsAppShare from "@/app/components/WhatsAppShare";
import OwnerEditLink from "@/app/components/OwnerEditLink";
import InquiryButton from "./InquiryButton";
import SaveButton from "@/app/components/SaveButton";

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: listing, error } = await supabase.from("listings").select("*").eq("id", id).single();

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
          <Link href="/explore" className="text-green-700 hover:underline">← Browse all listings</Link>
        </main>
      </div>
    );
  }

  const url = `https://bhumi.vercel.app/listing/${listing.id}`;
  const photos: string[] = listing.photos ?? [];
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/explore" className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-green-800">
            <span aria-hidden="true">←</span> All listings
          </Link>
          <OwnerEditLink listingId={listing.id} ownerUserId={listing.owner_user_id} />
        </div>

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{listing.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-gray-500">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {[listing.village, listing.taluka, listing.district].filter(Boolean).join(", ")}
            </p>
          </div>
          {listing.is_verified
            ? <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">✓ Verified</span>
            : <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">Unverified</span>}
        </div>

        {photos.length > 0 && (
          <div className={`mb-6 grid gap-2 overflow-hidden rounded-2xl ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4 md:grid-rows-2"}`}>
            {photos.slice(0, 5).map((p: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={p}
                alt={listing.title}
                className={`h-full w-full object-cover ${
                  photos.length > 1 && i === 0 ? "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto" : "aspect-[4/3]"
                }`}
              />
            ))}
          </div>
        )}

        <div className="mb-6 h-[320px] overflow-hidden rounded-2xl border border-gray-200 sm:h-[380px]">
          <MapLoader markers={[{ id: listing.id, latitude: listing.latitude, longitude: listing.longitude, title: listing.title, price: listing.price, area_value: listing.area_value, area_unit: listing.area_unit }]} center={[listing.latitude, listing.longitude]} zoom={14} height="100%" />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-xl font-bold text-green-800 sm:text-2xl">₹{Number(listing.price).toLocaleString("en-IN")}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{listing.price_basis === "per_acre" ? "per acre" : listing.price_basis === "per_guntha" ? "per guntha" : "total"}</p></div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-xl font-bold text-green-800 sm:text-2xl">{listing.area_value}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{listing.area_unit}</p></div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-base font-bold capitalize text-green-800 sm:text-lg">{listing.land_type?.replace(/_/g, " ")}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">land type</p></div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-base font-bold capitalize text-green-800 sm:text-lg">{listing.water_source || "—"}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">water</p></div>
        </div>

        {(listing.road_access || listing.electricity || listing.fencing) && (
          <div className="mb-8 flex flex-wrap gap-2.5">
            {listing.road_access && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-700">🛣️ {listing.road_access} road</span>}
            {listing.electricity && <span className="rounded-full bg-yellow-50 px-3 py-1.5 text-sm text-yellow-700">⚡ Electricity</span>}
            {listing.fencing && <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">🔒 Fenced</span>}
          </div>
        )}

        {listing.description && (
          <div className="mb-8"><h2 className="mb-2 text-lg font-semibold">Description</h2><p className="whitespace-pre-line leading-relaxed text-gray-600">{listing.description}</p></div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Interested in this land?</h2>
          <div className="flex flex-wrap gap-3"><InquiryButton listingId={listing.id} /><SaveButton listingId={listing.id} /><WhatsAppShare title={listing.title} price={listing.price} url={url} /></div>
          {listing.contact_phone && (
            <p className="mt-4 text-sm text-gray-500">Call: <a href={`tel:${listing.contact_phone}`} className="font-medium text-green-800 hover:underline">{listing.contact_phone}</a>
              {listing.contact_whatsapp && <> · <a href={`https://wa.me/91${listing.contact_whatsapp}`} target="_blank" className="font-medium text-green-800 hover:underline">WhatsApp</a></>}</p>
          )}
        </div>
      </main>
    </div>
  );
}
