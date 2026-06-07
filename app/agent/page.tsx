"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import DealRow from "@/app/components/DealRow";
import { formatINR, formatINRShort, pricePerAcre } from "@/app/lib/format";
import { landLabel } from "@/app/lib/land";

// Average ₹/acre grouped by a field, across listings where it can be derived.
function avgPpaBy(rows: any[], key: string, n = 5) {
  const groups = new Map<string, number[]>();
  for (const r of rows) {
    const ppa = pricePerAcre(r);
    const v = (r[key] ?? "").toString().trim();
    if (!ppa || !v) continue;
    if (!groups.has(v)) groups.set(v, []);
    groups.get(v)!.push(ppa);
  }
  return [...groups.entries()]
    .map(([value, arr]) => ({ value, avg: arr.reduce((a, b) => a + b, 0) / arr.length, n: arr.length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, n);
}

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
  const [deals, setDeals] = useState<Record<string, { sale_price: number | null; commission_amount: number | null }>>({});
  const [market, setMarket] = useState<any[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [leadFilter, setLeadFilter] = useState<string>("all");

  useEffect(() => {
    if (!allowed || !user) return;
    (async () => {
      const { data: ls } = await supabase.from("listings").select("*").eq("owner_user_id", user.id).order("created_at", { ascending: false });
      setListings(ls ?? []);
      // RLS returns only inquiries on listings this user owns.
      const { data: inq } = await supabase.from("inquiries").select("*, listings(title)").order("created_at", { ascending: false });
      setLeads(inq ?? []);
      const { data: dl } = await supabase.from("deals").select("*").eq("agent_user_id", user.id);
      const map: Record<string, { sale_price: number | null; commission_amount: number | null }> = {};
      for (const d of dl ?? []) map[d.listing_id] = { sale_price: d.sale_price, commission_amount: d.commission_amount };
      setDeals(map);

      // Market data (public active listings) for pricing insights.
      const { data: mk } = await supabase
        .from("listings")
        .select("price, price_basis, area_value, area_unit, district, land_type")
        .eq("status", "active")
        .limit(1000);
      setMarket(mk ?? []);
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
            {user ? "This dashboard is for AcreHub agents. Ask an admin to enable agent access for your account." : "Sign in with an agent account to continue."}
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
  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const districts = [...new Set(listings.map((l) => l.district).filter(Boolean))];
  const soldListings = listings.filter((l) => l.status === "sold");
  const commissionTotal = Object.values(deals).reduce((sum, d) => sum + (Number(d.commission_amount) || 0), 0);
  const ppaByType = avgPpaBy(market, "land_type");
  const ppaByDistrict = avgPpaBy(market, "district");

  // Lead pipeline + conversion.
  const pipeline = { new: 0, contacted: 0, closed: 0 };
  for (const l of leads) { const s = (l.lead_status ?? "new") as keyof typeof pipeline; if (s in pipeline) pipeline[s]++; }
  const conversion = leads.length ? Math.round((pipeline.closed / leads.length) * 100) : 0;
  const filteredLeads = leadFilter === "all" ? leads : leads.filter((l) => (l.lead_status ?? "new") === leadFilter);

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

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Stat value={listings.length} label="Listings" />
          <Stat value={active} label="Active" />
          <Stat value={pending} label="Pending" color="text-amber-700" />
          <Stat value={sold} label="Sold" color="text-gray-600" />
          <Stat value={newLeads} label="New leads" color="text-blue-700" />
          <Stat value={totalViews} label="Views" color="text-blue-700" />
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

        {market.length > 0 && (ppaByType.length > 0 || ppaByDistrict.length > 0) && (
          <section className="mb-8">
            <h2 className="mb-1 text-lg font-semibold">Market insights</h2>
            <p className="mb-4 text-sm text-gray-500">Average price per acre across {market.length} active listings — use it to price and source.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">By land type</h3>
                {ppaByType.length === 0 ? <p className="text-sm text-gray-400">Not enough data.</p> : (
                  <ul className="space-y-2">
                    {ppaByType.map((it) => (
                      <li key={it.value} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-gray-700">{landLabel(it.value)}</span>
                        <span className="text-gray-500">{formatINRShort(it.avg)}/acre <span className="text-gray-300">· {it.n}</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">By district</h3>
                {ppaByDistrict.length === 0 ? <p className="text-sm text-gray-400">Not enough data.</p> : (
                  <ul className="space-y-2">
                    {ppaByDistrict.map((it) => (
                      <li key={it.value} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-gray-700">{it.value}</span>
                        <span className="text-gray-500">{formatINRShort(it.avg)}/acre <span className="text-gray-300">· {it.n}</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Leads ({leads.length})</h2>
          {leads.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {[{ k: "all", l: `All ${leads.length}` }, { k: "new", l: `New ${pipeline.new}` }, { k: "contacted", l: `Contacted ${pipeline.contacted}` }, { k: "closed", l: `Closed ${pipeline.closed}` }].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setLeadFilter(o.k)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${leadFilter === o.k ? "border-green-600 bg-green-50 text-green-800" : "border-gray-300 text-gray-600 hover:border-green-400"}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          )}
        </div>

        {leads.length > 0 && (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Pipeline</span>
              <span className="text-gray-500">Conversion <span className="font-semibold text-green-800">{conversion}%</span></span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-100">
              {pipeline.new > 0 && <div className="bg-amber-400" style={{ width: `${(pipeline.new / leads.length) * 100}%` }} title={`New ${pipeline.new}`} />}
              {pipeline.contacted > 0 && <div className="bg-blue-500" style={{ width: `${(pipeline.contacted / leads.length) * 100}%` }} title={`Contacted ${pipeline.contacted}`} />}
              {pipeline.closed > 0 && <div className="bg-green-600" style={{ width: `${(pipeline.closed / leads.length) * 100}%` }} title={`Closed ${pipeline.closed}`} />}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400 align-middle" />New {pipeline.new}</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500 align-middle" />Contacted {pipeline.contacted}</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-600 align-middle" />Closed {pipeline.closed}</span>
            </div>
          </div>
        )}

        {leads.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-400">
            No leads yet. They appear here when buyers send an inquiry on your listings.
          </p>
        ) : filteredLeads.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center text-gray-400">No {leadFilter} leads.</p>
        ) : (
          <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {filteredLeads.map((lead) => {
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

        <div className="mt-10 mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Deals &amp; commission</h2>
          <span className="text-sm text-gray-500">Earned: <span className="font-semibold text-green-800">{formatINR(commissionTotal)}</span></span>
        </div>
        {soldListings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-400">
            Mark a listing as <span className="font-medium">sold</span> (in Manage listings) to record its sale price and commission here.
          </p>
        ) : (
          <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {soldListings.map((l) => (
              <DealRow
                key={l.id}
                listing={l}
                agentId={user.id}
                deal={deals[l.id]}
                onSaved={(id, d) => setDeals((prev) => ({ ...prev, [id]: d }))}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
