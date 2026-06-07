import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import MapLoader from "@/app/components/MapLoader";
import ListingCard from "@/app/components/ListingCard";
import NotifyMe from "@/app/components/NotifyMe";
import { landLabel } from "@/app/lib/land";
import type { Metadata } from "next";

export const revalidate = 600; // cache listings aggregation for 10 minutes

export async function generateMetadata({ params }: { params: Promise<{ district: string; type: string }> }): Promise<Metadata> {
  const { district, type } = await params;
  const name = decodeURIComponent(district);
  const label = landLabel(type);
  return {
    title: `${label} for sale in ${name} — AcreHub`,
    description: `Browse verified ${label.toLowerCase()} for sale in ${name} — real boundaries on the map, trust scores, and legal clarity.`,
    alternates: { canonical: `/region/${district}/${type}` },
  };
}

export default async function RegionTypePage({ params }: { params: Promise<{ district: string; type: string }> }) {
  const { district, type } = await params;
  const name = decodeURIComponent(district);
  const label = landLabel(type);

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .ilike("district", name)
    .eq("land_type", type)
    .order("created_at", { ascending: false });

  const markers = (listings ?? []).map((l) => ({ id: l.id, latitude: l.latitude, longitude: l.longitude, title: l.title, price: l.price, area_value: l.area_value, area_unit: l.area_unit }));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bhumi.vercel.app/" },
      { "@type": "ListItem", position: 2, name, item: `https://bhumi.vercel.app/region/${district}` },
      { "@type": "ListItem", position: 3, name: label, item: `https://bhumi.vercel.app/region/${district}/${type}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-6">
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-green-800">Home</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <Link href={`/region/${district}`} className="capitalize hover:text-green-800">{name}</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <span className="text-gray-400">{label}</span>
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl"><span className="capitalize">{label}</span> for sale in <span className="capitalize">{name}</span></h1>
          <p className="mt-2 text-gray-600">
            {markers.length} {markers.length === 1 ? "listing" : "listings"}.{" "}
            <Link href={`/explore?q=${encodeURIComponent(name)}&land_type=${type}`} className="font-medium text-green-800 hover:underline">Refine with filters →</Link>
          </p>
        </div>

        {markers.length > 0 && (
          <div className="mx-auto mt-6 max-w-5xl px-5 sm:px-6">
            <div className="h-[320px] overflow-hidden rounded-2xl border border-gray-200 sm:h-[380px]">
              <MapLoader markers={markers} zoom={9} height="100%" />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          {markers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
              <p className="mb-4 text-gray-500">No {label.toLowerCase()} listings in {name} yet.</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href={`/region/${district}`} className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">All land in {name}</Link>
                <Link href={`/land/${type}`} className="inline-block rounded-full border border-green-700 px-6 py-2.5 font-medium text-green-800 transition-colors hover:bg-green-50">{label} everywhere</Link>
              </div>
              <NotifyMe district={name} landType={type} prompt={`Get notified when ${label.toLowerCase()} is listed in ${name}.`} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(listings ?? []).map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
