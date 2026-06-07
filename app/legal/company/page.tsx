import Link from "next/link";
import type { Metadata } from "next";
import LeadCaptureForm from "@/app/components/legal/LeadCaptureForm";
import LegalDisclaimer from "@/app/components/legal/LegalDisclaimer";
import LegalTrack from "@/app/components/legal/LegalTrack";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Can a company, LLP or trust buy agricultural land in India? | AcreHub Legal",
  description: "Entity rules for buying farmland in India — company, LLP, trust and developer restrictions, permitted-use routes, conversion, ceiling and FEMA/FDI. Informational, not legal advice.",
  alternates: { canonical: "/legal/company" },
};

const FAQS = [
  {
    q: "Can a company or LLP buy agricultural land in India?",
    a: "Usually not freely. Most states restrict entity purchase of raw agricultural land without specific permission or a recognised route. Permitted use (agro-industrial, solar, warehousing, township) often needs explicit state approval.",
  },
  {
    q: "What is the route in Maharashtra?",
    a: "Maharashtra routes industrial use and integrated townships through Section 63-IA, and other transfers through Section 63 (with Collector permission or a planning-zone exception). Each route is conditional and needs legal review.",
  },
  {
    q: "Do FEMA/FDI rules apply to my entity?",
    a: "If there is any foreign ownership or investment in the entity, FEMA/FDI review is essential before acquiring land — especially agricultural, plantation or farmhouse land.",
  },
  {
    q: "What should an entity check before buying?",
    a: "Permitted use under the objects clause, board/partner resolution, land-ceiling exposure, land-use conversion, planning approvals, special-tenure or assigned-land status, and FEMA/FDI exposure.",
  },
];

export default function CompanyHub() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Legal", item: "https://bhumi.vercel.app/legal" },
      { "@type": "ListItem", position: 2, name: "Companies & entities", item: "https://bhumi.vercel.app/legal/company" },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LegalTrack event="legal_state_page_viewed" props={{ state: "company" }} />

      <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/legal" className="hover:text-green-800">Legal</Link>
        <span aria-hidden="true" className="text-gray-300">/</span>
        <span className="text-gray-400">Companies &amp; entities</span>
      </nav>

      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Can a company, LLP or trust buy agricultural land?</h1>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">Short answer: conditional — get a review first.</p>
        <p className="mt-1 text-sm text-amber-700">
          Most states restrict entity purchase of raw agricultural land without specific permission or a recognised
          use route. Whether you can proceed depends on the state, your intended use, and your entity structure.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-green-800">Possible routes</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-gray-600">
            <li>State permission for a defined purpose (agro-industrial, solar, warehousing)</li>
            <li>Maharashtra Section 63-IA for industrial / integrated township use</li>
            <li>NA-converted land for non-farming projects</li>
            <li>Land already inside a planning / development zone</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-red-700">What to verify</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-gray-600">
            <li>Objects clause & board/partner resolution</li>
            <li>Land-ceiling exposure and permitted use</li>
            <li>Conversion + planning approvals for non-farm use</li>
            <li>FEMA/FDI exposure if any foreign ownership exists</li>
          </ul>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Common questions</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">{f.q}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-sm text-gray-600">
        Rules differ sharply by state.{" "}
        <Link href="/legal/compare" className="font-medium text-green-800 hover:underline">Compare company rules by state →</Link>{" "}
        or read{" "}
        <Link href="/legal/articles/can-a-company-own-agricultural-land-in-india" className="font-medium text-green-800 hover:underline">the full entity guide →</Link>
      </p>

      <div className="mt-6"><LegalDisclaimer variant="result" page="company" /></div>

      <div className="mt-8">
        <LeadCaptureForm
          source="/legal/company"
          defaults={{ buyer_type: "company", related_service_slug: "full-due-diligence", legal_concern: "Corporate / entity land purchase review" }}
          heading="Request a corporate land purchase review"
          subheading="A lawyer confirms eligibility, the permitted-use route, ceiling/conversion exposure, and FEMA — before you sign or pay."
        />
      </div>
    </main>
  );
}
