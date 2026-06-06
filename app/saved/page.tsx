"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import Header from "@/app/components/Header";
import Link from "next/link";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Saved listings</h1>
        {!user && (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">Sign in to save listings and view your watchlist.</p>
            <Link href="/auth/signin" className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">Sign in</Link>
          </div>
        )}
        {user && fetched && listings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No saved listings yet. Tap ♡ Save on any listing.</p>
            <Link href="/explore" className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">Browse listings</Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((l) => (
            <Link key={l.id} href={`/listing/${l.id}`} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow block">
              <div className="bg-gray-100 h-32 flex items-center justify-center text-gray-400 text-sm">
                {l.photos?.length > 0 ? <img src={l.photos[0]} alt={l.title} className="w-full h-full object-cover" /> : "Photo coming soon"}
              </div>
              <div className="p-4">
                <h3 className="font-semibold leading-tight">{l.title}</h3>
                <p className="text-lg font-bold text-green-800">₹{Number(l.price).toLocaleString("en-IN")}</p>
                <p className="text-sm text-gray-500">{l.area_value} {l.area_unit} · {[l.village, l.taluka, l.district].filter(Boolean).join(", ")}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
