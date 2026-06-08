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

const TIPS = [
  { title: "Add 3+ clear photos", body: "A wide shot of the land, the approach road, and the water source. Listings with photos get far more inquiries — and a higher Trust Score." },
  { title: "Drop an exact map pin", body: "Pin the real boundary on the satellite map. Buyers trust a precise location far more than a village name." },
  { title: "Price it realistically", body: "Check what similar land nearby is asking with the price-per-unit and appreciation tools before you set a number." },
  { title: "Fill in the details", body: "Water source, road access, electricity, and a clear description all raise your Trust Score and answer buyers' first questions." },
  { title: "Keep documents handy", body: "You don't need them to list, but submitting the RTC/title to earn a Verified badge makes serious buyers act faster." },
];

const FAQS = [
  { q: "Is it really free to list my land?", a: "Yes — listing is completely free, with no commission on a sale. Add your land, get a Trust Score, and start receiving inquiries at no cost." },
  { q: "How long until my listing goes live?", a: "Your listing is reviewed by our team before it appears publicly, usually within a day. This keeps the marketplace free of spam and bait-and-switch listings." },
  { q: "What makes a listing get more inquiries?", a: "Clear photos, an exact map pin, a realistic price, and complete details (water, road, electricity). These also raise your Trust Score, which buyers filter by." },
  { q: "How do I get the Verified badge?", a: "Submit your ownership documents (like the title deed and latest RTC/7-12) from your listing. Our team reviews them, and a verified listing can reach the highest trust tier." },
  { q: "Who sees my contact details?", a: "Interested buyers send an inquiry with their phone number. Your own contact number is shown only if you choose to add it to the listing." },
  { q: "Can I edit my listing or mark it as sold?", a: "Yes. As the owner you can edit any detail, update photos, or mark the land sold or withdrawn at any time from the listing page." },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function SellPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
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

          <section className="mb-14">
            <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">Tips for a listing that sells</h2>
            <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-gray-500">A few minutes of extra detail is the difference between a listing buyers skip and one they call about.</p>
            <div className="space-y-3">
              {TIPS.map((tip, i) => (
                <div key={tip.title} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">{i + 1}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">{tip.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Selling on AcreHub — your questions</h2>
            <div className="space-y-3">
              {FAQS.map((f) => (
                <div key={f.q} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900">{f.q}</h3>
                  <p className="mt-1.5 text-sm text-gray-600">{f.a}</p>
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
