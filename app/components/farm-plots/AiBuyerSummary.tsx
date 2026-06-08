"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

// AI-generated buyer summary for a project. Calls the server route (which holds
// the API key and validates the user's session). Signed-in users only, to control
// spend. Degrades gracefully when AI isn't configured or the user isn't signed in.
export default function AiBuyerSummary({ listingId }: { listingId: string }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  async function generate() {
    setBusy(true); setError(null); setNeedsAuth(false);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setNeedsAuth(true); setBusy(false); return; }
    try {
      const res = await fetch("/api/farm-plots/ai-report", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json?.error || "Couldn't generate the summary."); setBusy(false); return; }
      setText(json.report || "");
    } catch {
      setError("Couldn't generate the summary. Please try again.");
    }
    setBusy(false);
  }

  return (
    <section className="mb-8 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm sm:p-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">✨ AI buyer summary</h2>
        {!text && (
          <button onClick={generate} disabled={busy} className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? "Generating…" : "Generate"}
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">An AI-written, balanced overview built only from this project&apos;s disclosed details. Not advice — verify everything.</p>

      {needsAuth && (
        <p className="mt-3 text-sm text-gray-700">
          <Link href="/auth/signin" className="font-medium text-indigo-700 underline">Sign in</Link> to generate an AI summary.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {text && <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-800">{text}</div>}
    </section>
  );
}
