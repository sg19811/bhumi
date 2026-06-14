import type { Metadata } from "next";
import GeoAgentsPage, { resolveState } from "@/app/components/agents/GeoAgentsPage";

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const s = resolveState(state);
  const title = `Land agents in ${s} | Acrehub`;
  return { title, description: `Verified agricultural land agents in ${s}, reviewed by Acrehub.`, alternates: { canonical: `/agents/in/${state}` } };
}

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  return <GeoAgentsPage state={state} />;
}
