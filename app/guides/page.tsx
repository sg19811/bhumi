import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { GUIDES } from "@/app/lib/guides";

export const metadata: Metadata = {
  title: "Land buying guides — AcreHub",
  description:
    "Practical, plain-language guides to buying agricultural land and farm plots in India: who can buy, how to verify title and documents, conversion, stamp duty, and common pitfalls.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: GUIDES.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://acrehubindia.com/guides/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6">
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-800">Home</Link>
          <span aria-hidden="true" className="text-gray-300">/</span>
          <span className="text-gray-400">Guides</span>
        </nav>
        <h1 className="text-3xl font-bold sm:text-4xl">Land buying guides</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Plain-language guides to buying agricultural land and farm plots in India — what to check, what to avoid,
          and how the process works. Educational, not legal advice.
        </p>

        <div className="mt-8 space-y-4">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md sm:p-6"
            >
              <h2 className="text-lg font-semibold text-green-900">{g.title}</h2>
              <p className="mt-1.5 text-sm text-gray-600">{g.summary}</p>
              <p className="mt-2 text-xs text-gray-400">{g.readingMinutes} min read</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-semibold text-green-900">Ready to act on what you&apos;ve read?</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/legal/wizard" className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Check who can buy</Link>
            <Link href="/explore" className="rounded-full border border-green-700 px-6 py-2.5 font-medium text-green-800 hover:bg-green-100">Browse land</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
