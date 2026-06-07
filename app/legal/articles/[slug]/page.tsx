import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";
import MarkdownLite from "@/app/components/legal/MarkdownLite";
import ArticleCard from "@/app/components/legal/ArticleCard";
import LawyerCTA from "@/app/components/legal/LawyerCTA";
import LegalDisclaimer from "@/app/components/legal/LegalDisclaimer";
import LegalTrack from "@/app/components/legal/LegalTrack";
import { stateLabel } from "@/app/lib/legal/options";

export const revalidate = 600;

export async function generateStaticParams() {
  const { data } = await supabase.from("legal_articles").select("slug").eq("published", true);
  return (data ?? []).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: a } = await supabase.from("legal_articles").select("title, summary, seo_title, seo_description").eq("slug", slug).eq("published", true).maybeSingle();
  if (!a) return { title: "Guide not found | AcreHub Legal" };
  return {
    title: a.seo_title || `${a.title} | AcreHub Legal`,
    description: a.seo_description || a.summary || undefined,
    alternates: { canonical: `/legal/articles/${slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: a } = await supabase
    .from("legal_articles")
    .select("slug, title, summary, body_md, state, topic, reading_minutes, reviewed_by, reviewed_at, schema_data")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!a) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Guide not found</h1>
        <p className="mt-2 text-gray-500">This guide may be unpublished or moved.</p>
        <Link href="/legal/articles" className="mt-6 inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">All guides</Link>
      </main>
    );
  }

  // Related guides on the same topic, for internal linking.
  const { data: related } = await supabase
    .from("legal_articles")
    .select("slug, title, summary, topic, reading_minutes")
    .eq("published", true)
    .eq("topic", a.topic)
    .neq("slug", a.slug)
    .limit(3);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Legal", item: "https://bhumi.vercel.app/legal" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://bhumi.vercel.app/legal/articles" },
      { "@type": "ListItem", position: 3, name: a.title, item: `https://bhumi.vercel.app/legal/articles/${slug}` },
    ],
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    ...(a.summary ? { description: a.summary } : {}),
    author: { "@type": "Organization", name: "AcreHub" },
    publisher: { "@type": "Organization", name: "AcreHub" },
  };

  // Question-style titles become an FAQPage for richer search results.
  const faqLd = a.title.trim().endsWith("?")
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: a.title,
            acceptedAnswer: {
              "@type": "Answer",
              text: a.summary || a.body_md.replace(/[#*_>-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 320),
            },
          },
        ],
      }
    : null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      {a.schema_data && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(a.schema_data) }} />}
      <LegalTrack event="legal_article_viewed" props={{ slug: a.slug, state: a.state, topic: a.topic, reading_minutes: a.reading_minutes }} />

      <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/legal" className="hover:text-green-800">Legal</Link>
        <span aria-hidden="true" className="text-gray-300">/</span>
        <Link href="/legal/articles" className="hover:text-green-800">Guides</Link>
      </nav>

      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{a.title}</h1>
      <p className="mt-2 text-xs text-gray-400">
        {a.reading_minutes ?? 5} min read
        {a.state ? ` · ${stateLabel(a.state)}` : ""}
        {a.reviewed_by && a.reviewed_by !== "PENDING_LAWYER_REVIEW" ? ` · Reviewed by ${a.reviewed_by}` : ""}
      </p>

      <div className="my-6"><LegalDisclaimer variant="result" page={`article-${slug}`} /></div>

      <article className="mt-2">
        <MarkdownLite md={a.body_md} />
      </article>

      {a.state && (
        <p className="mt-6 text-sm">
          <Link href={`/legal/state/${a.state}`} className="font-medium text-green-800 hover:underline">📖 Read the full {stateLabel(a.state)} land guide →</Link>
        </p>
      )}

      <div className="mt-10">
        <LawyerCTA context="article" state={a.state ?? undefined} />
      </div>

      {related && related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Related guides</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ArticleCard key={r.slug} article={r} />)}
          </div>
        </section>
      )}
    </main>
  );
}
