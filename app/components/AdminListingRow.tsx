"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { useConfirm } from "@/app/components/ConfirmModal";

const statusStyle: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  sold: "bg-gray-200 text-gray-700",
  withdrawn: "bg-gray-200 text-gray-700",
};

export default function AdminListingRow({ listing, onStatusChange }: { listing: any; onStatusChange?: (id: string, status: string) => void }) {
  const [verified, setVerified] = useState(listing.is_verified);
  const [status, setStatus] = useState<string>(listing.status ?? "active");
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();

  async function toggleVerify() {
    setBusy(true);
    const { error } = await supabase.from("listings").update({ is_verified: !verified }).eq("id", listing.id);
    if (!error) setVerified(!verified);
    setBusy(false);
  }
  async function approve() {
    setBusy(true);
    const { error } = await supabase.from("listings").update({ status: "active" }).eq("id", listing.id);
    if (!error) { setStatus("active"); onStatusChange?.(listing.id, "active"); }
    setBusy(false);
  }
  async function remove() {
    if (!(await confirm({ title: "Delete listing", message: "Delete this listing permanently? This can't be undone.", confirmLabel: "Delete", tone: "danger" }))) return;
    setBusy(true);
    const { error } = await supabase.from("listings").delete().eq("id", listing.id);
    if (!error) setDeleted(true);
    setBusy(false);
  }

  if (deleted) return null;

  return (
    <div className="flex items-center justify-between gap-2 p-4">
      <div className="min-w-0">
        <Link href={`/listing/${listing.id}`} className="block truncate text-sm font-medium hover:text-green-700">{listing.title}</Link>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
          <span className={`rounded-full px-1.5 py-0.5 font-medium capitalize ${statusStyle[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>
          ₹{Number(listing.price).toLocaleString("en-IN")} · {listing.area_value} {listing.area_unit}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {status !== "active" && (
          <button onClick={approve} disabled={busy} className="rounded-full bg-green-700 px-2 py-1 text-xs font-medium text-white hover:bg-green-800 disabled:opacity-50">
            Approve
          </button>
        )}
        <button onClick={toggleVerify} disabled={busy}
          className={`rounded-full px-2 py-1 text-xs ${verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500 hover:bg-green-50"}`}>
          {verified ? "✓ Verified" : "Mark verified"}
        </button>
        <button onClick={remove} disabled={busy} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
      </div>
    </div>
  );
}
