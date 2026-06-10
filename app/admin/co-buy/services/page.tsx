"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { SERVICE_STATUS_LABELS, serviceCategoryLabel } from "@/app/lib/co-buy/services/catalog";
import { formatINRShort } from "@/app/lib/format";

export default function AdminServices() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [reqs, setReqs] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("co_buy_service_requests").select("*, co_buy_circles(name)").order("created_at", { ascending: false }).then(({ data }) => setReqs(data ?? []));
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy" className="hover:text-green-800">Buying Circles</Link> / Services</nav>
        <h1 className="mb-4 text-3xl font-bold">Service requests</h1>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500"><th className="p-3">Service</th><th className="p-3">Circle</th><th className="p-3">Status</th><th className="p-3">Est. total</th><th className="p-3"></th></tr></thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r.id as string} className="border-b border-gray-100">
                  <td className="p-3"><span className="font-medium">{r.title as string}</span><br /><span className="text-xs text-gray-400">{serviceCategoryLabel(r.service_category as string)}</span></td>
                  <td className="p-3 text-gray-600">{(r.co_buy_circles as { name?: string })?.name ?? "—"}</td>
                  <td className="p-3 text-gray-600">{SERVICE_STATUS_LABELS[r.status as string] ?? (r.status as string)}</td>
                  <td className="p-3">{r.estimated_total_cost ? formatINRShort(r.estimated_total_cost as number) : "—"}</td>
                  <td className="p-3 text-right"><Link href={`/admin/co-buy/services/${r.id}`} className="font-medium text-green-800 hover:underline">Manage</Link></td>
                </tr>
              ))}
              {reqs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">No service requests yet. Create one from a circle.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
