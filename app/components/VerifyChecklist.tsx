import Link from "next/link";

const items = [
  "Match the title deed and latest RTC / 7‑12 extract to the seller's name",
  "Get an encumbrance certificate (last 30 years) — check for loans or liens",
  "Review mutation records and confirm there are no pending disputes",
  "Confirm the land isn't granted, tribal, or ceiling-restricted",
  "Walk the boundaries and match the survey number against the map",
  "Check road access and legal approach/right-of-way",
  "Consult a local lawyer before paying any advance or token amount",
];

/** Static buyer due-diligence checklist. Not legal advice; links to eligibility guide. */
export default function VerifyChecklist() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <h2 className="mb-1 text-lg font-semibold text-amber-900">Before you buy — what to verify</h2>
      <p className="mb-4 text-sm text-amber-800">
        A quick due-diligence checklist for agricultural land. Use it as a starting point, not legal advice.
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-amber-900">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs text-amber-800" aria-hidden="true">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-amber-800">
        Rules vary by state — see the{" "}
        <Link href="/legal" className="font-medium underline">eligibility guide</Link>, and always confirm with a lawyer or the local revenue office.
      </p>
    </div>
  );
}
