import Link from "next/link";
import { agentTypeLabel, type PublicAgent } from "@/app/lib/agent-types";

const VERIFIED = new Set(["verified", "territory_verified"]);

export default function AgentProfileCard({ agent, listingCount }: { agent: PublicAgent; listingCount?: number }) {
  const place = [agent.taluka, agent.district, agent.state].filter(Boolean).join(", ");
  const initial = (agent.display_name || agent.name || "?").trim().charAt(0).toUpperCase();

  return (
    <Link href={`/agents/${agent.slug}`} className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow">
      <div className="flex items-center gap-3">
        {agent.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agent.profile_photo_url} alt={agent.name} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-700">{initial}</div>
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-semibold text-gray-900">
            {agent.display_name || agent.name}
            {VERIFIED.has(agent.verification_status) && <span title="Verified agent" className="text-green-600">✓</span>}
          </p>
          <p className="truncate text-sm text-gray-500">{place}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">{agentTypeLabel(agent.agent_type)}</span>
        {typeof listingCount === "number" && listingCount > 0 && <span>{listingCount} active listing{listingCount === 1 ? "" : "s"}</span>}
      </div>
      <span className="mt-3 inline-block text-sm font-medium text-green-700">View profile →</span>
    </Link>
  );
}
