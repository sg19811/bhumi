import Link from "next/link";
import { agentTypeLabel } from "@/app/lib/agent-types";

const VERIFIED = new Set(["verified", "territory_verified"]);

type ManagedAgent = {
  slug: string;
  name: string;
  display_name: string | null;
  agent_type: string;
  verification_status: string;
};

// Shown on a listing detail page when the listing is sourced via an agent.
// Contact routes through the Acrehub WhatsApp number — the agent's personal
// number is never exposed.
export default function AgentManagedCard({ agent, listingTitle }: { agent: ManagedAgent; listingTitle?: string }) {
  const name = agent.display_name || agent.name;
  const acrehubWa = process.env.NEXT_PUBLIC_ACREHUB_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const waText = encodeURIComponent(`Hi Acrehub, I'm interested in the listing "${listingTitle ?? ""}" managed by ${name} (agent ref: ${agent.slug}).`);

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Managed by</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Link href={`/agents/${agent.slug}`} className="text-lg font-semibold text-gray-900 hover:text-green-700 hover:underline">{name}</Link>
        {VERIFIED.has(agent.verification_status) && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">✓ Verified agent</span>}
      </div>
      <p className="mt-0.5 text-sm text-gray-500 capitalize">{agentTypeLabel(agent.agent_type)}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/agents/${agent.slug}`} className="rounded-full border border-green-700 px-5 py-2 text-sm font-medium text-green-800 hover:bg-green-50">View agent profile</Link>
        {acrehubWa && (
          <a href={`https://wa.me/${acrehubWa}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-5 py-2 text-sm font-medium text-white">💬 Contact agent on WhatsApp</a>
        )}
      </div>
    </div>
  );
}
