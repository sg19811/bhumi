// Typed copy for the farm-plot SEO surfaces. Prose is placeholder-quality and
// marked TODO — STRUCTURE is final so the build is stable; the founder edits the
// words. Do not auto-translate; native review required before relying on SEO.

export type FAQ = { q: string; a: string };

export type HubCopy = {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  faqs: FAQ[];
};

export type CityCopy = {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  priceNote: string;
  faqs: FAQ[];
};

export type CorridorCopy = {
  positioning: string; // 1-line under the hero
  knownFor: string;    // paragraph: what the corridor is known for
  landUse: string;     // paragraph: typical land use / plot sizes / price band
  legalNote: string;   // 1 paragraph; legal CTA is rendered separately
  faqs: FAQ[];
};

// TODO(founder): replace placeholder prose. Keep it unique per page (no boilerplate).
export const HUB_COPY: HubCopy = {
  heroTitle: "Farm plot projects near Bangalore",
  heroSubtitle:
    "Managed, gated and plantation farm plots across Bangalore's growth corridors — with real boundaries, trust scores, and legal clarity.",
  intro:
    "TODO: 1–2 paragraphs on what a farm plot project is, who it suits, and how AcreHub helps you compare them honestly. Mention verification, legal checks, and that listings show real plot inventory.",
  faqs: [
    { q: "What is a farm plot project?", a: "TODO: explain managed/gated/plantation farm plots vs. raw agricultural land." },
    { q: "Are farm plots a good investment?", a: "TODO: balanced, non-hype answer; mention appreciation depends on location, access, approvals." },
    { q: "What should I verify before buying a farm plot?", a: "TODO: layout approval, conversion status, title, EC; link to the legal checklist." },
    { q: "Can NRIs buy farm plots?", a: "TODO: route to the NRI legal guidance; agricultural-land restrictions may apply." },
  ],
};

export const CITY_COPY: CityCopy = {
  heroTitle: "Farm plot projects in Bangalore",
  heroSubtitle: "Browse projects by corridor — from Devanahalli in the north to Kanakapura Road in the south.",
  intro:
    "TODO: paragraph on why Bangalore drives farm-plot demand (weekend-farm culture, airport corridor, plantation belts), and how corridors differ.",
  priceNote:
    "TODO: short note on the price band observed across Bangalore corridors (computed figures are shown above this text).",
  faqs: [
    { q: "Which Bangalore corridor is best for farm plots?", a: "TODO: it depends on purpose — list the trade-offs." },
    { q: "How far are these projects from the city?", a: "TODO: typical 40–90 min; varies by corridor." },
    { q: "Do farm plots near Bangalore need conversion?", a: "TODO: explain agricultural vs converted; link to legal." },
  ],
};

// Per-corridor copy, keyed by slug. Any missing slug falls back to a generic shape.
export const CORRIDOR_COPY: Record<string, CorridorCopy> = {
  "kanakapura-road": {
    positioning: "South Bangalore's greenbelt corridor — plantations, the Cauvery belt, and weekend farms.",
    knownFor: "TODO: proximity to the city, plantation/coconut belt, river access, hill backdrop.",
    landUse: "TODO: typical plot sizes, agricultural vs converted, observed price band.",
    legalNote: "TODO: Karnataka legal note — RTC, conversion, layout approval. Link to the state guide.",
    faqs: [
      { q: "What documents to check on Kanakapura Road?", a: "TODO: RTC, mutation, conversion order, layout approval." },
      { q: "How far is Kanakapura Road from Bangalore?", a: "TODO: distance/time." },
      { q: "Are these plots converted (NA) land?", a: "TODO." },
    ],
  },
  devanahalli: {
    positioning: "The airport corridor — fastest-appreciating farmland north of Bangalore.",
    knownFor: "TODO: airport proximity, infrastructure growth, managed farmland projects.",
    landUse: "TODO: plot sizes, price band, project density.",
    legalNote: "TODO: Karnataka legal note. Link to the state guide.",
    faqs: [
      { q: "Why are Devanahalli farm plots in demand?", a: "TODO: airport + infra." },
      { q: "What approvals matter near the airport?", a: "TODO." },
      { q: "Typical plot sizes in Devanahalli?", a: "TODO." },
    ],
  },
  "nandi-hills": {
    positioning: "Hill-view plantation and weekend-farm country north of the airport.",
    knownFor: "TODO: scenic hills, vineyards/plantations, premium weekend farms.",
    landUse: "TODO: plot sizes, price band.",
    legalNote: "TODO: Karnataka legal note — watch hill-area/eco-sensitive restrictions. Link to state guide.",
    faqs: [
      { q: "Are there building restrictions near Nandi Hills?", a: "TODO: eco-sensitive/hill-area rules." },
      { q: "What grows well here?", a: "TODO." },
      { q: "How far from the airport?", a: "TODO." },
    ],
  },
  "mysore-road": {
    positioning: "The western corridor toward Mysuru — affordable farmland with highway access.",
    knownFor: "TODO: highway connectivity, agri belt, value plots.",
    landUse: "TODO: plot sizes, price band.",
    legalNote: "TODO: Karnataka legal note. Link to state guide.",
    faqs: [
      { q: "Is Mysore Road good for farming?", a: "TODO." },
      { q: "Typical prices on Mysore Road?", a: "TODO." },
      { q: "Highway access and travel time?", a: "TODO." },
    ],
  },
  hosur: {
    positioning: "Tamil-Nadu-side corridor with Bangalore proximity and industrial growth.",
    knownFor: "TODO: Bangalore proximity, industrial belt, cooler climate.",
    landUse: "TODO: plot sizes, price band.",
    legalNote:
      "IMPORTANT (TODO + lawyer review): Hosur is in Tamil Nadu — different land law than Karnataka. The TN legal guide may still be pending review; surface the disclaimer and do not imply legal clarity that isn't there. Link to the Tamil Nadu state guide.",
    faqs: [
      { q: "Can a Bangalore buyer purchase farm plots in Hosur (Tamil Nadu)?", a: "TODO: TN rules differ; legal review needed." },
      { q: "What's different about TN land law?", a: "TODO." },
      { q: "How far is Hosur from Bangalore?", a: "TODO." },
    ],
  },
  "sarjapur-anekal": {
    positioning: "South-east corridor near the IT belt — gated farm plots within easy reach.",
    knownFor: "TODO: IT-corridor proximity, gated communities, weekend farms.",
    landUse: "TODO: plot sizes, price band.",
    legalNote: "TODO: Karnataka legal note. Link to state guide.",
    faqs: [
      { q: "Why Sarjapur–Anekal for farm plots?", a: "TODO: IT proximity." },
      { q: "Gated vs open plots here?", a: "TODO." },
      { q: "Distance from the IT corridor?", a: "TODO." },
    ],
  },
};

export function corridorCopy(slug: string): CorridorCopy {
  return (
    CORRIDOR_COPY[slug] ?? {
      positioning: "A Bangalore-region farm-plot corridor.",
      knownFor: "TODO: corridor description.",
      landUse: "TODO: typical plot sizes and price band.",
      legalNote: "TODO: state legal note. Link to the relevant state guide.",
      faqs: [],
    }
  );
}
