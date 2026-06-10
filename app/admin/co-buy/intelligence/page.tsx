"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { serviceCategoryLabel } from "@/app/lib/co-buy/services/catalog";
import { formatINRShort } from "@/app/lib/format";

type Row = Record<string, unknown>;

export default function CoBuyIntelligence() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [corridors, setCorridors] = useState<Row[]>([]);
  const [funnel, setFunnel] = useState<Row | null>(null);
  const [revenue, setRevenue] = useState<Row[]>([]);
  const [vendors, setVendors] = useState<Row[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [c, f, r, v] = await Promise.all([
        supabase.from("view_co_buy_corridor_demand").select("*"),
        supabase.from("view_co_buy_funnel").select("*").maybeSingle(),
        supabase.from("view_co_buy_service_revenue").select("*").limit(12),
        supabase.from("view_co_buy_vendor_performance").select("*"),
      ]);
      setCorridors(c.data ?? []); setFunnel(f.data ?? null); setRevenue(r.data ?? []); setVendors(v.data ?? []);
    })();
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;

  const funnelSteps = funnel ? [
    ["New", funnel.new_count], ["Contacted", funnel.contacted_count], ["Qualified", funnel.qualified_count],
    ["In circle", funnel.in_circle_count], ["NRI review", funnel.nri_review_count], ["Dropped", funnel.dropped_count],
  ] as [string, number][] : [];
  const funnelMax = Math.max(1, ...funnelSteps.map(([, n]) => Number(n) || 0));
  const Sec = "mb-8 rounded-2xl border border-gray-200 bg-white p-5";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy" className="hover:text-green-800">Buying Circles</Link> / Intelligence</nav>
        <h1 className="mb-6 text-3xl font-bold">Buying Circles intelligence</h1>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Lead funnel (last 90 days)</h2>
          {funnelSteps.map(([label, n]) => (
            <div key={label} className="mb-1.5 flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-gray-600">{label}</span>
              <span className="h-4 rounded bg-green-500" style={{ width: `${(Number(n) / funnelMax) * 70 + 2}%` }} />
              <span className="text-gray-500">{Number(n) || 0}</span>
            </div>
          ))}
          {!funnel && <p className="text-sm text-gray-400">No data yet.</p>}
        </section>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Corridor demand</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-2">Corridor</th><th className="p-2">State</th><th className="p-2">Interest</th><th className="p-2">Qualified</th><th className="p-2">Circles</th><th className="p-2">Completed</th></tr></thead>
            <tbody>{corridors.map((c, i) => <tr key={i} className="border-b border-gray-100"><td className="p-2">{(c.corridor as string) ?? "—"}</td><td className="p-2">{(c.state as string) ?? "—"}</td><td className="p-2">{(c.interest_count as number) ?? 0}</td><td className="p-2">{(c.qualified_count as number) ?? 0}</td><td className="p-2">{(c.circle_count as number) ?? 0}</td><td className="p-2">{(c.completed_circles as number) ?? 0}</td></tr>)}
            {corridors.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-400">No data yet.</td></tr>}</tbody></table>
          </div>
        </section>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Service revenue (by month)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-2">Month</th><th className="p-2">Service</th><th className="p-2">Completed</th><th className="p-2">AcrehubIndia fees</th><th className="p-2">Total volume</th></tr></thead>
            <tbody>{revenue.map((r, i) => <tr key={i} className="border-b border-gray-100"><td className="p-2">{r.month ? new Date(r.month as string).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}</td><td className="p-2">{serviceCategoryLabel(r.service_category as string)}</td><td className="p-2">{(r.completed_requests as number) ?? 0}</td><td className="p-2">{formatINRShort((r.total_acrehub_fees as number) ?? 0)}</td><td className="p-2">{formatINRShort((r.total_volume as number) ?? 0)}</td></tr>)}
            {revenue.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400">No completed services yet.</td></tr>}</tbody></table>
          </div>
        </section>

        <section className={Sec}>
          <h2 className="mb-3 font-semibold">Vendor performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-2">Vendor</th><th className="p-2">Category</th><th className="p-2">Quotes</th><th className="p-2">Selected</th><th className="p-2">Completed</th></tr></thead>
            <tbody>{vendors.map((v, i) => <tr key={i} className="border-b border-gray-100"><td className="p-2">{v.vendor_name as string}</td><td className="p-2">{v.vendor_category as string}</td><td className="p-2">{(v.quotes_provided as number) ?? 0}</td><td className="p-2">{(v.quotes_selected as number) ?? 0}</td><td className="p-2">{(v.services_completed as number) ?? 0}</td></tr>)}
            {vendors.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400">No vendor activity yet.</td></tr>}</tbody></table>
          </div>
        </section>
      </main>
    </div>
  );
}
