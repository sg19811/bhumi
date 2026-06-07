"use client";

import { formatINRShort } from "@/app/lib/format";

// Mobile-only sticky action bar on listing detail — keeps Call / Inquire always
// reachable without scrolling back to the contact box.
export default function StickyContactBar({ phone, price, basis }: { phone?: string | null; price?: number | null; basis?: string | null }) {
  const basisLabel = basis === "per_acre" ? "/acre" : basis === "per_guntha" ? "/guntha" : basis === "per_sqft" ? "/sq ft" : "";

  function toContact(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_-8px_rgba(60,50,25,0.18)] backdrop-blur sm:hidden">
      {price ? (
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-green-800">{formatINRShort(price)}<span className="text-xs font-normal text-gray-500">{basisLabel}</span></p>
        </div>
      ) : <span />}
      <div className="flex shrink-0 items-center gap-2">
        {phone && (
          <a href={`tel:${phone}`} className="rounded-full border border-green-700 px-4 py-2 text-sm font-medium text-green-800">Call</a>
        )}
        <a href="#contact" onClick={toContact} className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white shadow-sm">Inquire</a>
      </div>
    </div>
  );
}
