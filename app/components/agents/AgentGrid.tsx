import AgentProfileCard from "@/app/components/agents/AgentProfileCard";
import type { PublicAgent } from "@/app/lib/agent-types";

export default function AgentGrid({ agents, counts }: { agents: PublicAgent[]; counts: Record<string, number> }) {
  if (agents.length === 0) {
    return <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">No agents listed here yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((a) => (
        <AgentProfileCard key={a.id} agent={a} listingCount={counts[a.id]} />
      ))}
    </div>
  );
}
