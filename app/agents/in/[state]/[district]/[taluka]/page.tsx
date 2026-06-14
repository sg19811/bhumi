import type { Metadata } from "next";
import GeoAgentsPage, { resolveState, deslug } from "@/app/components/agents/GeoAgentsPage";

export async function generateMetadata({ params }: { params: Promise<{ state: string; district: string; taluka: string }> }): Promise<Metadata> {
  const { state, district, taluka } = await params;
  const where = `${deslug(taluka)}, ${deslug(district)}, ${resolveState(state)}`;
  return {
    title: `Land agents in ${where} | Acrehub`,
    description: `Verified agricultural land agents in ${where}, reviewed by Acrehub.`,
    alternates: { canonical: `/agents/in/${state}/${district}/${taluka}` },
  };
}

export default async function Page({ params }: { params: Promise<{ state: string; district: string; taluka: string }> }) {
  const { state, district, taluka } = await params;
  return <GeoAgentsPage state={state} district={district} taluka={taluka} />;
}
