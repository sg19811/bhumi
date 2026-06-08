import Link from "next/link";
import { projectTransparency, transparencySummary, type TransparencyStatus } from "@/app/lib/farm-plots/transparency";

const ICON: Record<TransparencyStatus, string> = { good: "✓", caution: "⚠", missing: "–" };
const ICON_STYLE: Record<TransparencyStatus, string> = {
  good: "bg-green-100 text-green-700",
  caution: "bg-amber-100 text-amber-700",
  missing: "bg-gray-100 text-gray-400",
};

// Honest disclosure readout for a project. Reflects what the developer has shared,
// not legal verification. Self-contained; null-safe against the listing shape.
export default function ProjectTransparency({ listing }: { listing: Record<string, unknown> }) {
  const items = projectTransparency(listing);
  const { disclosed, total } = transparencySummary(items);

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Transparency &amp; disclosure</h2>
        <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-800">
          {disclosed} of {total} disclosed
        </span>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        What the developer has shared so far. This is not legal verification — treat each item as a question to confirm.
      </p>

      <ul className="divide-y divide-gray-100">
        {items.map((it) => (
          <li key={it.label} className="flex items-start gap-3 py-2.5">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ICON_STYLE[it.status]}`}>
              {ICON[it.status]}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800">{it.label}</p>
              <p className="text-sm text-gray-500">{it.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-900">
        Disclosure isn&apos;t proof. Before you pay anything, verify the title, revenue records, conversion order and
        approvals yourself.{" "}
        <Link href="/legal/checklist" className="font-medium underline">Use the document checklist →</Link>
      </div>
    </section>
  );
}
