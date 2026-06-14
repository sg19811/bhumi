import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AgentGrid from "@/app/components/agents/AgentGrid";
import { getPublicAgents, AGENTS_PAGE_SIZE } from "@/app/lib/agents/queries";
import { AGENT_STATE_OPTIONS, AGENT_TYPES, agentTypeLabel } from "@/app/lib/agent-types";

export const metadata: Metadata = {
  title: "Find a verified land agent | Acrehub Agent Network",
  description: "Browse verified agricultural land agents across India by state, district, and specialisation. Every agent is reviewed by Acrehub.",
  alternates: { canonical: "/agents" },
};

const inp = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600";

export default async function AgentsDirectory({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; district?: string; type?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { agents, counts, total } = await getPublicAgents(
    { state: sp.state, district: sp.district, agentType: sp.type },
    page
  );
  const totalPages = Math.max(1, Math.ceil(total / AGENTS_PAGE_SIZE));
  const qs = (p: number) => {
    const u = new URLSearchParams();
    if (sp.state) u.set("state", sp.state);
    if (sp.district) u.set("district", sp.district);
    if (sp.type) u.set("type", sp.type);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/agents?${s}` : "/agents";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">Find a verified land agent</h1>
        <p className="mt-2 text-gray-600">Agents reviewed by Acrehub, listing genuine agricultural land across India.</p>

        <form className="mt-6 flex flex-wrap gap-2" method="get">
          <select name="state" defaultValue={sp.state ?? ""} className={inp} aria-label="State">
            <option value="">All states</option>
            {AGENT_STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="district" defaultValue={sp.district ?? ""} placeholder="District" className={inp} aria-label="District" />
          <select name="type" defaultValue={sp.type ?? ""} className={inp} aria-label="Agent type">
            <option value="">All types</option>
            {AGENT_TYPES.map((t) => <option key={t} value={t}>{agentTypeLabel(t)}</option>)}
          </select>
          <button type="submit" className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">Filter</button>
          {(sp.state || sp.district || sp.type) && <Link href="/agents" className="self-center text-sm text-gray-500 hover:underline">Clear</Link>}
        </form>

        <p className="mt-4 text-sm text-gray-500">{total} agent{total === 1 ? "" : "s"}</p>

        <div className="mt-3">
          <AgentGrid agents={agents} counts={counts} />
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4 text-sm">
            {page > 1 ? <Link href={qs(page - 1)} className="text-green-700 hover:underline">← Previous</Link> : <span className="text-gray-300">← Previous</span>}
            <span className="text-gray-500">Page {page} of {totalPages}</span>
            {page < totalPages ? <Link href={qs(page + 1)} className="text-green-700 hover:underline">Next →</Link> : <span className="text-gray-300">Next →</span>}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-green-900">Are you a land agent?</h2>
          <p className="mt-1 text-sm text-green-800">Join the network and send properties over WhatsApp — we turn them into listings.</p>
          <Link href="/agents/join" className="mt-3 inline-block rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800">Apply to join</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
