import Link from "next/link";

// Honest social-proof banner: "N buyers are looking for land in <district>",
// driven by real active buyer_interests rows. Renders nothing below a threshold
// so it never overstates thin demand. Server-safe / presentational.
export default function BuyersLookingBanner({
  count,
  district,
  minToShow = 2,
}: {
  count: number;
  district?: string | null;
  minToShow?: number;
}) {
  if (!district || count < minToShow) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <span className="font-medium text-amber-900">
        🔥 {count} buyer{count === 1 ? "" : "s"} {count === 1 ? "is" : "are"} actively looking for land in <span className="capitalize">{district}</span>
      </span>
      <Link href="/buy" className="shrink-0 font-medium text-amber-800 underline-offset-2 hover:underline">
        Post your requirement →
      </Link>
    </div>
  );
}
