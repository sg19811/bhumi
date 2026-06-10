"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { formatINRShort } from "@/app/lib/format";

export default function AdminMaintenance() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [circles, setCircles] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("co_buy_circles").select("id, name, post_purchase_at, maintenance_subscription_status, maintenance_fee_monthly, updated_at").not("post_purchase_at", "is", null).order("post_purchase_at", { ascending: false }).then(({ data }) => {
      const cutoff = Date.now() - 182 * 86400000;
      setCircles((data ?? []).map((c) => ({ ...c, dormant: c.updated_at ? new Date(c.updated_at as string).getTime() < cutoff : false })));
    });
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;

  const active = circles.filter((c) => c.maintenance_subscription_status === "active");
  const mrr = active.reduce((s, c) => s + ((c.maintenance_fee_monthly as number) ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900"><Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy" className="hover:text-green-800">Buying Circles</Link> / Maintenance</nav>
        <h1 className="mb-4 text-3xl font-bold">Maintenance &amp; post-purchase</h1>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[["Post-purchase circles", String(circles.length)], ["Active subscriptions", String(active.length)], ["Monthly recurring", formatINRShort(mrr)]].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-gray-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-green-800">{v}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{k}</p></div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-3">Circle</th><th className="p-3">Subscription</th><th className="p-3">Monthly fee</th><th className="p-3">Activity</th><th className="p-3"></th></tr></thead>
          <tbody>{circles.map((c) => {
            const dormant = c.dormant as boolean;
            return <tr key={c.id as string} className="border-b border-gray-100"><td className="p-3 font-medium">{c.name as string}</td><td className="p-3 text-gray-600">{(c.maintenance_subscription_status as string) ?? "—"}</td><td className="p-3">{c.maintenance_fee_monthly ? formatINRShort(c.maintenance_fee_monthly as number) : "—"}</td><td className="p-3">{dormant ? <span className="text-amber-600">⚠ dormant 6mo+</span> : <span className="text-gray-400">active</span>}</td><td className="p-3 text-right"><Link href={`/admin/co-buy/circles/${c.id}`} className="font-medium text-green-800 hover:underline">Open</Link></td></tr>;
          })}
          {circles.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">No post-purchase circles yet.</td></tr>}</tbody></table>
        </div>
      </main>
    </div>
  );
}
