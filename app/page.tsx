import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";

export default async function Home() {
  const { count } = await supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active");
  const { count: buyerCount } = await supabase.from("buyer_interests").select("*", { count: "exact", head: true }).eq("status", "active");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find trusted agricultural land</h1>
        <p className="text-lg text-gray-500 mb-10">
          Verified listings with legal clarity and real boundaries. The land marketplace built for trust.
        </p>

        <Link href="/explore"
          className="inline-flex items-center max-w-xl w-full border-2 border-green-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow mb-6">
          <span className="flex-1 px-4 py-3 text-left text-gray-400">Search by village, taluka, or district...</span>
          <span className="bg-green-700 text-white px-6 py-3">Search</span>
        </Link>

        <div className="flex justify-center gap-4 mb-8">
          <Link href="/listing/new" className="px-6 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 text-sm">
            List your land for free
          </Link>
          <Link href="/buy" className="px-6 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 text-sm">
            Post what you want to buy
          </Link>
        </div>

        {(count || buyerCount) ? (
          <div className="flex justify-center gap-8 mb-16 text-sm text-gray-500">
            {count ? <span className="font-semibold text-green-800">{count}</span> : null}
            {count ? " listings" : null}
            {count && buyerCount ? " · " : null}
            {buyerCount ? <span className="font-semibold text-green-800">{buyerCount}</span> : null}
            {buyerCount ? " buyer requirements" : null}
          </div>
        ) : <div className="mb-16" />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">Verified listings</h3>
            <p className="text-sm text-gray-600">Every listing shows its trust status. Know what has been checked before you call.</p>
          </div>
          <div className="p-6 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">Legal clarity</h3>
            <p className="text-sm text-gray-600">Can you buy farmland in this state? We answer with sources, not guesses.</p>
          </div>
          <div className="p-6 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">Real boundaries</h3>
            <p className="text-sm text-gray-600">See actual land boundaries on satellite maps, not just address pins.</p>
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-gray-400">
        © 2026 Bhūmi · Trusted land marketplace
      </footer>
    </div>
  );
}
