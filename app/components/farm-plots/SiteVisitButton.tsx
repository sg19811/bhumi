"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

// Request a site visit for a project. Inserts into site_visit_requests (public
// insert per RLS). Defensive: if the table doesn't exist yet (migration not run),
// it fails gracefully with a friendly message instead of crashing.
export default function SiteVisitButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const phone = String(f.get("contact_phone") || "").trim();
    if (!phone) { setError("Please add a contact number."); setBusy(false); return; }
    const row = {
      listing_id: listingId,
      name: String(f.get("name") || "").trim() || null,
      contact_phone: phone,
      preferred_date: (f.get("preferred_date") as string) || null,
      notes: String(f.get("notes") || "").trim() || null,
    };
    try {
      const { error: dbError } = await supabase.from("site_visit_requests").insert(row);
      if (dbError) { setError("Couldn't send your request just now. Please try the contact number on the listing."); setBusy(false); return; }
      setDone(true);
    } catch {
      setError("Couldn't send your request just now. Please try the contact number on the listing.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ✓ Request sent. The developer or AcreHub will reach out to arrange your visit.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-green-700 px-5 py-2.5 text-sm font-semibold text-green-800 transition-colors hover:bg-green-50"
      >
        📅 Request a site visit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">Request a site visit</h3>
      <p className="mt-1 text-sm text-gray-500">Share your details and a preferred date — we&apos;ll help arrange it.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="name" placeholder="Your name" className="rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
        <input name="contact_phone" required placeholder="Phone number *" inputMode="tel" className="rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
        <label className="text-sm text-gray-500 sm:col-span-2">
          Preferred date
          <input name="preferred_date" type="date" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
        </label>
        <textarea name="notes" rows={2} placeholder="Anything specific you want to see?" className="rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 sm:col-span-2" />
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={busy} className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
          {busy ? "Sending…" : "Send request"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </form>
  );
}
