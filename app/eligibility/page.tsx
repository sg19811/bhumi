import Link from "next/link";
import Logo from "@/app/components/Logo";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Can you buy agricultural land? — Bhūmi eligibility guide",
  description: "A simplified, state-wise guide (Karnataka & Maharashtra) to who can buy farmland in India and what documents to verify. Not legal advice.",
};

export default function Eligibility() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 px-5 py-3.5 sm:px-6">
        <Logo />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">
          Can you buy agricultural land?
        </h1>
        <p className="text-gray-500 mb-8">
          Land purchase eligibility varies by state. Here&apos;s a simplified
          guide for our launch regions.
        </p>

        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Karnataka
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  What this means
                </h3>
                <p className="text-sm text-gray-600">
                  Karnataka has relaxed agricultural land purchase rules in
                  recent years. Most buyers, including non-agriculturists, can
                  now purchase agricultural land, subject to certain conditions
                  and ceiling limits.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  Why it matters
                </h3>
                <p className="text-sm text-gray-600">
                  If you&apos;re buying farmhouse land or agricultural land for
                  personal use near Bengaluru or Mysuru, you likely qualify — but
                  you need to verify ceiling limits and ensure the land is not
                  granted or tribal-restricted.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  What to verify
                </h3>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Check if the land falls under ceiling limits</li>
                  <li>Verify it is not granted land (saguvali chit)</li>
                  <li>Confirm no tribal/scheduled area restrictions</li>
                  <li>Get the latest RTC (Record of Rights) and mutation extract</li>
                  <li>Obtain an encumbrance certificate</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  Documents typically needed
                </h3>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>RTC (pahani) — latest extract</li>
                  <li>Mutation register extract</li>
                  <li>Encumbrance certificate (last 30 years)</li>
                  <li>Sale deed of previous transactions</li>
                  <li>Tax paid receipts</li>
                  <li>Identity and address proof of buyer and seller</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Maharashtra
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  What this means
                </h3>
                <p className="text-sm text-gray-600">
                  Maharashtra historically restricts agricultural land purchase
                  to agriculturists. Non-agriculturists may need special
                  permission or can purchase NA-converted land without
                  restrictions.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  Why it matters
                </h3>
                <p className="text-sm text-gray-600">
                  If you&apos;re a non-agriculturist looking at farmland near
                  Nashik or Pune, check whether the land is already NA-converted
                  or explore the permission route through the relevant revenue
                  authority.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  What to verify
                </h3>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Your agriculturist status or permission pathway</li>
                  <li>Whether the land is NA-converted</li>
                  <li>Check the 7/12 extract and mutation entry</li>
                  <li>Verify no tenancy rights exist</li>
                  <li>Confirm ceiling compliance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  Documents typically needed
                </h3>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>7/12 extract (satbara utara)</li>
                  <li>8A extract (khata)</li>
                  <li>Mutation entries</li>
                  <li>NA order (if converted)</li>
                  <li>Encumbrance certificate</li>
                  <li>Tax receipts and title search report</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="mb-1 font-semibold">Important disclaimer</p>
            <p>
              This is simplified guidance, not legal advice. Land law is
              state-specific and changes frequently. Always confirm critical
              points with a local lawyer or the revenue office before making a
              purchase decision.
            </p>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/explore"
              className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800"
            >
              Browse verified listings
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
