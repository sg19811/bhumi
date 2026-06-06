"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

export default function AdminListingRow({ listing }: { listing: any }) {
  const [verified, setVerified] = useState(listing.is_verified);
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleVerify() {
    setBusy(true);
    const { error } = await supabase.from("listings").update({ is_verified: !verified }).eq("id", listing.id);
    if (!error) setVerified(!verified);
    setBusy(false);
  }
  async function remove() {
    if (!confirm("Delete this listing permanently?")) return;
    setBusy(true);
    const { error } = await supabase.from("listings").delete().eq("id", listing.id);
    if (!error) setDeleted(true);
    setBusy(false);
  }

  if (deleted) return null;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="min-w-0">
        <Link href={`/listing/${listing.id}`} className="font-medium text-sm hover:text-green-700 block truncate">{listing.title}</Link>
        <p className="text-xs text-gray-500">₹{Number(listing.price).toLocaleString("en-IN")} · {listing.area_value} {listing.area_unit}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={toggleVerify} disabled={busy}
          className={`px-2 py-1 text-xs rounded-full ${verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500 hover:bg-green-50"}`}>
          {verified ? "✓ Verified" : "Mark verified"}
        </button>
        <button onClick={remove} disabled={busy} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">Delete</button>
      </div>
    </div>
  );
}
