import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import MarkdownLite from "@/app/components/legal/MarkdownLite";
import { GUIDES, guideBySlug } from "@/app/lib/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return { title: "Guide not found — AcreHub" };
  return {
    title: `${g.title} | AcreHub`,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();

  const related = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 2);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.summary,
    datePublished: g.updated,
    dateModified: g.updated,
    author: { "@type": "Organization", name: "AcreHub" },
    publisher: { "@type": "Organization", name: "AcreHub" },
    mainEntityOfPage: `https://acrehubindia.com/guides/${g.slug}`,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://acrehubindia.com/" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://acrehubindia.com/guides" },
      { "@type": "ListItem", position: 3, name: g.title, item: `https://acrehubindia.com/guides/${g.slug}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 sm:px-6 sm:py-10">
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-800">Home</Link>
          <span aria-hidden="true" className="text-gray-300">/</span>
          <Link href="/guides" className="hover:text-green-800">Guides</Link>
        </nav>

        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{g.title}</h1>
        <p className="mt-2 text-xs text-gray-400">{g.readingMinutes} min read · Educational, not legal advice</p>

        <article className="mt-6">
          <MarkdownLite md={g.body} />
        </article>

        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-semibold text-green-900">Useful next steps</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/legal/wizard" className="font-medium text-green-800 hover:underline">⚖️ Check who can buy →</Link>
            <Link href="/legal/due-diligence" className="font-medium text-green-800 hover:underline">✅ Due-diligence checklist →</Link>
            <Link href="/tools/stamp-duty-calculator" className="font-medium text-green-800 hover:underline">🧾 Estimate stamp duty →</Link>
            <Link href="/explore" className="font-medium text-green-800 hover:underline">🗺️ Browse land →</Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-semibold">More guides</h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/guides/${r.slug}`} className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-green-300 hover:shadow-md">
                  <h3 className="font-semibold text-green-900">{r.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{r.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
