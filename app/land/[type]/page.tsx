import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import MapLoader from "@/app/components/MapLoader";
import ListingCard from "@/app/components/ListingCard";
import { landLabel } from "@/app/lib/land";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const label = landLabel(type);
  return {
    title: `${label} for sale — AcreHub`,
    description: `Browse verified ${label.toLowerCase()} for sale across India — real boundaries on the map, trust scores, and legal clarity.`,
    alternates: { canonical: `/land/${type}` },
  };
}

export default async function LandTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const label = landLabel(type);

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .eq("land_type", type)
    .order("created_at", { ascending: false });

  const markers = (listings ?? []).map((l) => ({ id: l.id, latitude: l.latitude, longitude: l.longitude, title: l.title, price: l.price, area_value: l.area_value, area_unit: l.area_unit }));

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-6">
          <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-green-800">Home</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <Link href="/explore" className="hover:text-green-800">Explore</Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <span className="text-gray-400">{label}</span>
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">{label} for sale</h1>
          <p className="mt-2 text-gray-600">
            {markers.length} {markers.length === 1 ? "listing" : "listings"} — verified land, real boundaries, and trust scores.{" "}
            <Link href={`/explore?land_type=${type}`} className="font-medium text-green-800 hover:underline">Refine with filters →</Link>
          </p>
        </div>

        {markers.length > 0 && (
          <div className="mx-auto mt-6 max-w-5xl px-5 sm:px-6">
            <div className="h-[320px] overflow-hidden rounded-2xl border border-gray-200 sm:h-[380px]">
              <MapLoader markers={markers} zoom={6} height="100%" />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          {markers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
              <p className="mb-4 text-gray-500">No active {label.toLowerCase()} listings yet.</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/explore" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Browse all land</Link>
                <Link href="/listing/new" className="inline-block rounded-full border border-green-700 px-6 py-2.5 font-medium text-green-800 transition-colors hover:bg-green-50">List your land</Link>
              </div>
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
