"use client";

import { useState } from "react";
import { track } from "@/app/lib/legal/analytics";

export default function ResultShareButtons({ resultId, headline }: { resultId: string; headline: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/legal/result/${resultId}`
    : `https://acrehubindia.com/legal/result/${resultId}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("legal_result_shared", { result_id: resultId, method: "copy" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`${headline} — my AcreHub eligibility check: ${url}`)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={copy} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
        {copied ? "✓ Link copied" : "Copy link"}
      </button>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("legal_result_shared", { result_id: resultId, method: "whatsapp" })}
        className="rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 transition-colors hover:bg-green-100"
      >
        Share on WhatsApp
      </a>
    </div>
  );
}
