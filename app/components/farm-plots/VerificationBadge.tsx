import { getTier } from "@/app/lib/farm-plots/verification";

// Tiered verification badge. Hidden for unverified (the general Trust Score already
// covers completeness); only shows once the team has actually verified something.
export default function VerificationBadge({ tier, withDescription = false }: { tier?: string | null; withDescription?: boolean }) {
  const t = getTier(tier);
  if (t.value === "unverified") return null;
  return (
    <span className="inline-flex flex-col">
      <span className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${t.style}`}>
        🛡️ {t.label}
      </span>
      {withDescription && <span className="mt-1 text-xs text-gray-500">{t.description}</span>}
    </span>
  );
}
