import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import type { Metadata } from "next";

// Keyed by an opaque user id — keep these out of search results.
export const metadata: Metadata = {
  title: "Listings by this seller — AcreHub",
  robots: { index: false, follow: true },
};

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_user_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const items = listings ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-6">
        <h1 className="mb-1 text-3xl font-bold">Land from this seller</h1>
        <p className="mb-6 text-gray-500">{items.length} active {items.length === 1 ? "listing" : "listings"}</p>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">This seller has no active listings right now.</p>
            <Link href="/explore" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Browse all land</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
