import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import MapLoader from "@/app/components/MapLoader";
import WhatsAppShare from "@/app/components/WhatsAppShare";
import OwnerEditLink from "@/app/components/OwnerEditLink";
import InquiryButton from "./InquiryButton";

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
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/explore" className="text-sm text-gray-500 hover:text-green-700">← All listings</Link>
          <OwnerEditLink listingId={listing.id} ownerUserId={listing.owner_user_id} />
        </div>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <p className="text-gray-500 mt-1">{[listing.village, listing.taluka, listing.district].filter(Boolean).join(", ")}</p>
          </div>
          {listing.is_verified
            ? <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">✓ Verified</span>
            : <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">Unverified</span>}
        </div>

        {listing.photos?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {listing.photos.map((p: string, i: number) => (
              <img key={i} src={p} alt={listing.title} className="w-full h-40 object-cover rounded-lg" />
            ))}
          </div>
        )}

        <div className="rounded-lg overflow-hidden border mb-6 h-[350px]">
          <MapLoader markers={[{ id: listing.id, latitude: listing.latitude, longitude: listing.longitude, title: listing.title, price: listing.price, area_value: listing.area_value, area_unit: listing.area_unit }]} center={[listing.latitude, listing.longitude]} zoom={14} height="350px" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-2xl font-bold text-green-800">₹{Number(listing.price).toLocaleString("en-IN")}</p><p className="text-xs text-gray-500">{listing.price_basis === "per_acre" ? "per acre" : listing.price_basis === "per_guntha" ? "per guntha" : "total"}</p></div>
          <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-2xl font-bold text-green-800">{listing.area_value}</p><p className="text-xs text-gray-500">{listing.area_unit}</p></div>
          <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-2xl font-bold text-green-800">{listing.land_type?.replace(/_/g, " ")}</p><p className="text-xs text-gray-500">land type</p></div>
          <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-2xl font-bold text-green-800">{listing.water_source || "—"}</p><p className="text-xs text-gray-500">water</p></div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {listing.road_access && <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">🛣️ {listing.road_access} road</span>}
          {listing.electricity && <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">⚡ Electricity</span>}
          {listing.fencing && <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm">🔒 Fenced</span>}
        </div>

        {listing.description && (
          <div className="mb-8"><h2 className="text-lg font-semibold mb-2">Description</h2><p className="text-gray-600 whitespace-pre-line">{listing.description}</p></div>
        )}

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Interested in this land?</h2>
          <div className="flex flex-wrap gap-3"><InquiryButton listingId={listing.id} /><WhatsAppShare title={listing.title} price={listing.price} url={url} /></div>
          {listing.contact_phone && (
            <p className="mt-4 text-sm text-gray-500">Call: <a href={`tel:${listing.contact_phone}`} className="text-green-700 font-medium">{listing.contact_phone}</a>
              {listing.contact_whatsapp && <> · <a href={`https://wa.me/91${listing.contact_whatsapp}`} target="_blank" className="text-green-700 font-medium">WhatsApp</a></>}</p>
          )}
        </div>
      </main>
    </div>
  );
}
