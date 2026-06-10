import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { formatINRShort } from "@/app/lib/format";
import CoBuyBadge from "./CoBuyBadge";
import { CO_BUY_PUBLIC_STATUSES } from "@/app/lib/co-buy/types";

// Conditional block on /listing/[id]. Renders only when the listing is flagged
// co-buy eligible AND a public opportunity exists for it. Async server component.
export default async function CoBuyListingCTA({ listingId, isEligible }: { listingId: string; isEligible?: boolean | null }) {
  if (!isEligible) return null;
  const { data: opp } = await supabase
    .from("co_buy_opportunities")
    .select("slug, title, min_contribution, current_interest_count, status")
    .eq("listing_id", listingId)
    .in("status", CO_BUY_PUBLIC_STATUSES)
    .maybeSingle();
  if (!opp) return null;

  return (
    <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
      <CoBuyBadge />
      <h2 className="mt-2 text-lg font-semibold text-green-900">Interested in this parcel but can&apos;t buy it alone?</h2>
      <p className="mt-1 text-sm text-green-800">
        Join a Buying Circle — serious buyers pool together to acquire large land, with legal review and execution support coordinated by AcrehubIndia.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        {opp.min_contribution ? <span className="text-green-900">From <strong>{formatINRShort(opp.min_contribution)}</strong></span> : null}
        {opp.current_interest_count ? <span className="text-amber-700">🔥 {opp.current_interest_count} interested</span> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/co-buy/${opp.slug}`} className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800">Explore Buying Circle</Link>
        <Link href={`/co-buy/${opp.slug}/express-interest`} className="rounded-full border border-green-700 px-5 py-2.5 text-sm font-medium text-green-800 hover:bg-green-100">Ask AcrehubIndia to coordinate</Link>
      </div>
    </div>
  );
}
