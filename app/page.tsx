import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="text-2xl font-bold text-green-800">Bhūmi</span>
        <nav className="flex gap-6 text-sm">
          <Link href="/explore" className="text-gray-600 hover:text-green-700">
            Explore
          </Link>
          <Link href="/listing/new" className="text-gray-600 hover:text-green-700">
            List your land
          </Link>
          <Link href="/buy" className="text-gray-600 hover:text-green-700">
            I want to buy
          </Link>
          <Link href="/eligibility" className="text-gray-600 hover:text-green-700">
            Eligibility
          </Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Find trusted agricultural land
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Verified listings with legal clarity and real boundaries.
          The land marketplace built for trust.
        </p>

        <div className="flex max-w-xl mx-auto mb-6">
          <Link
            href="/explore"
            className="flex-1 flex items-center border-2 border-green-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <span className="flex-1 px-4 py-3 text-left text-gray-400">
              Search by village, taluka, or district...
            </span>
            <span className="bg-green-700 text-white px-6 py-3">Search</span>
          </Link>
        </div>

        <div className="flex justify-center gap-4 mb-20">
          <Link
            href="/listing/new"
            className="px-6 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 text-sm"
          >
            List your land for free
          </Link>
          <Link
            href="/buy"
            className="px-6 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 text-sm"
          >
            Post what you want to buy
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">
              Verified listings
            </h3>
            <p className="text-sm text-gray-600">
              Every listing shows its trust status. Know what has been checked
              before you call.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">
              Legal clarity
            </h3>
            <p className="text-sm text-gray-600">
              Can you buy farmland in this state? We answer with sources, not
              guesses.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">
              Real boundaries
            </h3>
            <p className="text-sm text-gray-600">
              See actual land boundaries on satellite maps, not just address
              pins.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-gray-400">
        © 2026 Bhūmi · Trusted land marketplace
      </footer>
    </div>
  );
}
