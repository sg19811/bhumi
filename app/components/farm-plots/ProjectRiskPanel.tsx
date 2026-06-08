import { projectRisk, riskLevelStyle } from "@/app/lib/farm-plots/risk";

// At-a-glance risk verdict for a project. Honest decision aid, not advice.
export default function ProjectRiskPanel({ listing }: { listing: Record<string, unknown> }) {
  const { level, flags } = projectRisk(listing);

  return (
    <section className={`mb-8 rounded-2xl border p-5 shadow-sm sm:p-6 ${riskLevelStyle[level]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Risk read: {level}</h2>
        <span className="text-xs font-medium uppercase tracking-wide opacity-70">Decision aid — not advice</span>
      </div>

      {flags.length > 0 ? (
        <>
          <p className="mt-1 text-sm opacity-90">What to weigh before you commit:</p>
          <ul className="mt-3 space-y-2">
            {flags.map((f) => (
              <li key={f.label} className="text-sm">
                <span className="font-medium">• {f.label}.</span>{" "}
                <span className="opacity-80">{f.note}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-sm opacity-90">
          No major risk flags from the disclosed details. Still verify documents and visit the site before paying.
        </p>
      )}

      <p className="mt-4 text-xs opacity-70">
        Based only on the details disclosed here — it can&apos;t see title defects, disputes, or anything off-record.
        Always do independent due diligence and consult a lawyer.
      </p>
    </section>
  );
}
