"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { CIRCLE_STATUS_LABELS } from "@/app/lib/co-buy/circles/types";
import { formatINRShort } from "@/app/lib/format";

export default function AdminCircles() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [circles, setCircles] = useState<Record<string, unknown>[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data } = await supabase.from("co_buy_circles").select("*, co_buy_opportunities(title)").order("created_at", { ascending: false });
      setCircles(data ?? []);
    })();
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) {
    return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;
  }

  const shown = filter === "all" ? circles : circles.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy" className="hover:text-green-800">Buying Circles</Link> / Circles</nav>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Circles</h1>
          <Link href="/admin/co-buy/circles/new" className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">+ New circle</Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {["all", ...Object.keys(CIRCLE_STATUS_LABELS)].map((st) => (
            <button key={st} onClick={() => setFilter(st)} className={`rounded-full px-3 py-1.5 text-xs ${filter === st ? "bg-green-700 text-white" : "border border-gray-300 bg-white text-gray-700 hover:border-green-500"}`}>
              {st === "all" ? "All" : CIRCLE_STATUS_LABELS[st as keyof typeof CIRCLE_STATUS_LABELS]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500"><th className="p-3">Circle</th><th className="p-3">Opportunity</th><th className="p-3">Status</th><th className="p-3">Members</th><th className="p-3">Commitment</th><th className="p-3"></th></tr></thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id as string} className="border-b border-gray-100">
                  <td className="p-3 font-medium">{c.name as string}</td>
                  <td className="p-3 text-gray-600">{(c.co_buy_opportunities as { title?: string })?.title ?? "—"}</td>
                  <td className="p-3 text-gray-600">{CIRCLE_STATUS_LABELS[c.status as keyof typeof CIRCLE_STATUS_LABELS] ?? (c.status as string)}</td>
                  <td className="p-3">{(c.current_members as number) ?? 0}{c.target_members ? ` / ${c.target_members}` : ""}</td>
                  <td className="p-3">{c.current_soft_commitment_amount ? formatINRShort(c.current_soft_commitment_amount as number) : "—"}</td>
                  <td className="p-3 text-right"><Link href={`/admin/co-buy/circles/${c.id}`} className="font-medium text-green-800 hover:underline">Manage</Link></td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-400">No circles{filter !== "all" ? " in this status" : " yet"}.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
