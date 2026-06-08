"use client";

// Small client button for printable report pages — triggers the browser's
// print dialog ("Save as PDF"). Hidden when printing.
export default function PrintButton({ label = "🖨 Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800"
    >
      {label}
    </button>
  );
}
