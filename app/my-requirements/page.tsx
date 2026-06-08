"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { useConfirm } from "@/app/components/ConfirmModal";
import { formatINRShort } from "@/app/lib/format";

const statusStyle: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  withdrawn: "bg-gray-200 text-gray-700",
};

// Build an Explore link from a requirement's preferences.
function matchHref(req: any): string {
  const sp = new URLSearchParams();
  if (req.preferred_district) sp.set("q", req.preferred_district);
  if (req.land_types?.length) sp.set("land_type", req.land_types[0]);
  if (req.budget_max) sp.set("max_price", String(req.budget_max));
  if (req.acreage_max) sp.set("max_area", String(req.acreage_max));
  return `/explore?${sp.toString()}`;
}

export default function MyRequirements() {
  const { user, loading } = useAuth();
  const [reqs, setReqs] = useState<any[]>([]);
  const [fetched, setFetched] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const confirm = useConfirm();

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("buyer_interests").select("*").eq("owner_user_id", user.id).order("created_at", { ascending: false });
    setReqs(data ?? []);
    setFetched(true);
  }
  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    await supabase.from("buyer_interests").update({ status }).eq("id", id);
    setReqs((cur) => cur.map((r) => (r.id === id ? { ...r, status } : r)));
    setBusyId(null);
  }
  async function remove(id: string) {
    if (!(await confirm({ title: "Delete requirement", message: "Delete this requirement?", confirmLabel: "Delete", tone: "danger" }))) return;
    setBusyId(id);
    await supabase.from("buyer_interests").delete().eq("id", id);
    setReqs((cur) => cur.filter((r) => r.id !== id));
    setBusyId(null);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">My requirements</h1>
          <Link href="/buy" className="shrink-0 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800">+ Post requirement</Link>
        </div>

        {!user && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">Sign in to manage the requirements you&apos;ve posted with an account.</p>
            <Link href="/auth/signin" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Sign in</Link>
          </div>
        )}

        {user && fetched && reqs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">You haven&apos;t posted any requirements from this account yet.</p>
            <Link href="/buy" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Post what you want to buy</Link>
          </div>
        )}

        <div className="space-y-4">
          {reqs.map((req) => (
            <div key={req.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyle[req.status] ?? "bg-gray-100 text-gray-600"}`}>{req.status ?? "active"}</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium capitalize text-green-800">{req.intent?.replace(/_/g, " ") ?? "General"}</span>
              </div>
              <h2 className="font-semibold">Looking for land in {[req.preferred_taluka, req.preferred_district].filter(Boolean).join(", ") || "any location"}</h2>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                {(req.budget_min || req.budget_max) && <span>💰 {req.budget_min ? formatINRShort(req.budget_min) : "₹0"} – {req.budget_max ? formatINRShort(req.budget_max) : "any"}</span>}
                {(req.acreage_min || req.acreage_max) && <span>📐 {req.acreage_min ?? "0"} – {req.acreage_max ?? "any"} acres</span>}
              </div>
              {req.notes && <p className="mt-2 text-sm text-gray-500">{req.notes}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-3 text-xs">
                <Link href={matchHref(req)} className="font-medium text-green-800 hover:underline">🔍 View matching listings →</Link>
                {(req.status ?? "active") === "active" ? (
                  <button onClick={() => setStatus(req.id, "withdrawn")} disabled={busyId === req.id} className="font-medium text-gray-500 hover:text-amber-700 disabled:opacity-50">Withdraw</button>
                ) : (
                  <button onClick={() => setStatus(req.id, "active")} disabled={busyId === req.id} className="font-medium text-gray-500 hover:text-green-800 disabled:opacity-50">Re-activate</button>
                )}
                <button onClick={() => remove(req.id)} disabled={busyId === req.id} className="font-medium text-gray-500 hover:text-red-600 disabled:opacity-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
