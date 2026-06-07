import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PhotoGallery from "@/app/components/PhotoGallery";
import VerifyChecklist from "@/app/components/VerifyChecklist";
import MapActions from "@/app/components/MapActions";
import MapLoader from "@/app/components/MapLoader";
import WhatsAppShare from "@/app/components/WhatsAppShare";
import OwnerEditLink from "@/app/components/OwnerEditLink";
import InquiryButton from "./InquiryButton";
import SaveButton from "@/app/components/SaveButton";
import TrustScore from "@/app/components/TrustScore";
import SuitabilityPanel from "@/app/components/SuitabilityPanel";
import ListingCard from "@/app/components/ListingCard";
import TrackRecentlyViewed from "@/app/components/TrackRecentlyViewed";
import AddToCollection from "@/app/components/AddToCollection";
import ShareButton from "@/app/components/ShareButton";
import { formatINR, formatINRShort, pricePerAcre } from "@/app/lib/format";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: l } = await supabase
    .from("listings")
    .select("title, description, price, area_value, area_unit, village, taluka, district, photos")
    .eq("id", id)
    .single();

  if (!l) return { title: "Listing not found — Bhūmi" };

  const location = [l.village, l.taluka, l.district].filter(Boolean).join(", ");
  const title = `${l.title} — ${formatINR(l.price)} · Bhūmi`;
  const description =
    (l.description?.trim()?.slice(0, 155)) ||
    `${l.area_value} ${l.area_unit} of land${location ? ` in ${location}` : ""} for ${formatINR(l.price)} on Bhūmi.`;
  const image = l.photos?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://bhumi.vercel.app/listing/${id}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

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

  const { data: similarRaw } = listing.land_type
    ? await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .eq("land_type", listing.land_type)
        .neq("id", listing.id)
        .order("is_verified", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3)
    : { data: [] };
  const similar = similarRaw ?? [];

  const url = `https://bhumi.vercel.app/listing/${listing.id}`;
  const photos: string[] = listing.photos ?? [];
  const videos: string[] = listing.videos ?? [];
  const ppa = pricePerAcre(listing);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    ...(listing.description ? { description: listing.description } : {}),
    ...(photos.length ? { image: photos } : {}),
    category: listing.land_type?.replace(/_/g, " "),
    offers: {
      "@type": "Offer",
      price: Number(listing.price),
      priceCurrency: "INR",
      availability: listing.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bhumi.vercel.app/" },
      { "@type": "ListItem", position: 2, name: "Explore", item: "https://bhumi.vercel.app/explore" },
      { "@type": "ListItem", position: 3, name: listing.title, item: url },
    ],
  };
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <TrackRecentlyViewed id={listing.id} />
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <nav className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-green-800">Home</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <Link href="/explore" className="hover:text-green-800">Explore</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <span className="truncate text-gray-400">{listing.title}</span>
          </nav>
          <OwnerEditLink listingId={listing.id} ownerUserId={listing.owner_user_id} />
        </div>

        {listing.status && listing.status !== "active" && (
          <div className={`mb-5 rounded-xl border p-4 text-sm font-medium ${listing.status === "pending" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-gray-200 bg-gray-100 text-gray-600"}`}>
            {listing.status === "pending"
              ? "⏳ This listing is awaiting review and isn't public yet."
              : listing.status === "sold"
                ? "This land has been marked sold."
                : "This listing has been withdrawn."}
          </div>
        )}

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
            {listing.created_at && (
              <p className="mt-1 text-xs text-gray-400">
                Listed {new Date(listing.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {listing.updated_at && listing.updated_at !== listing.created_at &&
                  ` · Updated ${new Date(listing.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
              </p>
            )}
          </div>
          <div className="shrink-0">
            <TrustScore listing={listing} variant="badge" />
          </div>
        </div>

        {photos.length > 0 && <PhotoGallery photos={photos} title={listing.title} />}

        {videos.length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {videos.map((v: string, i: number) => (
              <video key={i} src={v} controls playsInline preload="metadata" className="w-full rounded-2xl border border-gray-200 bg-black" />
            ))}
          </div>
        )}

        {Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude) && (
          <>
            <div className="mb-3 h-[320px] overflow-hidden rounded-2xl border border-gray-200 sm:h-[380px]">
              <MapLoader markers={[{ id: listing.id, latitude: listing.latitude, longitude: listing.longitude, title: listing.title, price: listing.price, area_value: listing.area_value, area_unit: listing.area_unit }]} center={[listing.latitude, listing.longitude]} zoom={14} height="100%" />
            </div>
            <div className="mb-8">
              <MapActions lat={listing.latitude} lng={listing.longitude} />
            </div>
          </>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-xl font-bold text-green-800 sm:text-2xl">₹{Number(listing.price).toLocaleString("en-IN")}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{listing.price_basis === "per_acre" ? "per acre" : listing.price_basis === "per_guntha" ? "per guntha" : listing.price_basis === "per_sqft" ? "per sq ft" : "total"}</p>{ppa && listing.price_basis !== "per_acre" && <p className="mt-1 text-xs text-gray-400">≈ {formatINRShort(ppa)}/acre</p>}</div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-xl font-bold text-green-800 sm:text-2xl">{listing.area_value}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{listing.area_unit}</p></div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-base font-bold capitalize text-green-800 sm:text-lg">{listing.land_type?.replace(/_/g, " ")}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">land type</p></div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-base font-bold capitalize text-green-800 sm:text-lg">{listing.water_source || "—"}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">water</p></div>
        </div>

        <p className="mb-8 text-sm">
          <Link href={`/tools/emi-calculator?amount=${listing.price}`} className="font-medium text-green-800 hover:underline">💰 Estimate EMI for this land →</Link>
        </p>

        <div className="mb-8">
          <TrustScore listing={listing} variant="full" />
        </div>

        <div className="mb-8">
          <SuitabilityPanel listing={listing} />
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

        <div className="mb-8">
          <VerifyChecklist />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Interested in this land?</h2>
          <div className="flex flex-wrap gap-3"><InquiryButton listingId={listing.id} /><SaveButton listingId={listing.id} /><AddToCollection listingId={listing.id} /><WhatsAppShare title={listing.title} price={listing.price} url={url} /><ShareButton title={listing.title} url={url} /></div>
          {(listing.contact_phone || listing.contact_email) && (
            <p className="mt-4 text-sm text-gray-500">
              {listing.contact_phone && (
                <>Call: <a href={`tel:${listing.contact_phone}`} className="font-medium text-green-800 hover:underline">{listing.contact_phone}</a>
                {listing.contact_whatsapp && <> · <a href={`https://wa.me/91${listing.contact_whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in your land "${listing.title}" (${formatINRShort(listing.price)}) on Bhūmi.`)}`} target="_blank" className="font-medium text-green-800 hover:underline">WhatsApp</a></>}</>
              )}
              {listing.contact_email && (
                <>{listing.contact_phone ? " · " : ""}<a href={`mailto:${listing.contact_email}`} className="font-medium text-green-800 hover:underline">Email</a></>
              )}
            </p>
          )}
        </div>

        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Similar land</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
