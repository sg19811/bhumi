"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { normalizePhone, isValidPhone } from "@/app/lib/phone-utils";

const inp = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

export default function NewInboxMessagePage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);

    const senderPhone = normalizePhone(f.get("sender_phone"));
    const rawMessage = String(f.get("raw_message") ?? "").trim();
    if (!isValidPhone(senderPhone)) { setError("Enter a valid sender phone number."); return; }
    if (rawMessage.length < 5) { setError("Message text must be at least 5 characters."); return; }

    setSubmitting(true);
    setError("");

    // Look up the agent by their (normalized) phone, so the message is linked.
    const { data: agent } = await supabase
      .from("agent_profiles")
      .select("id")
      .eq("phone", senderPhone)
      .maybeSingle();

    const mediaUrls = String(f.get("media_urls") ?? "")
      .split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    const lat = f.get("location_lat") ? Number(f.get("location_lat")) : null;
    const lng = f.get("location_lng") ? Number(f.get("location_lng")) : null;
    const transcript = String(f.get("voice_transcript") ?? "").trim() || null;

    const { data: inserted, error: dbError } = await supabase
      .from("whatsapp_inbox")
      .insert({
        sender_phone: senderPhone,
        agent_id: agent?.id ?? null,
        raw_message: rawMessage,
        voice_transcript: transcript,
        media_urls: mediaUrls,
        location_lat: Number.isFinite(lat) ? lat : null,
        location_lng: Number.isFinite(lng) ? lng : null,
        parsing_status: "pending",
        processed_status: "inbox",
      })
      .select("id")
      .maybeSingle();

    setSubmitting(false);
    if (dbError) { setError(dbError.message); return; }
    router.push(`/admin/whatsapp/inbox/${inserted?.id}`);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Admins only</h1>
          <Link href={user ? "/" : "/auth/signin"} className="text-green-700 hover:underline">{user ? "Go home" : "Sign in"}</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link href="/admin/whatsapp/inbox" className="text-sm text-green-700 hover:underline">← Inbox</Link>
        <h1 className="mt-2 text-xl font-bold">Add a WhatsApp message</h1>
        <p className="mt-1 text-sm text-gray-500">Paste a property message an agent sent you on WhatsApp. We&apos;ll link it to the agent (if their number is registered) and queue it for processing.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sender phone *</label>
            <input name="sender_phone" required inputMode="tel" placeholder="e.g. 9876543210" className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message text *</label>
            <textarea name="raw_message" required minLength={5} rows={6} placeholder="Paste the agent's full WhatsApp message here…" className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Voice note transcript (optional)</label>
            <textarea name="voice_transcript" rows={3} placeholder="If the agent sent a voice note, type/paste what they said. (Automatic transcription comes later.)" className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Photo URLs (optional)</label>
            <textarea name="media_urls" rows={2} placeholder="One per line, or comma-separated. (Direct file upload comes later.)" className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Location lat (optional)</label>
              <input name="location_lat" type="number" step="any" placeholder="12.9716" className={inp} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Location lng (optional)</label>
              <input name="location_lng" type="number" step="any" placeholder="77.5946" className={inp} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
            {submitting ? "Saving…" : "Add to inbox"}
          </button>
        </form>
      </main>
    </div>
  );
}
