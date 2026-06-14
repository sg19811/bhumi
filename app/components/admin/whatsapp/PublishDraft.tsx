"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { LAND_TYPE_LABELS } from "@/app/lib/land";
import { parsedToDraft, type ListingDraft } from "@/app/lib/whatsapp-to-listing";
import type { ParsedListing } from "@/app/lib/agent-types";

const inp = "w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-green-600";
const lbl = "mb-1 block text-xs font-medium text-gray-600";

export default function PublishDraft({
  inboxId,
  listing,
  coords,
  onPublished,
}: {
  inboxId: string;
  listing: ParsedListing;
  coords: { latitude: number | null; longitude: number | null };
  onPublished: (url: string) => void;
}) {
  const [d, setD] = useState<ListingDraft>(() => parsedToDraft(listing, coords));
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [doneUrl, setDoneUrl] = useState("");

  const set = <K extends keyof ListingDraft>(k: K, v: ListingDraft[K]) => setD((cur) => ({ ...cur, [k]: v }));

  async function publish() {
    if (!d.title.trim() || !d.district.trim()) { setError("Title and district are required."); return; }
    setPublishing(true);
    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/whatsapp/inbox-to-listing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ inbox_id: inboxId, listing_data: d }),
    });
    setPublishing(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error?.message || "Couldn't publish. Please try again.");
      return;
    }
    const { public_url } = await res.json();
    setDoneUrl(public_url);
    onPublished(public_url);
  }

  if (doneUrl) {
    return (
      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ✓ Published. <a href={doneUrl} target="_blank" rel="noopener" className="font-semibold underline">View the live listing →</a>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Review &amp; publish as a listing</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={lbl}>Title</label>
          <input value={d.title} onChange={(e) => set("title", e.target.value)} className={inp} />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>Description</label>
          <textarea value={d.description} onChange={(e) => set("description", e.target.value)} rows={3} className={inp} />
        </div>
        <div>
          <label className={lbl}>Land type</label>
          <select value={d.land_type} onChange={(e) => set("land_type", e.target.value)} className={inp}>
            {Object.entries(LAND_TYPE_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={lbl}>Price (₹)</label>
            <input type="number" value={d.price ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : null)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Basis</label>
            <select value={d.price_basis} onChange={(e) => set("price_basis", e.target.value)} className={inp}>
              <option value="total">Total</option><option value="per_acre">Per acre</option><option value="per_guntha">Per guntha</option><option value="per_sqft">Per sq ft</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={lbl}>Area</label>
            <input type="number" value={d.area_value ?? ""} onChange={(e) => set("area_value", e.target.value ? Number(e.target.value) : null)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Unit</label>
            <select value={d.area_unit} onChange={(e) => set("area_unit", e.target.value)} className={inp}>
              <option value="acre">Acres</option><option value="guntha">Gunthas</option><option value="hectare">Hectares</option><option value="sqft">Sq ft</option><option value="cent">Cents</option><option value="bigha">Bighas</option>
            </select>
          </div>
        </div>
        <div>
          <label className={lbl}>District</label>
          <input value={d.district} onChange={(e) => set("district", e.target.value)} className={inp} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={lbl}>Taluka</label>
            <input value={d.taluka} onChange={(e) => set("taluka", e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Village</label>
            <input value={d.village} onChange={(e) => set("village", e.target.value)} className={inp} />
          </div>
        </div>
        <div>
          <label className={lbl}>Water source</label>
          <select value={d.water_source} onChange={(e) => set("water_source", e.target.value)} className={inp}>
            <option value="">Select</option><option value="borewell">Borewell</option><option value="canal">Canal</option><option value="river">River</option><option value="rainfed">Rainfed</option><option value="none">None</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Road access</label>
          <select value={d.road_access} onChange={(e) => set("road_access", e.target.value)} className={inp}>
            <option value="">Select</option><option value="highway">Highway</option><option value="paved">Paved</option><option value="dirt">Dirt road</option><option value="none">None</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Survey number</label>
          <input value={d.survey_number} onChange={(e) => set("survey_number", e.target.value)} className={inp} />
        </div>
        <div>
          <label className={lbl}>Survey number visibility</label>
          <select value={d.survey_number_visibility} onChange={(e) => set("survey_number_visibility", e.target.value)} className={inp}>
            <option value="public">Public</option><option value="qualified_buyer_only">Qualified buyer only</option><option value="admin_only">Admin only</option><option value="hidden">Hidden</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end text-sm text-gray-700">
          <input type="checkbox" checked={d.electricity} onChange={(e) => set("electricity", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-green-700" />
          Electricity available
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button onClick={publish} disabled={publishing} className="mt-4 rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
        {publishing ? "Publishing…" : "Publish as live listing"}
      </button>
    </div>
  );
}
