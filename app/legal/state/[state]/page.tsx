import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedStateRule } from "@/app/lib/legal/stateRules";
import { STATES, stateLabel } from "@/app/lib/legal/options";
import StateGuideContent from "@/app/components/legal/StateGuideContent";
import LawyerCTA from "@/app/components/legal/LawyerCTA";
import LegalDisclaimer from "@/app/components/legal/LegalDisclaimer";
import LegalTrack from "@/app/components/legal/LegalTrack";
import { PENDING_REVIEW_NOTE } from "@/app/lib/legal/copy";

export const revalidate = 600;

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.value }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const label = stateLabel(state);
  return {
    title: `Buying agricultural land in ${label} — rules & documents | AcreHub`,
    description: `Who can buy farmland in ${label}, NRI and company rules, documents to verify, and common risks. Informational guidance — not legal advice.`,
    alternates: { canonical: `/legal/state/${state}` },
  };
}

export default async function StateGuide({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const label = stateLabel(state);
  const rule = await getPublishedStateRule(state);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Legal", item: "https://bhumi.vercel.app/legal" },
      { "@type": "ListItem", position: 2, name: label, item: `https://bhumi.vercel.app/legal/state/${state}` },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LegalTrack event="legal_state_page_viewed" props={{ state }} />

      <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/legal" className="hover:text-green-800">Legal</Link>
        <span aria-hidden="true" className="text-gray-300">/</span>
        <span className="text-gray-400">{label}</span>
      </nav>

      <h1 className="text-3xl font-bold sm:text-4xl">Buying agricultural land in {label}</h1>

      {rule ? (
        <>
          <p className="mt-2 text-gray-600">Who can buy, NRI &amp; company rules, documents to verify, and common risks.</p>
          {rule.reviewed_by && rule.reviewed_by !== "PENDING_LAWYER_REVIEW" && (
            <p className="mt-1 text-xs text-gray-400">Reviewed by {rule.reviewed_by}{rule.reviewed_at ? ` · ${new Date(rule.reviewed_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}</p>
          )}
          <div className="mt-6">
            <StateGuideContent rule={rule} />
          </div>
          <div className="mt-6"><LegalDisclaimer variant="result" page={`state-${state}`} /></div>
          <div className="mt-6">
            <Link href={`/legal/wizard`} className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800">Check your eligibility for {label} →</Link>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">Guidance in review</h2>
          <p className="mt-2 text-sm text-amber-800">{PENDING_REVIEW_NOTE}</p>
          <p className="mt-4 text-sm text-amber-800">In the meantime, a verified lawyer can answer your {label} questions directly.</p>
        </div>
      )}

      <div className="mt-8">
        <LawyerCTA context="state_guide" state={state} />
      </div>
    </main>
  );
}
