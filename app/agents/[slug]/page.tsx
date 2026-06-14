import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import { getAgentBySlug } from "@/app/lib/agents/queries";
import { agentTypeLabel } from "@/app/lib/agent-types";

const VERIFIED = new Set(["verified", "territory_verified"]);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAgentBySlug(slug);
  if (!data) return { title: "Agent not found | Acrehub" };
  const a = data.agent;
  const place = [a.district, a.state].filter(Boolean).join(", ");
  const title = `${a.display_name || a.name} — land agent in ${place} | Acrehub`;
  const description = a.bio || `Verified ${agentTypeLabel(a.agent_type)} on Acrehub, serving ${place}.`;
  return {
    title,
    description,
    alternates: { canonical: `/agents/${slug}` },
    openGraph: { title, description, ...(a.profile_photo_url ? { images: [a.profile_photo_url] } : {}) },
  };
}

export default async function AgentProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getAgentBySlug(slug);
  if (!data) notFound();
  const { agent: a, listings } = data;
  const place = [a.taluka, a.district, a.state].filter(Boolean).join(", ");

  // Contact routes through the Acrehub WhatsApp number (keeps the agent's personal
  // number private and Acrehub in the loop). Hidden if the number isn't configured.
  const acrehubWa = process.env.NEXT_PUBLIC_ACREHUB_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const waText = encodeURIComponent(`Hi Acrehub, I'd like to connect with your agent ${a.display_name || a.name} (ref: ${a.slug}).`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: a.display_name || a.name,
    jobTitle: agentTypeLabel(a.agent_type),
    areaServed: place,
    url: `https://acrehubindia.com/agents/${a.slug}`,
    ...(a.profile_photo_url ? { image: a.profile_photo_url } : {}),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
        <Link href="/agents" className="text-sm text-green-700 hover:underline">← All agents</Link>

        <section className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {a.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.profile_photo_url} alt={a.name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-2xl font-semibold text-green-700">
                {(a.display_name || a.name).trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                {a.display_name || a.name}
                {VERIFIED.has(a.verification_status) && <span title="Verified by Acrehub" className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">✓ Verified</span>}
              </h1>
              <p className="mt-0.5 text-gray-600">{agentTypeLabel(a.agent_type)}{place && ` · ${place}`}</p>
              {a.years_experience ? <p className="mt-0.5 text-sm text-gray-500">{a.years_experience} years experience</p> : null}
              {a.languages?.length > 0 && <p className="mt-1 text-sm text-gray-500">Speaks: {a.languages.join(", ")}</p>}
              {a.specializations?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.specializations.map((s) => <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{s.replace(/_/g, " ")}</span>)}
                </div>
              )}
            </div>
          </div>

          {a.bio && <p className="mt-4 whitespace-pre-line text-sm text-gray-700">{a.bio}</p>}

          {acrehubWa && (
            <a href={`https://wa.me/${acrehubWa}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white">
              💬 Contact via Acrehub
            </a>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Listings from this agent ({listings.length})</h2>
          {listings.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">No active listings right now.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => <ListingCard key={String(l.id)} listing={l} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
