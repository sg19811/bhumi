import type { Corridor } from "@/app/lib/farm-plots/types";

// The 6 MVP corridors (Bangalore region). Add more here as real projects appear.
// `state` routes the legal CTA to /legal/state/[state]. Hosur is Tamil-Nadu-side.
export const CORRIDORS: Corridor[] = [
  { slug: "kanakapura-road", label: "Kanakapura Road", parent_city: "bangalore", state: "karnataka" },
  { slug: "devanahalli", label: "Devanahalli", parent_city: "bangalore", state: "karnataka" },
  { slug: "nandi-hills", label: "Nandi Hills", parent_city: "bangalore", state: "karnataka" },
  { slug: "mysore-road", label: "Mysore Road", parent_city: "bangalore", state: "karnataka" },
  { slug: "hosur", label: "Hosur", parent_city: "bangalore", state: "tamil_nadu" },
  { slug: "sarjapur-anekal", label: "Sarjapur–Anekal", parent_city: "bangalore", state: "karnataka" },
];

export const CORRIDOR_SLUGS = CORRIDORS.map((c) => c.slug);

export function getCorridor(slug?: string | null): Corridor | undefined {
  if (!slug) return undefined;
  return CORRIDORS.find((c) => c.slug === slug);
}

export function corridorExists(slug?: string | null): boolean {
  return !!getCorridor(slug);
}

export function corridorLabel(slug?: string | null): string {
  return getCorridor(slug)?.label ?? (slug ?? "").replace(/-/g, " ");
}
