import Link from "next/link";
import { formatINRShort } from "@/app/lib/format";
import CoBuyBadge from "./CoBuyBadge";
import type { CoBuyOpportunity } from "@/app/lib/co-buy/types";

export default function CoBuyOpportunityCard({ opp }: { opp: Partial<CoBuyOpportunity> & { slug: string; title: string } }) {
  return (
    <Link
      href={`/co-buy/${opp.slug}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
    >
      <CoBuyBadge />
      <h3 className="mt-2 font-semibold leading-snug text-gray-900 group-hover:text-green-800">{opp.title}</h3>
      {opp.summary ? <p className="mt-1 line-clamp-2 text-sm text-gray-500">{opp.summary}</p> : null}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-gray-400">Total parcel</dt>
          <dd className="font-medium text-gray-800">
            {opp.total_area_value ? `${opp.total_area_value} ${opp.total_area_unit ?? ""} · ` : ""}
            {opp.total_price ? formatINRShort(opp.total_price) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400">From</dt>
          <dd className="font-medium text-green-800">{opp.min_contribution ? formatINRShort(opp.min_contribution) : "—"}</dd>
        </div>
      </dl>
      {opp.current_interest_count ? <p className="mt-2 text-xs text-amber-700">🔥 {opp.current_interest_count} buyers interested</p> : null}
    </Link>
  );
}
