import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import { supabase } from "@/app/lib/supabase";
import { formatINR, formatINRShort } from "@/app/lib/format";
import { districtToState } from "@/app/lib/legal/districts";
import { stateLabel } from "@/app/lib/legal/options";
import CoBuyBadge from "@/app/components/co-buy/CoBuyBadge";
import CoBuyProgressBar from "@/app/components/co-buy/CoBuyProgressBar";
import CoBuyContributionCalculator from "@/app/components/co-buy/CoBuyContributionCalculator";
import CoBuyServicesExplainer from "@/app/components/co-buy/CoBuyServicesExplainer";
import CoBuyLegalDisclaimer from "@/app/components/co-buy/CoBuyLegalDisclaimer";
import CoBuyNriWarning from "@/app/components/co-buy/CoBuyNriWarning";
import CoBuyRiskNotice from "@/app/components/co-buy/CoBuyRiskNotice";
import CoBuyFaqAccordion from "@/app/components/co-buy/CoBuyFaqAccordion";
import { CO_BUY_FAQS } from "@/app/lib/co-buy/faqs";
import { CO_BUY_PUBLIC_STATUSES } from "@/app/lib/co-buy/types";

export const revalidate = 600;

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-green-50 p-4 text-center">
      <p className="text-lg font-bold text-green-800 sm:text-xl">{v}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">{k}</p>
    </div>
  );
}

async function getOpp(slug: string) {
  const { data } = await supabase.from("co_buy_opportunities").select("*").eq("slug", slug).in("status", CO_BUY_PUBLIC_STATUSES).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOpp(slug);
  if (!opp) return { title: "Opportunity not found | Acrehub Buying Circles", robots: { index: false } };
  const loc = [opp.total_area_value ? `${opp.total_area_value} ${opp.total_area_unit ?? ""}` : null, opp.total_price ? formatINR(opp.total_price) : null].filter(Boolean).join(", ");
  return {
    title: `${opp.title} | Buying Circle | Acrehub`,
    description: opp.summary || `${loc}. Join interested buyers in exploring this large agricultural land parcel. Legal review required.`,
    alternates: { canonical: `/co-buy/${slug}` },
  };
}

export default async function CoBuyOpportunity({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opp = await getOpp(slug);
  if (!opp) notFound();

  const { data: listing } = await supabase.from("listings").select("*").eq("id", opp.listing_id).maybeSingle();
  const stateSlug = listing?.district ? districtToState(listing.district) : null;
  const visitDates: string[] = Array.isArray(opp.site_visit_dates) ? opp.site_visit_dates : [];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Buying Circles", item: "https://acrehubindia.com/co-buy" },
      { "@type": "ListItem", position: 2, name: opp.title, item: `https://acrehubindia.com/co-buy/${slug}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:px-6 sm:py-10">
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/co-buy" className="hover:text-green-800">Buying Circles</Link>
          <span aria-hidden="true" className="text-gray-300">/</span>
          <span className="truncate text-gray-400">{opp.title}</span>
        </nav>

        <CoBuyBadge />
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{opp.title}</h1>
        {opp.summary && <p className="mt-2 text-gray-600">{opp.summary}</p>}

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat k="total parcel" v={opp.total_area_value ? `${opp.total_area_value} ${opp.total_area_unit ?? ""}` : "—"} />
          <Stat k="total price" v={opp.total_price ? formatINRShort(opp.total_price) : "—"} />
          <Stat k="from / buyer" v={opp.min_contribution ? formatINRShort(opp.min_contribution) : "—"} />
          <Stat k="₹ / acre" v={opp.price_per_acre ? formatINRShort(opp.price_per_acre) : "—"} />
        </div>

        <div className="mt-4">
          <CoBuyProgressBar current={opp.current_interest_count ?? 0} target={opp.target_members} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/co-buy/${slug}/express-interest`} className="rounded-full bg-green-700 px-6 py-3 font-medium text-white shadow-sm hover:bg-green-800">Express interest</Link>
          <Link href="#calculator" className="rounded-full border border-green-700 px-6 py-3 font-medium text-green-800 hover:bg-green-50">Estimate my share</Link>
        </div>

        <div className="mt-8"><CoBuyRiskNotice level={opp.legal_caution_level} /></div>

        {listing && (
          <section className="mt-8">
            <h2 className="mb-3 text-xl font-semibold">The parcel</h2>
            <div className="max-w-sm"><ListingCard listing={listing} /></div>
          </section>
        )}

        <section id="calculator" className="mt-10 scroll-mt-20">
          <CoBuyContributionCalculator totalPrice={opp.total_price} totalAcres={opp.total_area_unit === "acre" ? opp.total_area_value : null} targetMembers={opp.target_members} />
        </section>

        {opp.service_layer_enabled !== false && (
          <section className="mt-10"><CoBuyServicesExplainer /></section>
        )}

        {visitDates.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-2 text-xl font-semibold">Planned site visits</h2>
            <ul className="flex flex-wrap gap-2">
              {visitDates.map((d) => (
                <li key={d} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700">📅 {d}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-400">Indicative dates — confirmed with interested buyers individually.</p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-2 text-xl font-semibold">Legal status</h2>
          <p className="text-sm text-gray-600">
            This opportunity is at the <strong>{opp.status === "forming_circle" ? "circle-forming" : "interest"}</strong> stage.
            Title, encumbrance, and approvals must be independently verified, and all agreements reviewed by your own lawyer, before any payment.
          </p>
        </section>

        <div className="mt-6"><CoBuyNriWarning /></div>

        <section className="mt-10">
          <h2 className="mb-6 text-xl font-semibold">Questions buyers ask</h2>
          <CoBuyFaqAccordion faqs={CO_BUY_FAQS} />
        </section>

        <div className="mt-10">
          <CoBuyLegalDisclaimer stateSlug={stateSlug} stateLabel={stateSlug ? stateLabel(stateSlug) : null} override={opp.public_disclaimer} />
        </div>

        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-semibold text-green-900">Ready to explore this together?</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-green-800">Expressing interest is free and non-binding. We&apos;ll call you within 24–48 hours.</p>
          <Link href={`/co-buy/${slug}/express-interest`} className="mt-4 inline-block rounded-full bg-green-700 px-7 py-3 font-semibold text-white shadow-sm hover:bg-green-800">Express interest</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
