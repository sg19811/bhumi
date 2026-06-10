"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { coBuySlug } from "@/app/lib/co-buy/slug";
import { CO_BUY_STATUS_LABELS } from "@/app/lib/co-buy/types";
import type { CoBuyOpportunity, CoBuyStatus } from "@/app/lib/co-buy/types";

const field = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">{label}</span>{children}</label>
  );
}

export default function AdminCoBuyOpportunityForm({
  existing,
  listingId,
}: {
  existing?: CoBuyOpportunity;
  listingId?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    listing_id: existing?.listing_id ?? listingId ?? "",
    title: existing?.title ?? "",
    slug: existing?.slug ?? "",
    summary: existing?.summary ?? "",
    status: (existing?.status ?? "draft") as CoBuyStatus,
    total_area_value: existing?.total_area_value?.toString() ?? "",
    total_area_unit: existing?.total_area_unit ?? "acre",
    total_price: existing?.total_price?.toString() ?? "",
    estimated_all_in_cost: existing?.estimated_all_in_cost?.toString() ?? "",
    price_per_acre: existing?.price_per_acre?.toString() ?? "",
    min_contribution: existing?.min_contribution?.toString() ?? "",
    suggested_contribution: existing?.suggested_contribution?.toString() ?? "",
    max_members: existing?.max_members?.toString() ?? "",
    target_members: existing?.target_members?.toString() ?? "",
    current_soft_commitment_amount: existing?.current_soft_commitment_amount?.toString() ?? "",
    legal_caution_level: existing?.legal_caution_level ?? "standard",
    is_nri_allowed: existing?.is_nri_allowed ?? false,
    site_visit_dates: (existing?.site_visit_dates ?? []).join(", "),
    service_layer_enabled: existing?.service_layer_enabled ?? true,
    public_disclaimer: existing?.public_disclaimer ?? "",
    internal_notes: existing?.internal_notes ?? "",
  });
  const set = (k: string, v: unknown) => setF((c) => ({ ...c, [k]: v }));

  async function save() {
    if (!f.listing_id.trim() || !f.title.trim()) { setError("Listing ID and title are required."); return; }
    setBusy(true); setError("");
    const payload = {
      listing_id: f.listing_id.trim(),
      title: f.title.trim(),
      slug: f.slug.trim() || coBuySlug(f.title, existing?.id),
      summary: f.summary.trim() || null,
      status: f.status,
      total_area_value: numOrNull(f.total_area_value),
      total_area_unit: f.total_area_unit || null,
      total_price: numOrNull(f.total_price),
      estimated_all_in_cost: numOrNull(f.estimated_all_in_cost),
      price_per_acre: numOrNull(f.price_per_acre),
      min_contribution: numOrNull(f.min_contribution),
      suggested_contribution: numOrNull(f.suggested_contribution),
      max_members: numOrNull(f.max_members),
      target_members: numOrNull(f.target_members),
      current_soft_commitment_amount: numOrNull(f.current_soft_commitment_amount) ?? 0,
      legal_caution_level: f.legal_caution_level,
      is_nri_allowed: f.is_nri_allowed,
      site_visit_dates: f.site_visit_dates.split(",").map((s) => s.trim()).filter(Boolean),
      service_layer_enabled: f.service_layer_enabled,
      public_disclaimer: f.public_disclaimer.trim() || null,
      internal_notes: f.internal_notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const res = existing
      ? await supabase.from("co_buy_opportunities").update(payload).eq("id", existing.id)
      : await supabase.from("co_buy_opportunities").insert(payload);
    setBusy(false);
    if (res.error) { setError(res.error.message); return; }
    router.push("/admin/co-buy");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <L label="Linked listing ID *"><input value={f.listing_id} onChange={(e) => set("listing_id", e.target.value)} className={field} /></L>
        <L label="Status"><select value={f.status} onChange={(e) => set("status", e.target.value)} className={field}>{Object.entries(CO_BUY_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></L>
        <L label="Title *"><input value={f.title} onChange={(e) => set("title", e.target.value)} className={field} /></L>
        <L label="Slug (auto if blank)"><input value={f.slug} onChange={(e) => set("slug", e.target.value)} className={field} /></L>
      </div>
      <L label="Summary"><textarea value={f.summary} onChange={(e) => set("summary", e.target.value)} rows={2} className={field} /></L>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <L label="Total area"><input value={f.total_area_value} onChange={(e) => set("total_area_value", e.target.value)} type="number" className={field} /></L>
        <L label="Unit"><select value={f.total_area_unit} onChange={(e) => set("total_area_unit", e.target.value)} className={field}><option value="acre">acre</option><option value="guntha">guntha</option><option value="cent">cent</option></select></L>
        <L label="Total price (₹)"><input value={f.total_price} onChange={(e) => set("total_price", e.target.value)} type="number" className={field} /></L>
        <L label="₹ / acre"><input value={f.price_per_acre} onChange={(e) => set("price_per_acre", e.target.value)} type="number" className={field} /></L>
        <L label="Est. all-in (₹)"><input value={f.estimated_all_in_cost} onChange={(e) => set("estimated_all_in_cost", e.target.value)} type="number" className={field} /></L>
        <L label="Min contribution (₹)"><input value={f.min_contribution} onChange={(e) => set("min_contribution", e.target.value)} type="number" className={field} /></L>
        <L label="Suggested contribution (₹)"><input value={f.suggested_contribution} onChange={(e) => set("suggested_contribution", e.target.value)} type="number" className={field} /></L>
        <L label="Soft commitment (₹)"><input value={f.current_soft_commitment_amount} onChange={(e) => set("current_soft_commitment_amount", e.target.value)} type="number" className={field} /></L>
        <L label="Target members"><input value={f.target_members} onChange={(e) => set("target_members", e.target.value)} type="number" className={field} /></L>
        <L label="Max members"><input value={f.max_members} onChange={(e) => set("max_members", e.target.value)} type="number" className={field} /></L>
        <L label="Legal caution"><select value={f.legal_caution_level} onChange={(e) => set("legal_caution_level", e.target.value)} className={field}><option value="standard">standard</option><option value="elevated">elevated</option><option value="high">high</option></select></L>
      </div>
      <L label="Site visit dates (comma-separated, e.g. 2026-07-12, 2026-07-19)"><input value={f.site_visit_dates} onChange={(e) => set("site_visit_dates", e.target.value)} className={field} /></L>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={f.is_nri_allowed} onChange={(e) => set("is_nri_allowed", e.target.checked)} className="h-4 w-4 accent-green-700" />NRI allowed</label>
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={f.service_layer_enabled} onChange={(e) => set("service_layer_enabled", e.target.checked)} className="h-4 w-4 accent-green-700" />Show services layer</label>
      </div>
      <L label="Public disclaimer override (optional)"><textarea value={f.public_disclaimer} onChange={(e) => set("public_disclaimer", e.target.value)} rows={2} className={field} /></L>
      <L label="Internal notes (admin-only)"><textarea value={f.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} rows={2} className={field} /></L>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={busy} className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Saving…" : existing ? "Save changes" : "Create opportunity"}</button>
    </div>
  );
}
