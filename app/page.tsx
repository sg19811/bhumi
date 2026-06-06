import Link from "next/link";
import Header from "@/app/components/Header";
import SearchBar from "@/app/components/SearchBar";
import { supabase } from "@/app/lib/supabase";

const budgets = [
  { label: "Under ₹25 lakh", href: "/explore?max_price=2500000" },
  { label: "Under ₹50 lakh", href: "/explore?max_price=5000000" },
  { label: "Under ₹1 crore", href: "/explore?max_price=10000000" },
];
const purposes = [
  { label: "Orchards", href: "/explore?land_type=orchard" },
  { label: "Farmhouse land", href: "/explore?land_type=farmhouse_land" },
  { label: "Irrigated farmland", href: "/explore?land_type=irrigated_farmland" },
  { label: "NA-converted", href: "/explore?land_type=na_converted" },
];

export default async function Home() {
  const { count } = await supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active");
  const { count: buyerCount } = await supabase.from("buyer_interests").select("*", { count: "exact", head: true }).eq("status", "active");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find trusted agricultural land</h1>
        <p className="text-lg text-gray-500 mb-8">Verified listings with legal clarity and real boundaries. The land marketplace built for trust.</p>

        <div className="mb-6"><SearchBar /></div>

        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {budgets.map((b) => <Link key={b.href} href={b.href} className="px-4 py-1.5 text-sm border rounded-full hover:border-green-600 hover:text-green-700">{b.label}</Link>)}
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {purposes.map((p) => <Link key={p.href} href={p.href} className="px-4 py-1.5 text-sm border rounded-full hover:border-green-600 hover:text-green-700">{p.label}</Link>)}
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Link href="/listing/new" className="px-6 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 text-sm">List your land for free</Link>
          <Link href="/buy" className="px-6 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 text-sm">Post what you want to buy</Link>
        </div>

        {(count || buyerCount) ? (
          <p className="mb-16 text-sm text-gray-500"><span className="font-semibold text-green-800">{count ?? 0}</span> listings · <span className="font-semibold text-green-800">{buyerCount ?? 0}</span> buyer requirements</p>
        ) : <div className="mb-16" />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-lg bg-green-50"><h3 className="font-semibold text-green-800 mb-2">Verified listings</h3><p className="text-sm text-gray-600">Every listing shows its trust status. Know what has been checked before you call.</p></div>
          <div className="p-6 rounded-lg bg-green-50"><h3 className="font-semibold text-green-800 mb-2">Legal clarity</h3><p className="text-sm text-gray-600">Can you buy farmland in this state? We answer with sources, not guesses.</p></div>
          <div className="p-6 rounded-lg bg-green-50"><h3 className="font-semibold text-green-800 mb-2">Real boundaries</h3><p className="text-sm text-gray-600">See actual land on satellite maps, not just address pins.</p></div>
        </div>
      </main>
      <footer className="border-t px-6 py-4 text-center text-xs text-gray-400">© 2026 Bhūmi · Trusted land marketplace</footer>
    </div>
  );
}