import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PhotoGallery from "@/app/components/PhotoGallery";
import VerifyChecklist from "@/app/components/VerifyChecklist";
import MapActions from "@/app/components/MapActions";
import MapLoader from "@/app/components/MapLoader";
import WhatsAppShare from "@/app/components/WhatsAppShare";
import WhatsAppContactButton from "@/app/components/WhatsAppContactButton";
import BuyersLookingBanner from "@/app/components/BuyersLookingBanner";
import CoBuyListingCTA from "@/app/components/co-buy/CoBuyListingCTA";
import OwnerEditLink from "@/app/components/OwnerEditLink";
import SaveButton from "@/app/components/SaveButton";
import TrustScore from "@/app/components/TrustScore";
import SuitabilityPanel from "@/app/components/SuitabilityPanel";
import BuyerDecisionPanel from "@/app/components/BuyerDecisionPanel";
import LandHealthPanel from "@/app/components/LandHealthPanel";
import VerificationPanel from "@/app/components/VerificationPanel";
import ListingCard from "@/app/components/ListingCard";
import AgentManagedCard from "@/app/components/agents/AgentManagedCard";
import LandRecordViewer from "@/app/components/agents/LandRecordViewer";
import TrackRecentlyViewed from "@/app/components/TrackRecentlyViewed";
import TrackView from "@/app/components/TrackView";
import AddToCollection from "@/app/components/AddToCollection";
import ShareButton from "@/app/components/ShareButton";
import ReportButton from "@/app/components/ReportButton";
import StickyContactBar from "@/app/components/StickyContactBar";
import PriceInsightPanel from "@/app/components/PriceInsight";
import FarmProjectSections from "@/app/components/farm-plots/FarmProjectSections";
import { buildPriceInsight } from "@/app/lib/price-insight";
import { districtToState } from "@/app/lib/legal/districts";
import { stateLabel } from "@/app/lib/legal/options";
import { landLabel } from "@/app/lib/land";
import { formatINR, formatINRShort, pricePerAcre } from "@/app/lib/format";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: l } = await supabase
    .from("listings")
    .select("title, description, price, price_basis, area_value, area_unit, land_type, village, taluka, district, photos")
    .eq("id", id)
    .single();

  if (!l) return { title: "Listing not found — AcreHub" };

  const location = [l.village, l.taluka, l.district].filter(Boolean).join(", ");
  const district = l.district || l.taluka || l.village || "";
  const typeWord = l.land_type ? landLabel(l.land_type).toLowerCase() : "land";
  const basis = l.price_basis === "per_acre" ? "/acre" : l.price_basis === "per_guntha" ? "/guntha" : l.price_basis === "per_sqft" ? "/sq ft" : "";
  const areaPhrase = l.area_value ? `${l.area_value} ${l.area_unit} ${typeWord}` : typeWord;
  // Richer, keyword-led title: "<title> — 2 acre farmhouse land in Mysuru (₹3 Cr) | AcreHub"
  const title = `${l.title} — ${areaPhrase}${district ? ` in ${district}` : ""} (${formatINRShort(l.price)}${basis}) | AcreHub`;
  const description =
    (l.description?.trim()?.slice(0, 155)) ||
    `${areaPhrase}${location ? ` in ${location}` : ""} for ${formatINR(l.price)}${basis} on AcreHub — verified, with real map boundaries, a trust score, and legal clarity.`;
  const image = l.photos?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://acrehubindia.com/listing/${id}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    alternates: { canonical: `/listing/${id}` },
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

  const { count: sellerCount } = listing.owner_user_id
    ? await supabase.from("listings").select("id", { count: "exact", head: true }).eq("owner_user_id", listing.owner_user_id).eq("status", "active")
    : { count: 0 };

  // Agent Network: if this listing came via an agent, fetch the public profile.
  const { data: managedByAgent } = listing.agent_id
    ? await supabase.from("public_agents").select("slug, name, display_name, agent_type, verification_status").eq("id", listing.agent_id).maybeSingle()
    : { data: null };

  // Government land record (public-readable when linked to an active listing).
  const { data: landRecord } = listing.land_record_id
    ? await supabase.from("land_records").select("source, retrieved_at, owners, extent_value, extent_unit, classification, fmb_sketch_url, encumbrance_status").eq("id", listing.land_record_id).maybeSingle()
    : { data: null };

  // Comparable active listings (same district or same land type) for price insight.
  const cmpCols = "price, price_basis, area_value, area_unit, district, land_type";
  const [{ data: byType }, { data: byDistrict }] = await Promise.all([
    listing.land_type
      ? supabase.from("listings").select(cmpCols).eq("status", "active").eq("land_type", listing.land_type).neq("id", listing.id).limit(300)
      : Promise.resolve({ data: [] as any[] }),
    listing.district
      ? supabase.from("listings").select(cmpCols).eq("status", "active").ilike("district", listing.district).neq("id", listing.id).limit(300)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const comparablesMap = new Map<string, any>();
  for (const r of [...(byType ?? []), ...(byDistrict ?? [])]) {
    comparablesMap.set(`${r.district}|${r.land_type}|${r.price}|${r.area_value}|${r.area_unit}|${r.price_basis}`, r);
  }
  const priceInsight = buildPriceInsight(listing, [...comparablesMap.values()], landLabel);

  // Honest social proof: how many buyers are actively looking in this district.
  const { count: buyersLooking } = listing.district
    ? await supabase.from("buyer_interests").select("id", { count: "exact", head: true }).ilike("preferred_district", listing.district)
    : { count: 0 };

  const url = `https://acrehubindia.com/listing/${listing.id}`;
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://acrehubindia.com/" },
      { "@type": "ListItem", position: 2, name: "Explore", item: "https://acrehubindia.com/explore" },
      { "@type": "ListItem", position: 3, name: listing.title, item: url },
    ],
  };
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <TrackRecentlyViewed id={listing.id} />
      <TrackView id={listing.id} />
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8">
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
                {typeof listing.views === "number" && listing.views > 0 && ` · 👁 ${listing.views.toLocaleString("en-IN")} views`}
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

        {listing.tour_url && (
          <a href={listing.tour_url} target="_blank" rel="noopener noreferrer"
            className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-medium text-indigo-800 hover:bg-indigo-100">
            <span>🌐 View virtual tour / 360°</span>
            <span className="text-indigo-500">Open →</span>
          </a>
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

        <div className="mb-6 empty:hidden">
          <BuyersLookingBanner count={buyersLooking ?? 0} district={listing.district} />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-xl font-bold text-green-800 sm:text-2xl">₹{Number(listing.price).toLocaleString("en-IN")}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{listing.price_basis === "per_acre" ? "per acre" : listing.price_basis === "per_guntha" ? "per guntha" : listing.price_basis === "per_sqft" ? "per sq ft" : "total"}</p>{ppa && listing.price_basis !== "per_acre" && <p className="mt-1 text-xs text-gray-400">≈ {formatINRShort(ppa)}/acre</p>}{listing.previous_price && Number(listing.previous_price) > Number(listing.price) && <p className="mt-1 text-xs"><span className="font-medium text-red-600">↓ Reduced</span> <span className="text-gray-400 line-through">{formatINRShort(listing.previous_price)}</span></p>}</div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-xl font-bold text-green-800 sm:text-2xl">{listing.area_value}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{listing.area_unit}</p></div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-base font-bold capitalize text-green-800 sm:text-lg">{listing.land_type?.replace(/_/g, " ")}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">land type</p></div>
          <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center"><p className="text-base font-bold capitalize text-green-800 sm:text-lg">{listing.water_source || "—"}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">water</p></div>
        </div>

        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href={`/tools/emi-calculator?amount=${listing.price}`} className="font-medium text-green-800 hover:underline">💰 Estimate EMI for this land →</Link>
          <Link href={`/tools/stamp-duty-calculator?amount=${listing.price}`} className="font-medium text-green-800 hover:underline">🧾 Stamp duty & registration →</Link>
          <Link href={`/tools/loan-eligibility-calculator`} className="font-medium text-green-800 hover:underline">🏦 Loan eligibility →</Link>
          <Link href={`/legal/wizard?${new URLSearchParams({ ...(districtToState(listing.district) ? { state: districtToState(listing.district)! } : {}), ...(listing.land_type ? { land_type: String(listing.land_type) } : {}), listing: String(listing.id) }).toString()}`} className="font-medium text-green-800 hover:underline">⚖️ Check who can buy this land →</Link>
          <Link href="/legal/checklist" className="font-medium text-green-800 hover:underline">📋 Document checklist →</Link>
          <Link href={`/legal/due-diligence?listing=${listing.id}`} className="font-medium text-green-800 hover:underline">✅ Due-diligence checklist →</Link>
          <Link href={`/listing/${listing.id}/report`} className="font-medium text-green-800 hover:underline">📄 Buyer report (print / share) →</Link>
          {districtToState(listing.district) && (
            <Link href={`/legal/state/${districtToState(listing.district)}`} className="font-medium text-green-800 hover:underline">📖 Land rules in {stateLabel(districtToState(listing.district)!)} →</Link>
          )}
        </div>

        {/* Farm-project sections (renders only for project-type listings; null-safe). */}
        <FarmProjectSections listing={listing} />

        {/* At-a-glance buyer decision summary, above the detailed panels it draws from. */}
        <BuyerDecisionPanel listing={listing} priceInsight={priceInsight} />

        {priceInsight && <PriceInsightPanel insight={priceInsight} />}

        <div className="mb-8">
          <TrustScore listing={listing} variant="full" />
        </div>

        <VerificationPanel listingId={listing.id} ownerUserId={listing.owner_user_id} isVerified={!!listing.is_verified} />

        <LandHealthPanel listing={listing} />

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

        {/* Buying Circle CTA — renders only when eligible AND a public opportunity exists. */}
        <CoBuyListingCTA listingId={listing.id} isEligible={listing.is_co_buy_eligible} />

        {listing.description && (
          <div className="mb-8"><h2 className="mb-2 text-lg font-semibold">Description</h2><p className="whitespace-pre-line leading-relaxed text-gray-600">{listing.description}</p></div>
        )}

        <div className="mb-8">
          <VerifyChecklist />
        </div>

        {landRecord && <LandRecordViewer record={landRecord} />}

        {managedByAgent && <AgentManagedCard agent={managedByAgent} listingTitle={listing.title} />}

        {listing.location_visibility === "approximate" && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            📍 Approximate location shown. Exact details available after you contact the agent.
          </div>
        )}

        <div id="contact" className="scroll-mt-20 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Interested in this land?</h2>
          <div className="flex flex-wrap gap-3"><WhatsAppContactButton whatsapp={listing.contact_whatsapp} phone={listing.contact_phone} title={listing.title} price={listing.price} /><SaveButton listingId={listing.id} /><AddToCollection listingId={listing.id} /><WhatsAppShare title={listing.title} price={listing.price} url={url} /><ShareButton title={listing.title} url={url} /></div>
          {(listing.contact_phone || listing.contact_email) ? (
            <p className="mt-4 text-base text-gray-700">
              {listing.contact_phone && (
                <>📞 Call <a href={`tel:${listing.contact_phone}`} className="font-semibold text-green-800 hover:underline">{listing.contact_phone}</a>
                {listing.contact_whatsapp && <> · <a href={`https://wa.me/91${listing.contact_whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in your land "${listing.title}" (${formatINRShort(listing.price)}) on AcreHub.`)}`} target="_blank" className="font-semibold text-green-800 hover:underline">WhatsApp</a></>}</>
              )}
              {listing.contact_email && (
                <>{listing.contact_phone ? " · " : ""}✉ <a href={`mailto:${listing.contact_email}`} className="font-semibold text-green-800 hover:underline">{listing.contact_email}</a></>
              )}
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-500">The seller hasn&apos;t shared contact details for this listing yet.</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {(sellerCount ?? 0) > 1 ? (
            <Link href={`/seller/${listing.owner_user_id}`} className="text-sm font-medium text-green-800 hover:underline">More from this seller →</Link>
          ) : <span />}
          <ReportButton listingId={listing.id} />
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
      <StickyContactBar phone={listing.contact_phone} price={listing.price} basis={listing.price_basis} />
      <Footer />
    </div>
  );
}
