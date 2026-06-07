import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How AcreHub works — buying & selling agricultural land",
  description: "How to find trusted farmland and list your land on AcreHub: search, check the Trust Score, contact sellers, do due diligence, and post for free.",
};

const buyerSteps = [
  { t: "Search & explore", d: "Find land on a map by village, budget, land type, water, or road access." },
  { t: "Check the Trust Score", d: "Every listing shows how complete and verified its details are." },
  { t: "Contact the seller", d: "Share your number and the seller reaches out to you directly." },
  { t: "Do your due diligence", d: "Use the on-listing verify checklist and our state-wise eligibility guide." },
  { t: "Buy with confidence", d: "Close knowing exactly what you've checked — no bait-and-switch." },
];

const sellerSteps = [
  { t: "List for free", d: "No account needed — add your land's details in a few minutes." },
  { t: "Show the land", d: "Upload photos, a short video walk-through, and drop an exact map pin." },
  { t: "Get verified", d: "Our team can verify your listing to raise its Trust Score and stand out." },
  { t: "Receive inquiries", d: "Interested buyers send their phone number straight to you." },
];

function Steps({ steps }: { steps: { t: string; d: string }[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s.t} className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800">
            {i + 1}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">{s.t}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{s.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorks() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">How AcreHub works</h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          A land marketplace built around trust, legal clarity, and real maps — for buyers and sellers alike.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-green-800">For buyers</h2>
            <Steps steps={buyerSteps} />
            <Link href="/explore" className="mt-6 inline-block rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800">
              Explore land
            </Link>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-green-800">For sellers</h2>
            <Steps steps={sellerSteps} />
            <Link href="/listing/new" className="mt-6 inline-block rounded-full border border-green-700 px-5 py-2.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-50">
              List your land for free
            </Link>
          </section>
        </div>

        <div className="mt-10 rounded-2xl bg-green-50 p-6 text-center">
          <h2 className="text-xl font-semibold text-green-800">Not sure you can buy farmland here?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
            Land laws vary by state. Our eligibility guide explains who can buy and what to verify — with sources, not guesses.
          </p>
          <Link href="/eligibility" className="mt-5 inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">
            Read the eligibility guide
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
