"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function NotifyMe({ district, landType, prompt }: { district?: string; landType?: string; prompt?: string }) {
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    setBusy(true);
    await supabase.from("demand_signals").insert({ district: district ?? null, land_type: landType ?? null, contact: contact.trim() });
    setBusy(false);
    setDone(true);
  }

  if (done) return <p className="mt-2 text-sm font-medium text-green-700">✓ We&apos;ll notify you when matching land is listed.</p>;

  return (
    <div className="mx-auto mt-2 max-w-md">
      {prompt && <p className="mb-2 text-sm text-gray-500">{prompt}</p>}
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          aria-label="Your phone or email"
          placeholder="Phone or email"
          className="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-green-600"
        />
        <button disabled={busy} className="shrink-0 rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50">
          {busy ? "…" : "Notify me"}
        </button>
      </form>
    </div>
  );
}
