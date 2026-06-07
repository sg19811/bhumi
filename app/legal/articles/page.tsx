import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import ArticleCard from "@/app/components/legal/ArticleCard";
import { STATES } from "@/app/lib/legal/options";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Land law guides & FAQs | AcreHub Legal",
  description: "Plain-language guides on buying agricultural land in India — NRI rules, RTC/7-12, mutation, encumbrance, conversion, and document checklists.",
  alternates: { canonical: "/legal/articles" },
};

const TOPICS: { value: string; label: string }[] = [
  { value: "eligibility", label: "Who can buy" },
  { value: "nri", label: "NRI / OCI" },
  { value: "company", label: "Companies" },
  { value: "document", label: "Documents" },
  { value: "rtc", label: "Land records" },
  { value: "mutation", label: "Mutation" },
  { value: "conversion", label: "Conversion" },
];

export default async function ArticlesIndex({ searchParams }: { searchParams: Promise<{ state?: string; topic?: string }> }) {
  const { state, topic } = await searchParams;
  const activeState = state && STATES.some((s) => s.value === state) ? state : null;
  const activeTopic = topic && TOPICS.some((t) => t.value === topic) ? topic : null;

  let query = supabase.from("legal_articles").select("slug, title, summary, topic, reading_minutes, state").eq("published", true);
  // A state filter shows that state's guides plus pan-India ones (which apply everywhere).
  if (activeState) query = query.or(`state.eq.${activeState},state.is.null`);
  if (activeTopic) query = query.eq("topic", activeTopic);
  const { data: articles } = await query.order("updated_at", { ascending: false });

  // Preserve the other active filter when building a chip's href.
  const hrefWith = (params: Record<string, string | null>) => {
    const sp = new URLSearchParams();
    const merged = { state: activeState, topic: activeTopic, ...params };
    if (merged.state) sp.set("state", merged.state);
    if (merged.topic) sp.set("topic", merged.topic);
    const qs = sp.toString();
    return qs ? `/legal/articles?${qs}` : "/legal/articles";
  };

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

      <div className="mt-5 space-y-2">
        <div className="flex flex-wrap gap-2">
          {chip(hrefWith({ topic: null }), "All topics", !activeTopic)}
          {TOPICS.map((t) => chip(hrefWith({ topic: t.value }), t.label, activeTopic === t.value))}
        </div>
        <div className="flex flex-wrap gap-2">
          {chip(hrefWith({ state: null }), "All states", !activeState)}
          {STATES.map((s) => chip(hrefWith({ state: s.value }), s.label, activeState === s.value))}
        </div>
      </div>

      {articles && articles.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          No guides match these filters yet.
        </div>
      )}
    </main>
  );
}
