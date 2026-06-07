import {
  computeTrust,
  trustTierBadgeStyle,
  trustTierBarColor,
} from "@/app/lib/trust";

function Shield({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4.5" />
    </svg>
  );
}

/**
 * Trust Score — derived from app/lib/trust.ts. `badge` is the compact pill used
 * on cards; `full` is the explainable breakdown used on the listing detail page.
 * Server-safe (no hooks).
 */
export default function TrustScore({
  listing,
  variant = "badge",
}: {
  listing: Parameters<typeof computeTrust>[0] & Record<string, unknown>;
  variant?: "badge" | "full";
}) {
  const { score, tier, signals } = computeTrust(listing);

  if (variant === "badge") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur ${trustTierBadgeStyle[tier]}`}>
        <Shield className="h-3.5 w-3.5" />
        {tier} · {score}
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5 text-green-700" />
            Trust Score
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">Based on what we can verify for this listing.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-800">
            {score}
            <span className="text-base font-normal text-gray-400">/100</span>
          </div>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${trustTierBadgeStyle[tier]}`}>
            {tier}
          </span>
        </div>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${trustTierBarColor[tier]}`} style={{ width: `${score}%` }} />
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {signals.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            {s.met ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-700" aria-hidden="true">✓</span>
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400" aria-hidden="true">–</span>
            )}
            <span className={s.met ? "text-gray-700" : "text-gray-400"}>{s.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-gray-400">
        A higher score means more of a listing&apos;s details have been provided or verified by our
        team. It is not legal advice — always check documents and consult a lawyer before buying.
      </p>
    </div>
  );
}
