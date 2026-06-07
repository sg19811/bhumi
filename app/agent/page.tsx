"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

const LEAD_STATUSES = ["new", "contacted", "closed"] as const;
const leadStyle: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-gray-200 text-gray-600",
};

function Stat({ value, label, color = "text-green-800" }: { value: number; label: string; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function AgentDashboard() {
  const { user, role, loading } = useAuth();
  const allowed = role === "agent" || role === "admin";

  const [listings, setListings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed || !user) return;
    (async () => {
      const { data: ls } = await supabase.from("listings").select("*").eq("owner_user_id", user.id).order("created_at", { ascending: false });
      setListings(ls ?? []);
      // RLS returns only inquiries on listings this user owns.
      const { data: inq } = await supabase.from("inquiries").select("*, listings(title)").order("created_at", { ascending: false });
      setLeads(inq ?? []);
    })();
  }, [allowed, user]);

  async function setLeadStatus(id: string, lead_status: string) {
    setBusyId(id);
    const { error } = await supabase.from("inquiries").update({ lead_status }).eq("id", id);
    if (!error) setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, lead_status } : l)));
    setBusyId(null);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  if (!user || !allowed) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Agent dashboard</h1>
          <p className="mb-8 text-gray-500">
            {user ? "This dashboard is for Bhūmi agents. Ask an admin to enable agent access for your account." : "Sign in with an agent account to continue."}
          </p>
          <Link href={user ? "/" : "/auth/signin"} className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">
            {user ? "Go home" : "Sign in"}
          </Link>
        </main>
      </div>
    );
  }

  const active = listings.filter((l) => l.status === "active").length;
  const pending = listings.filter((l) => l.status === "pending").length;
  const sold = listings.filter((l) => l.status === "sold").length;
  const newLeads = leads.filter((l) => (l.lead_status ?? "new") === "new").length;
  const districts = [...new Set(listings.map((l) => l.district).filter(Boolean))];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Agent dashboard</h1>
          <div className="flex gap-2">
            <Link href="/my-listings" className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800">Manage listings</Link>
            <Link href="/listing/new" className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800">+ New</Link>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          <Stat value={listings.length} label="Listings" />
          <Stat value={active} label="Active" />
          <Stat value={pending} label="Pending" color="text-amber-700" />
          <Stat value={sold} label="Sold" color="text-gray-600" />
          <Stat value={newLeads} label="New leads" color="text-blue-700" />
        </div>

        {districts.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">Your territory</h2>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => (
                <Link key={d} href={`/region/${encodeURIComponent(d)}`} className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm capitalize text-gray-700 transition-colors hover:border-green-600 hover:text-green-800">
                  {d}
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-4 text-lg font-semibold">Leads ({leads.length})</h2>
        {leads.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-400">
            No leads yet. They appear here when buyers send an inquiry on your listings.
          </p>
        ) : (
          <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {leads.map((lead) => {
              const status = lead.lead_status ?? "new";
              return (
                <div key={lead.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{lead.message || "Interested"}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      on <Link href={`/listing/${lead.listing_id}`} className="text-green-700 hover:underline">{lead.listings?.title ?? "a listing"}</Link>
                      {" · "}{new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {lead.contact_phone && (
                      <>
                        <a href={`tel:${lead.contact_phone}`} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-green-600 hover:text-green-800">📞 {lead.contact_phone}</a>
                        <a href={`https://wa.me/91${lead.contact_phone}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800">💬</a>
                      </>
                    )}
                    <select
                      value={status}
                      disabled={busyId === lead.id}
                      onChange={(e) => setLeadStatus(lead.id, e.target.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize outline-none ${leadStyle[status] ?? "bg-gray-100 text-gray-600"}`}
                      aria-label="Lead status"
                    >
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
