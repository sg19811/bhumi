import Link from "next/link";

export default function CoBuyHero() {
  return (
    <section className="border-b border-gray-200 bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-6 sm:py-20">
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">👥 Acrehub Buying Circles</span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">Buy large agricultural land together</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          Large parcels are often priced out of reach for a single buyer. A Buying Circle lets serious buyers pool together — with legal review, site visits, and execution support coordinated by AcrehubIndia.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="#opportunities" className="rounded-full bg-green-700 px-7 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-green-800">See open opportunities</Link>
          <Link href="#how" className="rounded-full border border-green-700 px-7 py-3 font-semibold text-green-800 transition-colors hover:bg-green-50">How it works</Link>
        </div>
        <p className="mx-auto mt-5 max-w-xl text-xs text-gray-500">
          Expressing interest is free and creates no obligation. It is not an offer, a securities product, or investment advice.
        </p>
      </div>
    </section>
  );
}
