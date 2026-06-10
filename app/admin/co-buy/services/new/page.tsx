"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth";
import { createServiceRequest } from "@/app/lib/co-buy/services/service-actions";
import { SERVICE_CATEGORIES, COST_COLUMNS, SERVICE_DISCLAIMERS } from "@/app/lib/co-buy/services/catalog";

const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";

function NewServiceInner() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const circleId = sp.get("circle_id") ?? "";
  const [category, setCategory] = useState(sp.get("category") ?? "co_buy_coordination");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [costs, setCosts] = useState<Record<string, string>>({ official_fees_estimate: "", vendor_cost_estimate: "", acrehub_service_fee: "" });
  const [feeNotes, setFeeNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") return <main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main>;

  async function save() {
    if (!circleId) { setError("Missing circle. Open this from a circle's Add-service action."); return; }
    if (!title.trim()) { setError("Title is required."); return; }
    setBusy(true); setError("");
    const res = await createServiceRequest({
      circle_id: circleId, service_category: category, title: title.trim(), description: description || null,
      official_fees_estimate: Number(costs.official_fees_estimate) || 0, vendor_cost_estimate: Number(costs.vendor_cost_estimate) || 0,
      acrehub_service_fee: Number(costs.acrehub_service_fee) || 0, fee_notes: feeNotes || null, buyer_visible_summary: summary || null,
    });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Could not create."); return; }
    router.push(`/admin/co-buy/services/${res.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/co-buy/services" className="hover:text-green-800">Services</Link> / New</nav>
      <h1 className="mb-6 text-3xl font-bold">New service request</h1>
      {!circleId && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Open this from a circle so it links correctly.</p>}
      <div className="space-y-4">
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Category</span><select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>{SERVICE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Title *</span><input value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Description / scope</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={field} /></label>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-semibold text-gray-800">Cost estimate — three separate columns (never a lone total)</p>
          <div className="space-y-3">
            {COST_COLUMNS.map((c) => (
              <label key={c.key} className="block text-sm">
                <span className="block font-medium text-gray-700">{c.label} (₹)</span>
                <span className="mb-1 block text-xs text-gray-500">{c.explainer}</span>
                <input value={costs[c.key]} onChange={(e) => setCosts((x) => ({ ...x, [c.key]: e.target.value }))} type="number" className={field} />
              </label>
            ))}
          </div>
        </div>
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Fee notes (explain the model in plain words)</span><input value={feeNotes} onChange={(e) => setFeeNotes(e.target.value)} className={field} /></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Member-visible summary</span><textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={field} /></label>
        <p className="text-xs text-gray-400">{SERVICE_DISCLAIMERS.noMoneyInPlatform}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={save} disabled={busy} className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Creating…" : "Create request"}</button>
      </div>
    </main>
  );
}

export default function NewServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>}><NewServiceInner /></Suspense>
    </div>
  );
}
