"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { formatINRShort, pricePerAcre } from "@/app/lib/format";
import { landLabel } from "@/app/lib/land";

// ---- helpers ---------------------------------------------------------------
const norm = (s: unknown) => (s ?? "").toString().trim().toLowerCase();
const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

type Row = { key: string; demand: number; supply: number };

function Bars({ rows, max, render }: { rows: Row[]; max: number; render: (r: Row) => React.ReactNode }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium capitalize text-gray-800">{cap(r.key)}</span>
            <span className="shrink-0 text-gray-500">{render(r)}</span>
          </div>
          <div className="flex h-2 gap-1">
            <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${(r.demand / max) * 100}%` }} title={`Demand ${r.demand}`} />
            </div>
            <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-green-600" style={{ width: `${(r.supply / max) * 100}%` }} title={`Supply ${r.supply}`} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Intelligence() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [listings, setListings] = useState<any[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [demand, setDemand] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [l, s, d, b] = await Promise.all([
        supabase.from("listings").select("district, land_type, status, price, price_basis, area_value, area_unit").eq("status", "active"),
        supabase.from("search_logs").select("district, land_type").order("created_at", { ascending: false }).limit(2000),
        supabase.from("demand_signals").select("district, land_type"),
        supabase.from("buyer_interests").select("preferred_district, land_types, status"),
      ]);
      setListings(l.data ?? []);
      setSearches(s.data ?? []);
      setDemand(d.data ?? []);
      setBuyers(b.data ?? []);
      setReady(true);
    })();
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Admins only</h1>
          <Link href={user ? "/" : "/auth/signin"} className="mt-4 inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">{user ? "Go home" : "Sign in"}</Link>
        </main>
      </div>
    );
  }

  // ---- demand scoring (weighted): requirement > notify-me > search ----------
  const districtDemand = new Map<string, number>();
  const districtSupply = new Map<string, number>();
  const typeDemand = new Map<string, number>();
  const typeSupply = new Map<string, number>();
  const add = (m: Map<string, number>, k: string, w: number) => { if (k) m.set(k, (m.get(k) ?? 0) + w); };

  for (const r of searches) { add(districtDemand, norm(r.district), 1); add(typeDemand, norm(r.land_type), 1); }
  for (const r of demand) { add(districtDemand, norm(r.district), 2); add(typeDemand, norm(r.land_type), 2); }
  for (const r of buyers) {
    if (r.status && r.status !== "active") continue;
    add(districtDemand, norm(r.preferred_district), 3);
    (r.land_types ?? []).forEach((t: string) => add(typeDemand, norm(t), 3));
  }
  for (const l of listings) { add(districtSupply, norm(l.district), 1); add(typeSupply, norm(l.land_type), 1); }

  // ---- sourcing priorities: where demand most outstrips supply --------------
  const districtKeys = new Set<string>([...districtDemand.keys(), ...districtSupply.keys()]);
  const districtRows: Row[] = [...districtKeys]
    .map((key) => ({ key, demand: districtDemand.get(key) ?? 0, supply: districtSupply.get(key) ?? 0 }))
    .filter((r) => r.demand > 0)
    .sort((a, b) => (b.demand - b.supply) - (a.demand - a.supply));

  const typeKeys = new Set<string>([...typeDemand.keys(), ...typeSupply.keys()]);
  const typeRows: Row[] = [...typeKeys]
    .map((key) => ({ key, demand: typeDemand.get(key) ?? 0, supply: typeSupply.get(key) ?? 0 }))
    .filter((r) => r.demand > 0)
    .sort((a, b) => b.demand - a.demand);

  const unmet = districtRows.filter((r) => r.supply === 0).slice(0, 8);
  const maxDistrict = Math.max(1, ...districtRows.map((r) => Math.max(r.demand, r.supply)));
  const maxType = Math.max(1, ...typeRows.map((r) => Math.max(r.demand, r.supply)));

  // ---- price benchmarks by district (median rupees/acre) --------------------
  const byDistrictPrices = new Map<string, number[]>();
  for (const l of listings) {
    const ppa = pricePerAcre(l);
    if (!ppa) continue;
    const k = norm(l.district);
    if (!k) continue;
    if (!byDistrictPrices.has(k)) byDistrictPrices.set(k, []);
    byDistrictPrices.get(k)!.push(ppa);
  }
  const priceRows = [...byDistrictPrices.entries()]
    .map(([key, vals]) => ({ key, count: vals.length, median: median(vals) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalDemand = [...districtDemand.values()].reduce((a, b) => a + b, 0);
  const hasData = totalDemand > 0 || listings.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Founder Intelligence</h1>
          <Link href="/admin" className="text-sm text-green-700 hover:underline">← Dashboard</Link>
        </div>
        <p className="mb-8 text-gray-500">Where demand outstrips supply — so you know what land to source, and where. Demand is weighted: requirement ×3, notify-me ×2, search ×1.</p>

        {!ready ? (
          <p className="text-gray-400">Loading signals…</p>
        ) : !hasData ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
            Not enough signal yet. As buyers search, post requirements, and ask to be notified, this fills in.
          </div>
        ) : (
          <div className="space-y-10">
            {/* Sourcing priorities */}
            <section>
              <h2 className="text-lg font-semibold">Sourcing priorities by district</h2>
              <p className="mb-1 text-sm text-gray-500">Sorted by demand-minus-supply gap. <span className="text-amber-700">Amber = demand</span>, <span className="text-green-700">green = supply</span>.</p>
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                {districtRows.length ? <Bars rows={districtRows.slice(0, 12)} max={maxDistrict} render={(r) => `${r.demand} vs ${r.supply}${r.supply === 0 ? " · source!" : ""}`} /> : <p className="text-sm text-gray-400">No district demand yet.</p>}
              </div>
            </section>

            {/* Unmet demand */}
            {unmet.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">Unmet demand — wanted, but zero active listings</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {unmet.map((r) => (
                    <span key={r.key} className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
                      {cap(r.key)} <span className="text-xs text-amber-600">demand {r.demand}</span>
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Land type demand vs supply */}
            <section>
              <h2 className="text-lg font-semibold">Demand vs supply by land type</h2>
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                {typeRows.length ? <Bars rows={typeRows.slice(0, 10).map((r) => ({ ...r, key: landLabel(r.key) }))} max={maxType} render={(r) => `${r.demand} vs ${r.supply}`} /> : <p className="text-sm text-gray-400">No land-type demand yet.</p>}
              </div>
            </section>

            {/* Price benchmarks */}
            <section>
              <h2 className="text-lg font-semibold">Price benchmarks (median ₹/acre by district)</h2>
              <p className="mb-1 text-sm text-gray-500">From active listings — what land is actually priced at where you have supply.</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {priceRows.length ? (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-left text-gray-500"><th className="px-4 py-2 font-medium">District</th><th className="px-4 py-2 font-medium">Listings</th><th className="px-4 py-2 font-medium">Median ₹/acre</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {priceRows.map((r) => (
                        <tr key={r.key}><td className="px-4 py-2 font-medium capitalize text-gray-800">{cap(r.key)}</td><td className="px-4 py-2 text-gray-600">{r.count}</td><td className="px-4 py-2 font-semibold text-green-800">{formatINRShort(r.median)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="p-4 text-sm text-gray-400">No priceable listings yet.</p>}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
