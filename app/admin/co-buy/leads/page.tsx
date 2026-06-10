"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import AdminCoBuyLeadDrawer from "@/app/components/co-buy/AdminCoBuyLeadDrawer";
import { CO_BUY_INTEREST_STATUS_LABELS } from "@/app/lib/co-buy/types";

type Lead = Record<string, unknown> & { id: string; status: string };

export default function AdminCoBuyLeads() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data } = await supabase
        .from("co_buy_interests")
        .select("*, co_buy_opportunities(title)")
        .order("created_at", { ascending: false })
        .limit(500);
      setLeads((data as Lead[]) ?? []);
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

  const shown = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy" className="hover:text-green-800">Buying Circles</Link> / Leads</nav>
        <h1 className="mb-4 text-3xl font-bold">Leads</h1>

        <div className="mb-4 flex flex-wrap gap-2">
          {["all", ...Object.keys(CO_BUY_INTEREST_STATUS_LABELS)].map((st) => (
            <button key={st} onClick={() => setFilter(st)} className={`rounded-full px-3.5 py-1.5 text-sm ${filter === st ? "bg-green-700 text-white" : "border border-gray-300 bg-white text-gray-700 hover:border-green-500"}`}>
              {st === "all" ? "All" : CO_BUY_INTEREST_STATUS_LABELS[st as keyof typeof CO_BUY_INTEREST_STATUS_LABELS]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500"><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Opportunity</th><th className="p-3">Type</th><th className="p-3">Timeline</th><th className="p-3">Status</th><th className="p-3">When</th></tr></thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.id} onClick={() => setSelected(l)} className="cursor-pointer border-b border-gray-100 hover:bg-green-50/40">
                  <td className="p-3 font-medium">{String(l.name)}</td>
                  <td className="p-3 text-gray-600">{String(l.phone)}</td>
                  <td className="p-3 text-gray-600">{(l.co_buy_opportunities as { title?: string })?.title ?? "—"}</td>
                  <td className="p-3 text-gray-600">{String(l.buyer_type ?? "—")}</td>
                  <td className="p-3 text-gray-600">{String(l.timeline ?? "—")}</td>
                  <td className="p-3">{CO_BUY_INTEREST_STATUS_LABELS[l.status as keyof typeof CO_BUY_INTEREST_STATUS_LABELS] ?? l.status}</td>
                  <td className="p-3 text-gray-400">{l.created_at ? new Date(l.created_at as string).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-400">No leads{filter !== "all" ? " in this status" : " yet"}.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>

      {selected && (
        <AdminCoBuyLeadDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onSaved={(id, status, notes) => {
            setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, status, qualification_notes: notes } : l)));
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
