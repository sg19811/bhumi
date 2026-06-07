"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import ListingCard from "@/app/components/ListingCard";
import { ListingCardSkeletonGrid } from "@/app/components/ListingCardSkeleton";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // RLS ensures only the owner can read this collection + its items.
      const { data: col } = await supabase.from("collections").select("name").eq("id", id).single();
      setName(col?.name ?? null);
      const { data: rows } = await supabase
        .from("collection_listings")
        .select("listing_id, listings(*)")
        .eq("collection_id", id);
      setListings((rows ?? []).map((r: any) => r.listings).filter(Boolean));
      setFetched(true);
    })();
  }, [id, user]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <Link href="/collections" className="text-sm text-gray-500 transition-colors hover:text-green-800">← All collections</Link>

        {!user && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">Sign in to view this collection.</p>
            <Link href="/auth/signin" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Sign in</Link>
          </div>
        )}

        {user && (
          <>
            <h1 className="mb-6 mt-2 text-3xl font-bold">{name ?? "Collection"}</h1>
            {!fetched && <ListingCardSkeletonGrid count={3} />}
            {fetched && listings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
                <p className="mb-4 text-gray-500">Nothing here yet. Add listings with “✦ Save to collection”.</p>
                <Link href="/explore" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Browse listings</Link>
              </div>
            )}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
