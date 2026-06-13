import Link from "next/link";
import type { Metadata } from "next";
import LeadCaptureForm from "@/app/components/legal/LeadCaptureForm";
import LegalDisclaimer from "@/app/components/legal/LegalDisclaimer";
import LegalTrack from "@/app/components/legal/LegalTrack";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Can an NRI or OCI buy agricultural land in India? | AcreHub Legal",
  description: "NRI and OCI rules for buying farmland in India under FEMA — what you cannot buy, what you can, inheritance, and the lawyer-review route. Informational, not legal advice.",
  alternates: { canonical: "/legal/nri" },
};

const FAQS = [
  {
    q: "Can an NRI or OCI buy agricultural land in India?",
    a: "Generally no. Under FEMA and Ministry of External Affairs guidance, NRIs and PIOs do not have general permission to purchase agricultural land, plantation property, or farmhouse property in India. Such acquisitions need specific approval.",
  },
  {
    q: "Can an NRI inherit agricultural land?",
    a: "Yes. An NRI or PIO may inherit agricultural land, plantation, or farmhouse property from a resident. But transfer of such inherited property is restricted — generally only to an Indian citizen permanently residing in India.",
  },
  {
    q: "What property can an NRI buy in India?",
    a: "NRIs and OCIs can generally buy residential and commercial property under the RBI general permission. Non-agricultural (NA-converted) land is treated differently from agricultural land — confirm the classification and route with a lawyer.",
  },
  {
    q: "Can a foreign national (non-Indian origin) buy land in India?",
    a: "Generally no. Foreign nationals of non-Indian origin resident outside India cannot purchase immovable property in India except in limited cases such as inheritance, and may need specific RBI approval.",
  },
];

export default function NriHub() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Legal", item: "https://acrehubindia.com/legal" },
      { "@type": "ListItem", position: 2, name: "NRI & OCI", item: "https://acrehubindia.com/legal/nri" },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LegalTrack event="legal_state_page_viewed" props={{ state: "nri" }} />

      <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/legal" className="hover:text-green-800">Legal</Link>
        <span aria-hidden="true" className="text-gray-300">/</span>
        <span className="text-gray-400">NRI &amp; OCI</span>
      </nav>

      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Can an NRI or OCI buy agricultural land in India?</h1>

      <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-800">Short answer: generally no — for agricultural land.</p>
        <p className="mt-1 text-sm text-red-700">
          Under FEMA / MEA guidance, NRIs and OCIs do not have general permission to purchase agricultural land,
          plantation property, or farmhouse property in India. These cases need specific approval and legal review.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-green-800">What you generally can do</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-gray-600">
            <li>Buy residential or commercial property (RBI general permission)</li>
            <li>Inherit agricultural / plantation / farmhouse property from a resident</li>
            <li>Consider NA-converted land — treated differently from agri land</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-red-700">What needs approval / review</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-gray-600">
            <li>Direct purchase of agricultural land, plantation or farmhouse</li>
            <li>Transfer of inherited agri land (limited to resident Indian citizens)</li>
            <li>Any foreign-national (non-Indian-origin) purchase</li>
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
        State land laws and land-use conversion still apply on top of the central FEMA rules.{" "}
        <Link href="/legal/compare" className="font-medium text-green-800 hover:underline">Compare state rules →</Link>{" "}
        or read{" "}
        <Link href="/legal/articles/can-nris-buy-agricultural-land-in-india" className="font-medium text-green-800 hover:underline">the full NRI guide →</Link>
      </p>

      <div className="mt-6"><LegalDisclaimer variant="result" page="nri" /></div>

      <div className="mt-8">
        <LeadCaptureForm
          source="/legal/nri"
          defaults={{ buyer_type: "nri", related_service_slug: "nri-land-advisory", legal_concern: "NRI / OCI land advisory", reason: "nri_oci" }}
          heading="Talk to an NRI land lawyer"
          subheading="FEMA-compliant guidance on what you can buy or inherit, and the approval route — before you commit."
        />
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Source: Ministry of External Affairs guidance on acquisition and transfer of immovable property in India (FEMA).
      </p>
    </main>
  );
}
