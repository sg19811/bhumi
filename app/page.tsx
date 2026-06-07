import Link from "next/link";
import Header from "@/app/components/Header";
import SearchBar from "@/app/components/SearchBar";
import Logo from "@/app/components/Logo";
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

const trust = [
  {
    title: "Verified listings",
    body: "Every listing shows its trust status. Know what has been checked before you call.",
    icon: (
      <path d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    ),
  },
  {
    title: "Legal clarity",
    body: "Can you buy farmland in this state? We answer with sources, not guesses.",
    icon: (
      <path d="M12 3v3m0 0 7 3-7 3-7-3 7-3ZM5 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4M3 20h18" />
    ),
  },
  {
    title: "Real boundaries",
    body: "See actual land on satellite maps, not just address pins.",
    icon: (
      <path d="M9 20l-5 2V6l5-2m0 16 6-2m-6 2V4m6 14 5 2V6l-5-2m0 16V4m0 0L9 6" />
    ),
  },
];

export default async function Home() {
  const { count } = await supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active");
  const { count: buyerCount } = await supabase.from("buyer_interests").select("*", { count: "exact", head: true }).eq("status", "active");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-green-50 via-green-50/40 to-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-green-900) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <main className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-green-800">
            🌿 The land marketplace built for trust
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Find trusted{" "}
            <span className="text-green-800">agricultural land</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-gray-600">
            Verified listings with legal clarity and real boundaries — so you can buy farmland with confidence.
          </p>

          <div className="mt-8">
            <SearchBar />
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {budgets.map((b) => (
              <Link key={b.href} href={b.href} className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 transition-colors hover:border-green-600 hover:text-green-800">
                {b.label}
              </Link>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap justify-center gap-2">
            {purposes.map((p) => (
              <Link key={p.href} href={p.href} className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 transition-colors hover:border-green-600 hover:text-green-800">
                {p.label}
              </Link>
            ))}
          </div>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/listing/new" className="rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-800">
              List your land for free
            </Link>
            <Link href="/buy" className="rounded-full border border-green-700 px-6 py-3 text-sm font-medium text-green-800 transition-colors hover:bg-green-50">
              Post what you want to buy
            </Link>
          </div>

          {(count || buyerCount) ? (
            <p className="mt-8 text-sm text-gray-500">
              <span className="font-semibold text-green-800">{count ?? 0}</span> listings ·{" "}
              <span className="font-semibold text-green-800">{buyerCount ?? 0}</span> buyer requirements
            </p>
          ) : <div className="mt-8" />}
        </main>
      </section>

      {/* Trust pillars */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {trust.map((t) => (
            <div key={t.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {t.icon}
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-green-800">{t.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo className="text-xl" />
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <Link href="/explore" className="hover:text-green-800">Explore</Link>
            <Link href="/buy" className="hover:text-green-800">Buy land</Link>
            <Link href="/eligibility" className="hover:text-green-800">Eligibility</Link>
            <Link href="/about" className="hover:text-green-800">About</Link>
          </nav>
          <p className="text-xs text-gray-400">© 2026 Bhūmi · Trusted land marketplace</p>
        </div>
      </footer>
    </div>
  );
}
