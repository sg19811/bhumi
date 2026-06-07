import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import Link from "next/link";
import Header from "@/app/components/Header";
import AdminListingRow from "@/app/components/AdminListingRow";

export default async function AdminDashboard() {
  const { data: listings } = await db.from("listings").select("*").order("created_at", { ascending: false });
  const { data: inquiries } = await db.from("inquiries").select("*, listings(title)").order("created_at", { ascending: false });
  const { data: buyers } = await db.from("buyer_interests").select("*").order("created_at", { ascending: false });

  const verified = listings?.filter((l) => l.is_verified).length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-green-800">{listings?.length ?? 0}</p><p className="text-sm text-gray-500">Listings</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-green-800">{verified}</p><p className="text-sm text-gray-500">Verified</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-blue-700">{inquiries?.length ?? 0}</p><p className="text-sm text-gray-500">Inquiries</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-bold text-amber-700">{buyers?.length ?? 0}</p><p className="text-sm text-gray-500">Buyer reqs</p></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Manage listings</h2><Link href="/listing/new" className="text-sm text-green-700 hover:underline">+ New</Link></div>
            <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {listings?.map((l) => <AdminListingRow key={l.id} listing={l} />)}
              {(!listings || listings.length === 0) && <p className="p-4 text-sm text-gray-400">No listings yet.</p>}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Recent inquiries</h2>
            <div className="mb-8 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {inquiries?.slice(0, 8).map((inq) => (
                <div key={inq.id} className="p-4">
                  <p className="text-sm font-medium">{inq.message || "Interested"}</p>
                  <p className="text-xs text-gray-500">on <Link href={`/listing/${inq.listing_id}`} className="text-green-700 hover:underline">{inq.listings?.title ?? "a listing"}</Link> · {new Date(inq.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              ))}
              {(!inquiries || inquiries.length === 0) && <p className="p-4 text-sm text-gray-400">No inquiries yet.</p>}
            </div>
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Buyer requirements</h2><Link href="/requirements" className="text-sm text-green-700 hover:underline">View all</Link></div>
            <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {buyers?.slice(0, 5).map((b) => (
                <div key={b.id} className="p-4">
                  <p className="text-sm font-medium">{b.intent?.replace(/_/g, " ")} in {b.preferred_district || "any district"}</p>
                  <p className="text-xs text-gray-500">₹{b.budget_min?.toLocaleString("en-IN") ?? "?"}–₹{b.budget_max?.toLocaleString("en-IN") ?? "?"} · {b.contact_phone}</p>
                </div>
              ))}
              {(!buyers || buyers.length === 0) && <p className="p-4 text-sm text-gray-400">No requirements yet.</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
