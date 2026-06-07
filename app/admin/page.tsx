"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import AdminListingRow from "@/app/components/AdminListingRow";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

function topCounts(rows: any[], key: string, n = 5) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const v = (r[key] ?? "").toString().trim().toLowerCase();
    if (!v) continue;
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([value, count]) => ({ value, count }));
}

function InsightList({ title, items }: { title: string; items: { value: string; count: number }[] }) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      {items.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.value}>
            <div className="mb-0.5 flex items-center justify-between text-sm">
              <span className="truncate capitalize text-gray-700">{it.value.replace(/_/g, " ")}</span>
              <span className="ml-2 shrink-0 text-gray-400">{it.count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${(it.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";

  const [listings, setListings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [searchLogs, setSearchLogs] = useState<any[]>([]);

  // Read with the admin's own session — Supabase RLS (is_admin()) enforces access.
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [l, i, b, s] = await Promise.all([
        supabase.from("listings").select("*").order("created_at", { ascending: false }),
        supabase.from("inquiries").select("*, listings(title)").order("created_at", { ascending: false }),
        supabase.from("buyer_interests").select("*").order("created_at", { ascending: false }),
        supabase.from("search_logs").select("*").order("created_at", { ascending: false }).limit(1000),
      ]);
      setListings(l.data ?? []);
      setInquiries(i.data ?? []);
      setBuyers(b.data ?? []);
      setSearchLogs(s.data ?? []);
    })();
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Admins only</h1>
          <p className="mb-8 text-gray-500">
            {user ? "This area is restricted to Bhūmi administrators." : "Please sign in with an admin account to continue."}
          </p>
          <Link href={user ? "/" : "/auth/signin"} className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">
            {user ? "Go home" : "Sign in"}
          </Link>
        </main>
      </div>
    );
  }

  const verified = listings.filter((l) => l.is_verified).length;
  const pending = listings.filter((l) => l.status === "pending").length;
  // Pending first, so they're easy to review.
  const sortedListings = [...listings].sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-green-800">{listings.length}</p><p className="text-sm text-gray-500">Listings</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-amber-700">{pending}</p><p className="text-sm text-gray-500">Pending</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-green-800">{verified}</p><p className="text-sm text-gray-500">Verified</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-blue-700">{inquiries.length}</p><p className="text-sm text-gray-500">Inquiries</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-amber-700">{buyers.length}</p><p className="text-sm text-gray-500">Buyer reqs</p></div>
        </div>

        {pending > 0 && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <span className="font-semibold">{pending}</span> listing{pending > 1 ? "s" : ""} awaiting review — they stay hidden from buyers until you Approve them below.
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Manage listings</h2><Link href="/listing/new" className="text-sm text-green-700 hover:underline">+ New</Link></div>
            <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {sortedListings.map((l) => <AdminListingRow key={l.id} listing={l} />)}
              {listings.length === 0 && <p className="p-4 text-sm text-gray-400">No listings yet.</p>}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Recent inquiries</h2>
            <div className="mb-8 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {inquiries.slice(0, 8).map((inq) => (
                <div key={inq.id} className="p-4">
                  <p className="text-sm font-medium">{inq.message || "Interested"}</p>
                  <p className="text-xs text-gray-500">
                    {inq.contact_phone && <>📞 <a href={`tel:${inq.contact_phone}`} className="text-green-700 hover:underline">{inq.contact_phone}</a> · </>}
                    on <Link href={`/listing/${inq.listing_id}`} className="text-green-700 hover:underline">{inq.listings?.title ?? "a listing"}</Link> · {new Date(inq.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
              {inquiries.length === 0 && <p className="p-4 text-sm text-gray-400">No inquiries yet.</p>}
            </div>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Buyer requirements</h2><Link href="/requirements" className="text-sm text-green-700 hover:underline">View all</Link></div>
            <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {buyers.slice(0, 5).map((b) => (
                <div key={b.id} className="p-4">
                  <p className="text-sm font-medium capitalize">{b.intent?.replace(/_/g, " ")} in {b.preferred_district || "any district"}</p>
                  <p className="text-xs text-gray-500">₹{b.budget_min?.toLocaleString("en-IN") ?? "?"}–₹{b.budget_max?.toLocaleString("en-IN") ?? "?"} · {b.contact_phone}</p>
                </div>
              ))}
              {buyers.length === 0 && <p className="p-4 text-sm text-gray-400">No requirements yet.</p>}
            </div>
          </section>
        </div>

        {/* Founder intelligence v0 — what buyers are searching for */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Search insights</h2>
          <p className="mb-4 text-sm text-gray-500">What buyers are searching for ({searchLogs.length} recent searches). Use it to know which land to source.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InsightList title="Top districts" items={topCounts(searchLogs, "district")} />
            <InsightList title="Top land types" items={topCounts(searchLogs, "land_type")} />
            <InsightList title="Top search terms" items={topCounts(searchLogs, "query")} />
          </div>
        </section>
      </main>
    </div>
  );
}
