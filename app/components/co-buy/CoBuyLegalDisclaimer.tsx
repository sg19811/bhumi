import Link from "next/link";
import { CO_BUY_DISCLAIMERS } from "@/app/lib/co-buy/disclaimers";

// Reusable disclaimer block (used on the hub, opportunity pages, and form).
export default function CoBuyLegalDisclaimer({
  stateSlug,
  stateLabel,
  override,
}: {
  stateSlug?: string | null;
  stateLabel?: string | null;
  override?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 sm:p-6">
      <h2 className="mb-2 text-base font-semibold text-gray-900">Important — please read</h2>
      <ul className="space-y-2">
        <li>{CO_BUY_DISCLAIMERS.expressionOnly}</li>
        <li>{CO_BUY_DISCLAIMERS.complexity}</li>
        <li>{CO_BUY_DISCLAIMERS.noOwnershipUntilRegistration}</li>
        <li>{CO_BUY_DISCLAIMERS.servicesCoordination}</li>
        <li>{CO_BUY_DISCLAIMERS.noUnofficialPayments}</li>
        {override ? <li className="font-medium text-gray-800">{override}</li> : null}
      </ul>
      {stateSlug && (
        <p className="mt-3">
          <Link href={`/legal/state/${stateSlug}`} className="font-medium text-green-800 hover:underline">
            ⚖️ Land-buying rules in {stateLabel ?? "your state"} →
          </Link>
        </p>
      )}
      <p className="mt-3 text-xs text-gray-400">
        Not legal advice. AcrehubIndia is not a law firm. Always consult your own lawyer before paying money or signing documents.
      </p>
    </div>
  );
}
