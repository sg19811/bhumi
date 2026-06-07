"use client";

import { useState } from "react";

export default function MapActions({ lat, lng }: { lat: number; lng: number }) {
  const [copied, setCopied] = useState(false);
  const coords = `${lat}, ${lng}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(coords);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800"
      >
        🧭 Get directions
      </a>
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800"
      >
        {copied ? "✓ Copied" : "📋 Copy coordinates"}
      </button>
    </div>
  );
}
