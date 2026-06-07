"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import Header from "@/app/components/Header";
import Link from "next/link";
import ListingCard from "@/app/components/ListingCard";
import { ListingCardSkeletonGrid } from "@/app/components/ListingCardSkeleton";

export default function Saved() {
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_listings").select("listing_id, listings(*)").eq("user_id", user.id)
      .then(({ data }) => {
        setListings((data ?? []).map((r: any) => r.listings).filter(Boolean));
        setFetched(true);
      });
  }, [user]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold">Saved listings</h1>
        {!user && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">Sign in to save listings and view your watchlist.</p>
            <Link href="/auth/signin" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Sign in</Link>
          </div>
        )}
        {user && fetched && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">No saved listings yet. Tap ♡ Save on any listing.</p>
            <Link href="/explore" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Browse listings</Link>
          </div>
        )}
        {user && !fetched && <ListingCardSkeletonGrid />}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </main>
    </div>
  );
}
