import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import ArticleCard from "@/app/components/legal/ArticleCard";
import { STATES, stateLabel } from "@/app/lib/legal/options";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Land law guides & FAQs | AcreHub Legal",
  description: "Plain-language guides on buying agricultural land in India — NRI rules, RTC/7-12, mutation, encumbrance, conversion, and document checklists.",
  alternates: { canonical: "/legal/articles" },
};

export default async function ArticlesIndex({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const active = state && STATES.some((s) => s.value === state) ? state : null;

  let query = supabase.from("legal_articles").select("slug, title, summary, topic, reading_minutes, state").eq("published", true);
  // A state filter shows that state's guides plus pan-India ones (which apply everywhere).
  if (active) query = query.or(`state.eq.${active},state.is.null`);
  const { data: articles } = await query.order("updated_at", { ascending: false });

  const chip = (href: string, label: string, isActive: boolean) => (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        isActive ? "border-green-600 bg-green-50 font-medium text-green-800" : "border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-800"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Guides &amp; FAQs</h1>
      <p className="mt-2 max-w-2xl text-gray-600">Clear answers to the questions land buyers ask most.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {chip("/legal/articles", "All guides", !active)}
        {STATES.map((s) => chip(`/legal/articles?state=${s.value}`, s.label, active === s.value))}
      </div>

      {articles && articles.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          {active ? `No guides for ${stateLabel(active)} yet.` : "Lawyer-reviewed guides are being finalised. Check back soon."}
        </div>
      )}
    </main>
  );
}
