"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import { ListingCardSkeletonGrid } from "@/app/components/ListingCardSkeleton";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

const statusStyle: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  sold: "bg-gray-200 text-gray-700",
  withdrawn: "bg-amber-100 text-amber-800",
};

export default function MyListings() {
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [inquiriesByListing, setInquiriesByListing] = useState<Record<string, any[]>>({});
  const [fetched, setFetched] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ls } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });
      setListings(ls ?? []);

      const ids = (ls ?? []).map((l) => l.id);
      if (ids.length) {
        // RLS lets owners read inquiries only for listings they own.
        const { data: inq } = await supabase
          .from("inquiries")
          .select("*")
          .in("listing_id", ids)
          .order("created_at", { ascending: false });
        const map: Record<string, any[]> = {};
        for (const q of inq ?? []) (map[q.listing_id] ??= []).push(q);
        setInquiriesByListing(map);
      }
      setFetched(true);
    })();
  }, [user]);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (!error) setListings((cur) => cur.map((l) => (l.id === id ? { ...l, status } : l)));
    setBusyId(null);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">My listings</h1>
          <Link href="/listing/new" className="shrink-0 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800">
            + New listing
          </Link>
        </div>

        {!user && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">Sign in to manage the listings you&apos;ve posted with an account.</p>
            <Link href="/auth/signin" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Sign in</Link>
          </div>
        )}

        {user && fetched && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">You haven&apos;t posted any listings from this account yet.</p>
            <Link href="/listing/new" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">List your land</Link>
          </div>
        )}

        {user && !fetched && <ListingCardSkeletonGrid />}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <div key={l.id}>
              <ListingCard listing={l} />
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyle[l.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {l.status ?? "active"}
                </span>
                <span className="text-xs text-gray-500">👁 {(l.views ?? 0).toLocaleString("en-IN")}</span>
                <Link href={`/listing/${l.id}/edit`} className="text-xs font-medium text-green-800 hover:underline">
                  Edit
                </Link>
                {l.status === "active" && (
                  <>
                    <button onClick={() => setStatus(l.id, "sold")} disabled={busyId === l.id} className="text-xs text-gray-500 hover:text-green-800 disabled:opacity-50">Mark sold</button>
                    <button onClick={() => setStatus(l.id, "withdrawn")} disabled={busyId === l.id} className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-50">Withdraw</button>
                  </>
                )}
                {(l.status === "sold" || l.status === "withdrawn") && (
                  <button onClick={() => setStatus(l.id, "active")} disabled={busyId === l.id} className="text-xs text-gray-500 hover:text-green-800 disabled:opacity-50">Re-list</button>
                )}
              </div>
              {(inquiriesByListing[l.id]?.length ?? 0) > 0 && (
                <div className="mt-2 rounded-lg bg-green-50 px-3 py-2">
                  <p className="text-xs font-medium text-green-800">📩 {inquiriesByListing[l.id].length} {inquiriesByListing[l.id].length === 1 ? "inquiry" : "inquiries"}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {inquiriesByListing[l.id].slice(0, 6).map((q) => (
                      q.contact_phone ? (
                        <a key={q.id} href={`tel:${q.contact_phone}`} className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-green-600 hover:text-green-800">
                          📞 {q.contact_phone}
                        </a>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
