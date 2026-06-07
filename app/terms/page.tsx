import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — AcreHub",
  description: "The terms for using the AcreHub agricultural land marketplace.",
};

export default function Terms() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold">Terms of Use</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">About AcreHub</h2>
            <p>AcreHub is a marketplace that connects people buying and selling agricultural land. We are not a party to any transaction between users and do not act as a broker, agent, or guarantor.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Listings &amp; verification</h2>
            <p>Sellers are responsible for the accuracy of their listings. A &quot;Verified&quot; badge or Trust Score reflects checks we were able to make — it is not a guarantee of title, boundaries, or legality. Always do your own due diligence.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Not legal or financial advice</h2>
            <p>Eligibility guidance, checklists, and other content are general information, not legal, financial, or tax advice. Land law varies by state and changes often — see our <Link href="/legal" className="text-green-700 hover:underline">eligibility guide</Link> and always consult a qualified lawyer before buying.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Acceptable use</h2>
            <p>Don&apos;t post false, misleading, fraudulent, or unlawful listings, or misuse others&apos; contact details. We may remove content or restrict accounts that break these rules.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Liability</h2>
            <p>The service is provided &quot;as is.&quot; To the extent permitted by law, AcreHub is not liable for losses arising from listings, transactions, or reliance on information on the site.</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-gray-900">Contact</h2>
            <p>Questions about these terms? Reach us through the contact details on the site.</p>
          </section>
          <p className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
            This is a plain-language starting point, not legal advice. Have a lawyer review and tailor it before relying on it for a production business.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
