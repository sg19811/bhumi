import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import CoBuyHero from "@/app/components/co-buy/CoBuyHero";
import CoBuyHowItWorks from "@/app/components/co-buy/CoBuyHowItWorks";
import CoBuyServicesExplainer from "@/app/components/co-buy/CoBuyServicesExplainer";
import CoBuyOpportunityCard from "@/app/components/co-buy/CoBuyOpportunityCard";
import CoBuyFaqAccordion from "@/app/components/co-buy/CoBuyFaqAccordion";
import CoBuyLegalDisclaimer from "@/app/components/co-buy/CoBuyLegalDisclaimer";
import { CO_BUY_FAQS } from "@/app/lib/co-buy/faqs";
import { CO_BUY_PUBLIC_STATUSES } from "@/app/lib/co-buy/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Buy large agricultural land together in India | Acrehub Buying Circles",
  description:
    "Explore joint land purchase opportunities. Acrehub helps serious buyers form buying circles for large agricultural land, with legal review, site visits, and execution support.",
  alternates: { canonical: "/co-buy" },
};

export default async function CoBuyHub() {
  const { data: opps } = await supabase
    .from("co_buy_opportunities")
    .select("slug, title, summary, total_area_value, total_area_unit, total_price, min_contribution, current_interest_count")
    .in("status", CO_BUY_PUBLIC_STATUSES)
    .order("created_at", { ascending: false })
    .limit(6);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CO_BUY_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />
      <main className="flex-1">
        <CoBuyHero />

        <div className="mx-auto max-w-5xl space-y-16 px-5 py-14 sm:px-6 sm:py-20">
          {/* Problem */}
          <section>
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl">Why buy together?</h2>
            <p className="max-w-2xl text-gray-600">
              The best large parcels — 20, 40, 100 acres — are often priced beyond a single buyer, yet sell at a far better
              per-acre rate than small plots. A Buying Circle lets a few serious buyers share one large, well-priced parcel,
              with the legal review and coordination that large land demands.
            </p>
          </section>

          <CoBuyHowItWorks />

          <CoBuyServicesExplainer />

          {/* Featured opportunities */}
          <section id="opportunities" className="scroll-mt-20">
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl">Open opportunities</h2>
            {opps && opps.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {opps.map((o) => <CoBuyOpportunityCard key={o.slug} opp={o} />)}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
                No open opportunities right now. Check back soon, or browse{" "}
                <a href="/explore?co_buy=1" className="font-medium text-green-800 hover:underline">co-buy eligible land</a>.
              </div>
            )}
          </section>

          {/* FAQ */}
          <section>
            <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Questions buyers ask</h2>
            <CoBuyFaqAccordion faqs={CO_BUY_FAQS} />
          </section>

          <CoBuyLegalDisclaimer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
