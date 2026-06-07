import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Logo from "@/app/components/Logo";
import ListingCard from "@/app/components/ListingCard";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All agricultural land listings — AcreHub",
  description: "Every active agricultural land, orchard, and farmhouse plot listing on AcreHub.",
};

export default async function Listings() {
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/85 px-5 py-3.5 backdrop-blur-md sm:px-6">
        <Logo />
        <Link
          href="/listing/new"
          className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          + List your land
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <h1 className="mb-1 text-3xl font-bold">All listings</h1>
        <p className="mb-8 text-gray-500">
          {listings?.length ?? 0} properties available
        </p>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Could not load listings: {error.message}
          </div>
        )}

        {(!listings || listings.length === 0) && !error && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center">
            <p className="mb-4 text-lg text-gray-400">
              No listings yet. Be the first to list your land!
            </p>
            <Link
              href="/listing/new"
              className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800"
            >
              Create a listing
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings?.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
