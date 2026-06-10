"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { CO_BUY_STATUS_LABELS, CO_BUY_PUBLIC_STATUSES } from "@/app/lib/co-buy/types";
import { formatINRShort } from "@/app/lib/format";

export default function AdminCoBuy() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [opps, setOpps] = useState<Record<string, unknown>[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<string[]>([]);
  const [circleStatuses, setCircleStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [o, l, c] = await Promise.all([
        supabase.from("co_buy_opportunities").select("*").order("created_at", { ascending: false }),
        supabase.from("co_buy_interests").select("status"),
        supabase.from("co_buy_circles").select("status"),
      ]);
      setOpps(o.data ?? []);
      setLeadStatuses((l.data ?? []).map((r: { status: string }) => r.status));
      setCircleStatuses((c.data ?? []).map((r: { status: string }) => r.status));
    })();
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900"><Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main>
      </div>
    );
  }

  const openCount = opps.filter((o) => CO_BUY_PUBLIC_STATUSES.includes(o.status as never)).length;
  const newLeads = leadStatuses.filter((s) => s === "new").length;
  const qualified = leadStatuses.filter((s) => s === "qualified").length;
  const activeCircles = circleStatuses.filter((s) => !["completed", "cancelled", "archived"].includes(s)).length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Buying Circles</h1>
          <Link href="/admin/co-buy/opportunities/new" className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">+ New opportunity</Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Open opportunities", openCount], ["New leads", newLeads], ["Qualified", qualified], ["Active circles", activeCircles]].map(([k, v]) => (
            <div key={k as string} className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-800">{v as number}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{k as string}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/admin/co-buy/leads" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Leads →</Link>
          <Link href="/admin/co-buy/circles" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Circles →</Link>
          <Link href="/admin/co-buy/services" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Services →</Link>
          <Link href="/admin/vendors" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Vendors →</Link>
          <Link href="/admin/co-buy/intelligence" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Intelligence →</Link>
          <Link href="/admin/templates" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Templates →</Link>
          <Link href="/admin/team" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Team →</Link>
          <Link href="/admin/audit" className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">Audit →</Link>
        </div>

        <h2 className="mb-3 text-lg font-semibold">Opportunities</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500"><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Price</th><th className="p-3">Interest</th><th className="p-3"></th></tr></thead>
            <tbody>
              {opps.map((o) => (
                <tr key={o.id as string} className="border-b border-gray-100">
                  <td className="p-3 font-medium">{o.title as string}</td>
                  <td className="p-3 text-gray-600">{CO_BUY_STATUS_LABELS[o.status as keyof typeof CO_BUY_STATUS_LABELS] ?? (o.status as string)}</td>
                  <td className="p-3">{o.total_price ? formatINRShort(o.total_price as number) : "—"}</td>
                  <td className="p-3">{(o.current_interest_count as number) ?? 0}</td>
                  <td className="p-3 text-right"><Link href={`/admin/co-buy/opportunities/${o.id}`} className="font-medium text-green-800 hover:underline">Edit</Link></td>
                </tr>
              ))}
              {opps.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">No opportunities yet. Create one to get started.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
