"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function InquiryButton({ listingId }: { listingId: string }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleInquiry() {
    setSending(true);
    await supabase.from("inquiries").insert({
      listing_id: listingId,
      message: "I am interested in this land.",
    });
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full rounded-xl bg-green-100 p-4 text-sm font-medium text-green-800">
        ✓ Your interest has been recorded. The seller will be notified.
      </div>
    );
  }

  return (
    <button
      onClick={handleInquiry}
      disabled={sending}
      className="rounded-full bg-green-700 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50"
    >
      {sending ? "Sending…" : "I'm interested — contact me"}
    </button>
  );
}
