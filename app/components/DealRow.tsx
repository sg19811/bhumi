"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

export default function DealRow({
  listing,
  agentId,
  deal,
  onSaved,
}: {
  listing: any;
  agentId: string;
  deal?: { sale_price: number | null; commission_amount: number | null };
  onSaved: (listingId: string, d: { sale_price: number | null; commission_amount: number | null }) => void;
}) {
  const [sale, setSale] = useState<string>(deal?.sale_price != null ? String(deal.sale_price) : "");
  const [comm, setComm] = useState<string>(deal?.commission_amount != null ? String(deal.commission_amount) : "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    const sale_price = sale === "" ? null : Number(sale);
    const commission_amount = comm === "" ? null : Number(comm);
    const { error } = await supabase.from("deals").upsert(
      { listing_id: listing.id, agent_user_id: agentId, sale_price, commission_amount, updated_at: new Date().toISOString() },
      { onConflict: "listing_id" }
    );
    setBusy(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      onSaved(listing.id, { sale_price, commission_amount });
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Link href={`/listing/${listing.id}`} className="text-sm font-medium hover:text-green-700">{listing.title}</Link>
        <p className="text-xs text-gray-500">Asking ₹{Number(listing.price).toLocaleString("en-IN")}</p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-gray-500">
          Sale price (₹)
          <input type="number" min="0" value={sale} onChange={(e) => setSale(e.target.value)} className="mt-0.5 block w-32 rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-600" />
        </label>
        <label className="text-xs text-gray-500">
          Commission (₹)
          <input type="number" min="0" value={comm} onChange={(e) => setComm(e.target.value)} className="mt-0.5 block w-32 rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-600" />
        </label>
        <button onClick={save} disabled={busy} className="rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50">
          {saved ? "✓ Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
