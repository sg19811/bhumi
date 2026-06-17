"use client";

import { useState } from "react";
import { LAND_TYPE_LABELS } from "@/app/lib/land";

export default function NotifyMe({ district, landType, prompt }: { district?: string; landType?: string; prompt?: string }) {
  // When the page already knows the context (region / land-type pages), keep the
  // quick contact-only form. On the home page (no context), ask what & where first.
  const askDetails = !district && !landType;

  const [contact, setContact] = useState("");
  const [wantType, setWantType] = useState("");
  const [wantWhere, setWantWhere] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    setBusy(true);
    await fetch("/api/notify-me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        district: askDetails ? wantWhere.trim() : district,
        land_type: askDetails ? wantType : landType,
        contact: contact.trim(),
      }),
    });
    setBusy(false);
    setDone(true);
  }

  if (done) return <p className="mt-2 text-sm font-medium text-green-700">✓ We&apos;ll notify you when matching land is listed.</p>;

  const inputBase = "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-green-600";

  return (
    <div className="mx-auto mt-2 max-w-md">
      {prompt && <p className="mb-2 text-sm text-gray-500">{prompt}</p>}
      <form onSubmit={submit} className="space-y-2">
        {askDetails && (
          <>
            <select
              value={wantType}
              onChange={(e) => setWantType(e.target.value)}
              aria-label="What land are you looking for?"
              className={inputBase}
            >
              <option value="">What land are you looking for?</option>
              {Object.entries(LAND_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input
              value={wantWhere}
              onChange={(e) => setWantWhere(e.target.value)}
              aria-label="Where? (district or area)"
              placeholder="Where? (district or area)"
              className={inputBase}
            />
          </>
        )}
        <div className="flex gap-2">
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            type="email"
            aria-label="Your email"
            placeholder="Your email"
            className="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-green-600"
          />
          <button disabled={busy} className="shrink-0 rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50">
            {busy ? "…" : "Notify me"}
          </button>
        </div>
      </form>
    </div>
  );
}
