"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { VENDOR_CATEGORIES } from "@/app/lib/co-buy/services/catalog";

const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";

export default function AdminVendorForm({ existing }: { existing?: Record<string, unknown> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    vendor_name: (existing?.vendor_name as string) ?? "",
    vendor_category: (existing?.vendor_category as string) ?? "lawyer",
    primary_contact_name: (existing?.primary_contact_name as string) ?? "",
    phone: (existing?.phone as string) ?? "",
    whatsapp: (existing?.whatsapp as string) ?? "",
    email: (existing?.email as string) ?? "",
    city: (existing?.city as string) ?? "",
    state: (existing?.state as string) ?? "",
    verification_status: (existing?.verification_status as string) ?? "unverified",
    internal_score: existing?.internal_score != null ? String(existing.internal_score) : "",
    price_range_notes: (existing?.price_range_notes as string) ?? "",
    active: existing?.active !== false,
    internal_notes: (existing?.internal_notes as string) ?? "",
  });
  const set = (k: string, v: unknown) => setF((c) => ({ ...c, [k]: v }));

  async function save() {
    if (!f.vendor_name.trim() || !f.phone.trim()) { setError("Name and phone are required."); return; }
    setBusy(true); setError("");
    const payload = {
      vendor_name: f.vendor_name.trim(), vendor_category: f.vendor_category, primary_contact_name: f.primary_contact_name || null,
      phone: f.phone.trim(), whatsapp: f.whatsapp || null, email: f.email || null, city: f.city || null, state: f.state || null,
      verification_status: f.verification_status, internal_score: f.internal_score ? Number(f.internal_score) : null,
      price_range_notes: f.price_range_notes || null, active: f.active, internal_notes: f.internal_notes || null,
      updated_at: new Date().toISOString(),
    };
    const res = existing ? await supabase.from("acrehub_vendors").update(payload).eq("id", existing.id as string) : await supabase.from("acrehub_vendors").insert(payload);
    setBusy(false);
    if (res.error) { setError(res.error.message); return; }
    router.push("/admin/vendors");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Vendor name *</span><input value={f.vendor_name} onChange={(e) => set("vendor_name", e.target.value)} className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Category</span><select value={f.vendor_category} onChange={(e) => set("vendor_category", e.target.value)} className={field}>{VENDOR_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Contact name</span><input value={f.primary_contact_name} onChange={(e) => set("primary_contact_name", e.target.value)} className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Phone *</span><input value={f.phone} onChange={(e) => set("phone", e.target.value)} className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">WhatsApp</span><input value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Email</span><input value={f.email} onChange={(e) => set("email", e.target.value)} className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">City</span><input value={f.city} onChange={(e) => set("city", e.target.value)} className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">State</span><input value={f.state} onChange={(e) => set("state", e.target.value)} className={field} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Verification</span><select value={f.verification_status} onChange={(e) => set("verification_status", e.target.value)} className={field}><option value="unverified">Unverified</option><option value="verified">Verified</option><option value="paused">Paused</option><option value="blocked">Blocked</option></select></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-gray-700">Internal score (1-5)</span><input value={f.internal_score} onChange={(e) => set("internal_score", e.target.value)} type="number" min="1" max="5" className={field} /></label>
      </div>
      <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Price range notes</span><input value={f.price_range_notes} onChange={(e) => set("price_range_notes", e.target.value)} placeholder="e.g. fencing ~₹150/ft as of Jan 2026" className={field} /></label>
      <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Internal notes</span><textarea value={f.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} rows={2} className={field} /></label>
      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-green-700" />Active</label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={busy} className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Saving…" : existing ? "Save vendor" : "Add vendor"}</button>
    </div>
  );
}
