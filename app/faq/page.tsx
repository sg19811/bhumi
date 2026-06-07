import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently asked questions — AcreHub",
  description: "Common questions about buying and selling agricultural land on AcreHub: trust scores, verification, fees, eligibility, and accounts.",
};

const faqs = [
  {
    q: "Is it free to list my land?",
    a: "Yes. Listing your land on AcreHub is completely free, and you don't even need an account — just add your details and contact information.",
  },
  {
    q: "Do I need an account to use AcreHub?",
    a: "No. You can browse, search, contact sellers, and post a listing without an account. Signing in lets you save listings, build collections, sync saved searches across devices, and manage your own listings.",
  },
  {
    q: "What is the Trust Score?",
    a: "The Trust Score (0–100) reflects how complete and corroborated a listing is — team verification, photos, a pinned GPS location, contact details, a description, and whether it was posted by a registered account. It is a transparency signal, not legal advice.",
  },
  {
    q: "What does a 'Verified' listing mean?",
    a: "A verified listing has been checked by our team against the key details. Unverified listings are clearly marked, and the Trust Score always shows you how much has been confirmed before you call.",
  },
  {
    q: "Can I legally buy agricultural land?",
    a: "It depends on the state and your situation. See our eligibility guide for a simplified, state-wise overview — and always confirm with a local lawyer or the revenue office before buying.",
  },
  {
    q: "How do I verify a listing before buying?",
    a: "Every listing includes a due-diligence checklist: match the title deed and RTC/7-12 extract, get an encumbrance certificate, review mutation records, check for ceiling/tribal/granted restrictions, walk the boundaries against the survey number, and consult a lawyer.",
  },
  {
    q: "How do buyers contact me about my listing?",
    a: "Interested buyers submit their phone number through the listing, and they can also reach you directly via the phone, WhatsApp, or email you provide.",
  },
];

export default function FAQ() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Frequently asked questions</h1>
        <p className="mt-3 text-gray-600">Everything you need to know about buying and selling land on AcreHub.</p>

        <dl className="mt-8 space-y-6">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <dt className="font-semibold text-gray-900">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 rounded-2xl bg-green-50 p-6 text-center">
          <p className="text-gray-700">Still have a question?</p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/how-it-works" className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">How it works</Link>
            <Link href="/legal" className="rounded-full border border-green-700 px-6 py-2.5 font-medium text-green-800 transition-colors hover:bg-green-50">Eligibility guide</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
