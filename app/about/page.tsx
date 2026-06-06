import Header from "@/app/components/Header";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Why Bhūmi</h1>
        <p className="text-gray-600 mb-8">
          Buying agricultural land in India is hard. Listings are fake, boundaries are unclear,
          and nobody tells you whether you can even legally buy. Bhūmi fixes that — a land marketplace
          built around trust, legal clarity, and real maps.
        </p>

        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold text-green-800 mb-2">How verification works</h2>
            <p className="text-sm text-gray-600">
              Every listing carries a trust status. A <span className="font-medium">Verified</span> badge
              means our team has checked the key details — ownership, area, and location — against documents
              and, where possible, a field visit. Unverified listings are clearly marked so you always know
              what you&apos;re looking at.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold text-green-800 mb-2">Legal clarity first</h2>
            <p className="text-sm text-gray-600">
              We tell you up front whether you can buy a given type of land in a given state — with sources,
              not guesses. See our <Link href="/eligibility" className="text-green-700 hover:underline">eligibility guide</Link>.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold text-green-800 mb-2">Real maps, real boundaries</h2>
            <p className="text-sm text-gray-600">
              Land is about location. Every listing sits on an interactive map, so you can see exactly where
              it is and what surrounds it — not just a vague address.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/explore" className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">Browse listings</Link>
        </div>
      </main>
    </div>
  );
}
