import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/app/lib/supabase";
import HeroSection from "@/app/components/legal/HeroSection";
import TrustBadgesRow from "@/app/components/legal/TrustBadgesRow";
import ArticleCard from "@/app/components/legal/ArticleCard";
import ServiceCard from "@/app/components/legal/ServiceCard";
import LawyerCTA from "@/app/components/legal/LawyerCTA";
import LegalTrack from "@/app/components/legal/LegalTrack";
import { STATES } from "@/app/lib/legal/options";
import { getAllPublishedStates } from "@/app/lib/legal/stateRules";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Land Legal Navigator — eligibility, state rules & lawyer guidance | AcreHub",
  description:
    "Check your eligibility, understand state-wise rules, and get lawyer-backed guidance before buying agricultural land in India. Informational only — not legal advice.",
  alternates: { canonical: "/legal" },
};

export default async function LegalHub() {
  const [{ data: articles }, { data: services }, publishedStates] = await Promise.all([
    supabase.from("legal_articles").select("slug, title, summary, topic, reading_minutes").eq("published", true).order("updated_at", { ascending: false }).limit(4),
    supabase.from("legal_services").select("slug, name, description, included_items, turnaround_days_min, turnaround_days_max, starting_price_placeholder").eq("published", true).order("display_order").limit(6),
    getAllPublishedStates(),
  ]);

  const publishedSet = new Set(publishedStates.map((s) => s.state));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "AcreHub Land Legal Navigator",
    description: "Informational guidance and lawyer connections for agricultural land purchase in India.",
    areaServed: "IN",
    url: "https://bhumi.vercel.app/legal",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LegalTrack event="legal_hub_viewed" />
      <HeroSection />

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <div className="mb-8"><TrustBadgesRow /></div>

        <Link href="/legal/nri" className="mb-12 block rounded-2xl border border-green-200 bg-green-50/50 p-4 text-center text-sm transition-colors hover:bg-green-50 sm:p-5">
          <span className="font-semibold text-green-900">Buying from abroad?</span>{" "}
          <span className="text-green-800">See the NRI &amp; OCI guide — what you can buy or inherit under FEMA →</span>
        </Link>

        {/* State grid */}
        <section className="mb-12">
          <div className="mb-1 flex items-end justify-between gap-3">
            <h2 className="text-2xl font-bold">State-wise rules</h2>
            <Link href="/legal/compare" className="shrink-0 text-sm font-medium text-green-800 hover:underline">Compare states →</Link>
          </div>
          <p className="mb-5 text-gray-600">Land law differs by state. Start with yours.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STATES.map((s) => {
              const live = publishedSet.has(s.value);
              return (
                <Link key={s.value} href={`/legal/state/${s.value}`} className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md">
                  <span className="block font-semibold text-gray-900">{s.label}</span>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${live ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                    {live ? "Guide live" : "In review"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Services preview */}
        {services && services.length > 0 && (
          <section className="mb-12">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Legal services</h2>
                <p className="text-gray-600">Fixed-scope help, from document checks to full due diligence.</p>
              </div>
              <Link href="/legal/services" className="shrink-0 text-sm font-medium text-green-800 hover:underline">All services →</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 3).map((s) => <ServiceCard key={s.slug} service={s} />)}
            </div>
          </section>
        )}

        {/* Article previews */}
        <section className="mb-12">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Guides &amp; FAQs</h2>
              <p className="text-gray-600">Plain-language answers to the questions buyers ask most.</p>
            </div>
            <Link href="/legal/articles" className="shrink-0 text-sm font-medium text-green-800 hover:underline">All guides →</Link>
          </div>
          {articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-gray-500">
              Lawyer-reviewed guides are being finalised. Check back soon.
            </div>
          )}
        </section>

        <LawyerCTA context="hub" />
      </div>
    </>
  );
}
