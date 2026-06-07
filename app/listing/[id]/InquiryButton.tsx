"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function InquiryButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSending(true);
    setError("");
    const { error: dbError } = await supabase.from("inquiries").insert({
      listing_id: listingId,
      contact_phone: phone.trim(),
      message: message.trim() || "I am interested in this land.",
    });
    setSending(false);
    if (dbError) setError(dbError.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full rounded-xl bg-green-100 p-4 text-sm font-medium text-green-800">
        ✓ Your interest has been sent. The seller will reach you on {phone}.
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-green-700 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-green-800"
      >
        I&apos;m interested — contact me
      </button>

      {open && (
        <form onSubmit={submit} className="absolute bottom-full z-30 mb-2 w-72 space-y-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="px-1 text-xs font-medium uppercase tracking-wide text-gray-400">Leave your details</p>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            required
            inputMode="numeric"
            pattern="[0-9]{10}"
            title="Enter a 10-digit phone number"
            placeholder="Your phone *"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Message (optional)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={sending || !phone.trim()}
            className="w-full rounded-full bg-green-700 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send to seller"}
          </button>
        </form>
      )}
    </div>
  );
}
