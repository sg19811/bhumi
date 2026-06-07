import type { JurisdictionRule } from "@/app/lib/legal/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-3 text-lg font-semibold text-green-800">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-1.5 text-sm text-gray-600">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

// Renders the curated content from legal_state_rules.data.
export default function StateGuideContent({ rule }: { rule: JurisdictionRule }) {
  const d = rule.data;
  return (
    <div className="space-y-5">
      <Section title="Who can buy agricultural land">
        <List items={d.agri_purchase.conditions} />
        {d.ceiling_limit_acres != null && (
          <p className="mt-3 text-sm text-gray-500">Indicative ceiling limit: ~{d.ceiling_limit_acres} acres (individual). Verify the current figure.</p>
        )}
      </Section>

      <Section title="NRI / OCI rules">
        <p className="mb-2 text-sm">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${d.nri_rules.can_purchase_agri ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>
            {d.nri_rules.can_purchase_agri ? "Conditional" : "Direct purchase not allowed"}
          </span>
        </p>
        <List items={d.nri_rules.restrictions} />
      </Section>

      <Section title="Company / LLP / Trust rules">
        <p className="mb-2 text-sm">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${d.company_rules.can_purchase_agri ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>
            {d.company_rules.can_purchase_agri ? "Conditional" : "Generally not allowed"}
          </span>
        </p>
        <List items={d.company_rules.conditions} />
      </Section>

      {d.farmhouse_rules?.length > 0 && (
        <Section title="Farmhouse rules"><List items={d.farmhouse_rules} /></Section>
      )}

      <Section title="Documents to verify"><List items={d.common_documents} /></Section>

      <Section title="Common risks"><List items={d.common_risks} /></Section>

      {d.references?.length > 0 && (
        <Section title="References">
          <ul className="space-y-1.5 text-sm">
            {d.references.map((r, i) => (
              <li key={i}>
                {r.url
                  ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-green-800 hover:underline">{r.label} ↗</a>
                  : <span className="text-gray-600">{r.label}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
