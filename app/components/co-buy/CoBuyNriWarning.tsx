import Link from "next/link";
import { CO_BUY_DISCLAIMERS } from "@/app/lib/co-buy/disclaimers";

export default function CoBuyNriWarning() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">🌍 NRIs, OCIs &amp; foreign nationals</p>
      <p className="mt-1">{CO_BUY_DISCLAIMERS.nriWarning}</p>
      <p className="mt-2">
        <Link href="/legal/nri" className="font-medium text-amber-800 underline underline-offset-2">Read the NRI land-buying guide →</Link>
      </p>
    </div>
  );
}
