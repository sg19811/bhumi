import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";
import { stateLabel } from "@/app/lib/legal/options";
import LegalDisclaimer from "@/app/components/legal/LegalDisclaimer";
import type { JurisdictionRule } from "@/app/lib/legal/types";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Compare agricultural land rules by state | AcreHub Legal",
  description: "Side-by-side comparison of who can buy farmland across Indian states — non-farmer, NRI/OCI and company rules, land ceiling, and conversion. Informational, not legal advice.",
  alternates: { canonical: "/legal/compare" },
};

type Tone = "green" | "amber" | "red";
function Cell({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const cls = tone === "green" ? "text-green-800" : tone === "amber" ? "text-amber-800" : "text-red-700";
  return <span className={`font-medium ${cls}`}>{children}</span>;
}

function nonFarmer(req?: string): { tone: Tone; text: string } {
  if (req === "none") return { tone: "green", text: "Open" };
  if (req === "lenient") return { tone: "amber", text: "With conditions" };
  return { tone: "red", text: "Restricted" };
}

export default async function CompareStates() {
  const { data } = await supabase
    .from("legal_state_rules")
    .select("state, state_label, data")
    .eq("published", true)
    .order("state_label");

  const rules = (data ?? []) as Array<Pick<JurisdictionRule, "state" | "state_label" | "data">>;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Legal", item: "https://bhumi.vercel.app/legal" },
      { "@type": "ListItem", position: 2, name: "Compare states", item: "https://bhumi.vercel.app/legal/compare" },
    ],
  };

  const rows: Array<{ label: string; render: (d: JurisdictionRule["data"]) => React.ReactNode }> = [
    {
      label: "Non-farmer resident can buy",
      render: (d) => { const r = nonFarmer(d.farmer_status_requirement); return <Cell tone={r.tone}>{r.text}</Cell>; },
    },
    {
      label: "NRI / OCI can buy agri land",
      render: (d) => d.nri_rules?.can_purchase_agri ? <Cell tone="amber">Conditional</Cell> : <Cell tone="red">Not directly</Cell>,
    },
    {
      label: "Company / LLP can buy agri land",
      render: (d) => d.company_rules?.can_purchase_agri ? <Cell tone="amber">Conditional</Cell> : <Cell tone="red">Restricted</Cell>,
    },
    {
      label: "Land ceiling",
      render: (d) => d.ceiling_limit_acres ? <Cell tone="amber">~{d.ceiling_limit_acres} acres</Cell> : <Cell tone="amber">Applies — verify</Cell>,
    },
    {
      label: "Conversion for non-farm use",
      render: (d) => (d.conversion_required_for?.length ? <Cell tone="amber">Required</Cell> : <Cell tone="green">Not flagged</Cell>),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/legal" className="hover:text-green-800">Legal</Link>
        <span aria-hidden="true" className="text-gray-300">/</span>
        <span className="text-gray-400">Compare states</span>
      </nav>

      <h1 className="text-3xl font-bold sm:text-4xl">Compare land rules by state</h1>
      <p className="mt-2 max-w-2xl text-gray-600">How who-can-buy, NRI, company, ceiling and conversion rules differ across states — at a glance.</p>

      {rules.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          State guides are being finalised. Check back soon.
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-green-50">
                  <th className="sticky left-0 bg-green-50 px-4 py-3 text-left font-semibold text-gray-700">Rule</th>
                  {rules.map((r) => (
                    <th key={r.state} className="px-4 py-3 text-left font-semibold text-gray-700">
                      <Link href={`/legal/state/${r.state}`} className="hover:text-green-800 hover:underline">{r.state_label}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                    <th className="sticky left-0 bg-inherit px-4 py-3 text-left font-medium text-gray-600">{row.label}</th>
                    {rules.map((r) => (
                      <td key={r.state} className="px-4 py-3">{row.render(r.data)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            NRI/OCI buyers can generally inherit (not purchase) agricultural land in all states. &quot;Conditional&quot; and &quot;Restricted&quot; both mean: get a lawyer to confirm your case.
          </p>

          <div className="mt-6"><LegalDisclaimer variant="result" page="compare" /></div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/legal/wizard" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800">Check your eligibility →</Link>
            <Link href="/legal/talk-to-lawyer" className="inline-block rounded-full border border-green-700 px-6 py-2.5 font-medium text-green-800 transition-colors hover:bg-green-50">Talk to a lawyer</Link>
          </div>
        </>
      )}
    </main>
  );
}
