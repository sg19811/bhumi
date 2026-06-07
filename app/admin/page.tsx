"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import AdminListingRow from "@/app/components/AdminListingRow";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { formatINRShort } from "@/app/lib/format";
import { STATES } from "@/app/lib/legal/options";

// Buyer requirements that match a listing (affordable + right place + right type).
function matchesFor(listing: any, buyers: any[]) {
  return buyers.filter((b) => {
    if (b.status && b.status !== "active") return false;
    const budgetOk = b.budget_max == null || Number(b.budget_max) >= Number(listing.price);
    const district = (listing.district ?? "").toLowerCase();
    const pref = (b.preferred_district ?? "").toLowerCase();
    const districtOk = !pref || (!!district && (district === pref || district.includes(pref) || pref.includes(district)));
    const typeOk = !b.land_types?.length || (!!listing.land_type && b.land_types.includes(listing.land_type));
    return budgetOk && districtOk && typeOk;
  });
}

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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
  const [verifications, setVerifications] = useState<any[]>([]);
  const [vBusy, setVBusy] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [demand, setDemand] = useState<any[]>([]);
  const [legalLeads, setLegalLeads] = useState<any[]>([]);
  const [liveStates, setLiveStates] = useState<string[]>([]);
  const [listingQuery, setListingQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Read with the admin's own session — Supabase RLS (is_admin()) enforces access.
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [l, i, b, s, v, r, d, g, ls] = await Promise.all([
        supabase.from("listings").select("*").order("created_at", { ascending: false }),
        supabase.from("inquiries").select("*, listings(title)").order("created_at", { ascending: false }),
        supabase.from("buyer_interests").select("*").order("created_at", { ascending: false }),
        supabase.from("search_logs").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("verification_requests").select("*, listings(title)").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("reports").select("*, listings(title)").eq("resolved", false).order("created_at", { ascending: false }),
        supabase.from("demand_signals").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("legal_inquiries").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("legal_state_rules").select("state").eq("published", true),
      ]);
      setListings(l.data ?? []);
      setInquiries(i.data ?? []);
      setBuyers(b.data ?? []);
      setSearchLogs(s.data ?? []);
      setVerifications(v.data ?? []);
      setReports(r.data ?? []);
      setDemand(d.data ?? []);
      setLegalLeads(g.data ?? []);
      setLiveStates((ls.data ?? []).map((x: any) => x.state));
    })();
  }, [isAdmin]);

  async function resolveReport(reportId: string) {
    await supabase.from("reports").update({ resolved: true }).eq("id", reportId);
    setReports((cur) => cur.filter((x) => x.id !== reportId));
  }

  async function setLeadStatus(id: string, status: string) {
    await supabase.from("legal_inquiries").update({ status }).eq("id", id);
    setLegalLeads((cur) => cur.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  async function viewDoc(path: string) {
    const { data } = await supabase.storage.from("verification").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }
  async function approveVerification(reqId: string, listingId: string) {
    setVBusy(reqId);
    await supabase.from("verification_requests").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", reqId);
    await supabase.from("listings").update({ is_verified: true }).eq("id", listingId);
    setVerifications((cur) => cur.filter((r) => r.id !== reqId));
    setListings((cur) => cur.map((l) => (l.id === listingId ? { ...l, is_verified: true } : l)));
    setVBusy(null);
  }
  async function rejectVerification(reqId: string) {
    const note = prompt("Reason for rejection (shown to the seller):") ?? "";
    setVBusy(reqId);
    await supabase.from("verification_requests").update({ status: "rejected", note, reviewed_at: new Date().toISOString() }).eq("id", reqId);
    setVerifications((cur) => cur.filter((r) => r.id !== reqId));
    setVBusy(null);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Admins only</h1>
          <p className="mb-8 text-gray-500">
            {user ? "This area is restricted to AcreHub administrators." : "Please sign in with an admin account to continue."}
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
  const q = listingQuery.trim().toLowerCase();
  const filteredListings = sortedListings.filter((l) => {
    if (statusFilter && (l.status ?? "active") !== statusFilter) return false;
    if (q && !`${l.title ?? ""} ${l.district ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });

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

        {reports.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold">Reports ({reports.length})</h2>
            <div className="divide-y divide-gray-200 rounded-xl border border-red-200 bg-white shadow-sm">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-red-700">⚑ {r.reason || "Reported"}</p>
                    <p className="text-xs text-gray-500">on <Link href={`/listing/${r.listing_id}`} className="text-green-700 hover:underline">{r.listings?.title ?? "a listing"}</Link> · {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <button onClick={() => resolveReport(r.id)} className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Dismiss</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {verifications.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold">Verification requests ({verifications.length})</h2>
            <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {verifications.map((v) => (
                <div key={v.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/listing/${v.listing_id}`} className="text-sm font-medium hover:text-green-700">{v.listings?.title ?? "a listing"}</Link>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(v.documents ?? []).map((d: string, i: number) => (
                        <button key={i} onClick={() => viewDoc(d)} className="rounded-full border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:border-green-600 hover:text-green-800">📄 Doc {i + 1}</button>
                      ))}
                      {(v.documents ?? []).length === 0 && <span className="text-xs text-gray-400">No documents attached</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => approveVerification(v.id, v.listing_id)} disabled={vBusy === v.id} className="rounded-full bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800 disabled:opacity-50">Approve</button>
                    <button onClick={() => rejectVerification(v.id)} disabled={vBusy === v.id} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold">Legal guide status</h2>
          <p className="mb-3 text-sm text-gray-500">
            State guides go live only when published with a reviewer recorded. {liveStates.length} of {STATES.length} live.
          </p>
          <div className="flex flex-wrap gap-2">
            {STATES.map((st) => {
              const live = liveStates.includes(st.value);
              return (
                <span key={st.value} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${live ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                  {st.label}
                  <span className="text-xs font-medium">{live ? "● Live" : "○ Draft"}</span>
                </span>
              );
            })}
          </div>
          {liveStates.length < STATES.length && (
            <p className="mt-2 text-xs text-gray-400">Publish drafts by running the UPDATE in each supabase-legal-seed*.sql with your reviewer name.</p>
          )}
        </section>

        {legalLeads.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Legal enquiries ({legalLeads.length})</h2>
              <button
                onClick={() => downloadCSV("legal-enquiries.csv", legalLeads.map((g) => ({ date: g.created_at, name: g.name, phone: g.phone, whatsapp: g.whatsapp, email: g.email, state: g.state, district: g.district, land_type: g.land_type, buyer_type: g.buyer_type, concern: g.legal_concern, source: g.source_page, service: g.related_service_slug, status: g.status })))}
                className="text-sm text-green-700 hover:underline"
              >
                Export CSV
              </button>
            </div>
            <div className="divide-y divide-gray-200 rounded-xl border border-green-200 bg-white shadow-sm">
              {[...legalLeads]
                .sort((a, b) => (a.status === "new" ? 0 : 1) - (b.status === "new" ? 0 : 1))
                .slice(0, 25)
                .map((g) => {
                  const tone = g.status === "new" ? "bg-amber-100 text-amber-800" : g.status === "closed" ? "bg-gray-200 text-gray-600" : g.status === "routed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-700";
                  return (
                    <div key={g.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                          {g.name || "Enquiry"}
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tone}`}>{g.status ?? "new"}</span>
                          {g.state && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs capitalize text-green-800">{g.state.replace(/_/g, " ")}</span>}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {g.phone && <>📞 <a href={`tel:${g.phone}`} className="text-green-700 hover:underline">{g.phone}</a></>}
                          {g.email && <> · ✉ <a href={`mailto:${g.email}`} className="text-green-700 hover:underline">{g.email}</a></>}
                        </p>
                        {g.legal_concern && <p className="mt-1 text-xs text-gray-500">{g.legal_concern}</p>}
                        <p className="mt-1 text-[11px] text-gray-400">
                          {g.related_service_slug ? `service: ${g.related_service_slug} · ` : ""}{g.source_page ? `from ${g.source_page} · ` : ""}{new Date(g.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {g.status !== "contacted" && <button onClick={() => setLeadStatus(g.id, "contacted")} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Mark contacted</button>}
                        {g.status !== "closed" && <button onClick={() => setLeadStatus(g.id, "closed")} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">Close</button>}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Manage listings</h2>
              <span className="flex gap-3 text-sm">
                {listings.length > 0 && (
                  <button
                    onClick={() => downloadCSV("listings.csv", listings.map((l) => ({ title: l.title, status: l.status, price: l.price, area_value: l.area_value, area_unit: l.area_unit, district: l.district, taluka: l.taluka, village: l.village, land_type: l.land_type, is_verified: l.is_verified, views: l.views, created_at: l.created_at })))}
                    className="text-green-700 hover:underline"
                  >
                    Export CSV
                  </button>
                )}
                <Link href="/admin/import" className="text-green-700 hover:underline">Import CSV</Link>
                <Link href="/listing/new" className="text-green-700 hover:underline">+ New</Link>
              </span>
            </div>
            <div className="mb-3 flex gap-2">
              <input value={listingQuery} onChange={(e) => setListingQuery(e.target.value)} placeholder="Search title or district…" className="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm outline-none focus:border-green-600" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-green-600">
                <option value="">All</option><option value="pending">Pending</option><option value="active">Active</option><option value="sold">Sold</option><option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {filteredListings.map((l) => <AdminListingRow key={l.id} listing={l} />)}
              {filteredListings.length === 0 && <p className="p-4 text-sm text-gray-400">{listings.length === 0 ? "No listings yet." : "No listings match."}</p>}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent inquiries</h2>
              {inquiries.length > 0 && (
                <button
                  onClick={() => downloadCSV("inquiries.csv", inquiries.map((i) => ({ date: i.created_at, message: i.message, phone: i.contact_phone, listing: i.listings?.title ?? "" })))}
                  className="text-sm text-green-700 hover:underline"
                >
                  Export CSV
                </button>
              )}
            </div>
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Buyer requirements</h2>
              <div className="flex items-center gap-3">
                {buyers.length > 0 && (
                  <button
                    onClick={() => downloadCSV("buyer-requirements.csv", buyers.map((b) => ({ date: b.created_at, intent: b.intent, district: b.preferred_district, taluka: b.preferred_taluka, budget_min: b.budget_min, budget_max: b.budget_max, acreage_min: b.acreage_min, acreage_max: b.acreage_max, land_types: b.land_types, phone: b.contact_phone, whatsapp: b.contact_whatsapp, notes: b.notes })))}
                    className="text-sm text-green-700 hover:underline"
                  >
                    Export CSV
                  </button>
                )}
                <Link href="/requirements" className="text-sm text-green-700 hover:underline">View all</Link>
              </div>
            </div>
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

        {demand.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Demand signals</h2>
            <p className="mb-4 text-sm text-gray-500">People asked to be notified where we had no listings ({demand.length}) — source land here.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InsightList title="Wanted districts" items={topCounts(demand, "district")} />
              <InsightList title="Wanted land types" items={topCounts(demand, "land_type")} />
            </div>
          </section>
        )}

        {/* Match active listings to buyers who want them */}
        {(() => {
          const matchRows = listings
            .filter((l) => l.status === "active")
            .map((l) => ({ listing: l, matched: matchesFor(l, buyers) }))
            .filter((x) => x.matched.length > 0)
            .sort((a, b) => b.matched.length - a.matched.length)
            .slice(0, 10);
          return (
            <section className="mt-10">
              <h2 className="text-lg font-semibold">Demand matches</h2>
              <p className="mb-4 text-sm text-gray-500">Live listings that fit what buyers are after — reach out and connect them.</p>
              {matchRows.length === 0 ? (
                <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-400 shadow-sm">No matches yet — they appear as buyers post requirements.</p>
              ) : (
                <div className="space-y-3">
                  {matchRows.map(({ listing, matched }) => (
                    <div key={listing.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <Link href={`/listing/${listing.id}`} className="truncate font-medium hover:text-green-700">{listing.title}</Link>
                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">{matched.length} buyer{matched.length > 1 ? "s" : ""}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {matched.slice(0, 8).map((b) => (
                          <a key={b.id} href={`tel:${b.contact_phone}`} className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-green-600 hover:text-green-800">
                            📞 {b.contact_phone}{b.budget_max ? ` · up to ${formatINRShort(b.budget_max)}` : ""}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })()}
      </main>
    </div>
  );
}
