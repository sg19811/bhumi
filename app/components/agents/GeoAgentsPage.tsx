import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AgentGrid from "@/app/components/agents/AgentGrid";
import { getPublicAgents } from "@/app/lib/agents/queries";
import { AGENT_STATE_OPTIONS } from "@/app/lib/agent-types";

// URL slug ("bangalore-rural") -> human label ("Bangalore Rural").
export const deslug = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Resolve a state slug to the canonical stored label (e.g. "karnataka" -> "Karnataka").
export function resolveState(slug: string): string {
  const match = AGENT_STATE_OPTIONS.find((s) => s.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());
  return match ?? deslug(slug);
}

export default async function GeoAgentsPage({
  state,
  district,
  taluka,
}: {
  state: string;
  district?: string;
  taluka?: string;
}) {
  const stateLabel = resolveState(state);
  const districtLabel = district ? deslug(district) : undefined;
  const talukaLabel = taluka ? deslug(taluka) : undefined;

  const { agents, counts, total } = await getPublicAgents({
    state: stateLabel,
    district: districtLabel,
    taluka: talukaLabel,
  });

  const where = [talukaLabel, districtLabel, stateLabel].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <Link href="/agents" className="text-sm text-green-700 hover:underline">← All agents</Link>
        <h1 className="mt-2 text-3xl font-bold">Land agents in {where}</h1>
        <p className="mt-2 text-gray-600">{total} verified agent{total === 1 ? "" : "s"} on Acrehub serving {where}.</p>
        <div className="mt-6">
          <AgentGrid agents={agents} counts={counts} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
