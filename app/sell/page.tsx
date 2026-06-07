import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import WantedAreas from "@/app/components/WantedAreas";

export const metadata: Metadata = {
  title: "Sell your agricultural land — free & verified | AcreHub",
  description: "List your farmland, orchard, or farmhouse plot free on AcreHub. Real map boundaries, a trust score, and reach buyers actively looking — no bait-and-switch.",
  alternates: { canonical: "/sell" },
};

const STEPS = [
  { n: "1", title: "List in minutes", body: "Add your land with photos, price, and an exact map pin. It's free." },
  { n: "2", title: "Build trust", body: "Get a Trust Score, and optionally submit documents to earn a Verified badge." },
  { n: "3", title: "Reach real buyers", body: "Appear in map search and matched buyer requirements — and field inquiries directly." },
];

const WHY = [
  { icon: "🗺️", title: "Real boundaries", body: "Buyers see your exact parcel on a satellite map — no vague locations." },
  { icon: "🛡️", title: "Trust, not bait-and-switch", body: "Verification and a transparent Trust Score make serious buyers confident." },
  { icon: "🎯", title: "Matched to demand", body: "We surface your land to buyers whose budget, area, and location already fit." },
  { icon: "₹", title: "Free to list", body: "No listing fee. Add your land and start getting inquiries." },
];

export default function SellPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1">
        <section className="border-b border-gray-200 bg-gradient-to-b from-green-50 to-white">
          <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-6 sm:py-20">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">Sell your land to buyers who are actually looking</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
              List your agricultural land, orchard, or farmhouse plot free — with real map boundaries, a trust score, and matching to genuine buyer demand.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/listing/new" className="rounded-full bg-green-700 px-7 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-green-800">List your land — free</Link>
              <Link href="/explore" className="rounded-full border border-green-700 px-7 py-3 font-semibold text-green-800 transition-colors hover:bg-green-50">See live listings</Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
          <div className="mb-12 empty:hidden"><WantedAreas /></div>

          <section className="mb-14">
            <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">How it works</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-800">{s.n}</div>
                  <h3 className="font-semibold text-gray-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{s.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Why list on AcreHub</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {WHY.map((w) => (
                <div key={w.title} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl text-green-700">{w.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{w.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">{w.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-green-900">Ready to list?</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-green-800">It takes a few minutes and it&apos;s free. Your land goes live once our team reviews it.</p>
            <Link href="/listing/new" className="mt-5 inline-block rounded-full bg-green-700 px-7 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-green-800">List your land</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
