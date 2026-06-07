import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";
import ArticleCard from "@/app/components/legal/ArticleCard";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Land law guides & FAQs | AcreHub Legal",
  description: "Plain-language guides on buying agricultural land in India — NRI rules, RTC/7-12, mutation, encumbrance, conversion, and document checklists.",
  alternates: { canonical: "/legal/articles" },
};

export default async function ArticlesIndex() {
  const { data: articles } = await supabase
    .from("legal_articles")
    .select("slug, title, summary, topic, reading_minutes")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Guides &amp; FAQs</h1>
      <p className="mt-2 max-w-2xl text-gray-600">Clear answers to the questions land buyers ask most.</p>

      {articles && articles.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          Lawyer-reviewed guides are being finalised. Check back soon.
        </div>
      )}
    </main>
  );
}
