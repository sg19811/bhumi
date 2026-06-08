// Typed copy for the farm-plot SEO surfaces. Prose is editorial (founder-owned);
// keep it honest and unique per page (no boilerplate, no investment hype, no
// invented numbers). Route legal specifics to the Legal Navigator. Do not
// auto-translate; native review required before relying on SEO.

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

export const HUB_COPY: HubCopy = {
  heroTitle: "Farm plot projects near Bangalore",
  heroSubtitle:
    "Managed, gated and plantation farm plots across Bangalore's growth corridors — shown with real map boundaries, plot inventory, trust scores, and a clear legal checklist.",
  intro:
    "A farm plot project is agricultural or converted land sold as a planned, plotted development — often with internal roads, fencing, water, security, and sometimes plantation or farm-management services. People buy them for a weekend farm, a long-term land holding, plantation income, or eventually a farmhouse.\n\nThe category attracts both genuine developers and aggressive marketing, so the same checks matter as for any land: who really owns it, whether the layout is approved, whether the land is converted or still agricultural, and what the title and encumbrance records say. AcreHub shows the boundary on a real map, lists the actual plot inventory where the developer provides it, computes a trust score from the available signals, and links you to a state-specific legal checklist — instead of a glossy brochure. Always verify documents and, for anything consequential, consult a lawyer.",
  faqs: [
    {
      q: "What is a farm plot project?",
      a: "Land sold as a planned, plotted development — usually managed, gated, or plantation farmland with shared amenities such as internal roads, fencing, water and security. It's still land: the same ownership, approval, and conversion checks apply as for any agricultural plot.",
    },
    {
      q: "Are farm plots a good investment?",
      a: "It depends entirely on the specific plot — its location, road access, water, whether the layout is approved, whether it's converted, and the price you pay. Appreciation is never guaranteed, and maintenance fees and resale liquidity matter. Treat any promised 'returns' with caution and verify everything independently.",
    },
    {
      q: "What should I verify before buying a farm plot?",
      a: "At minimum: the seller's title and the mother-deed chain, the latest revenue records (RTC/Pahani in Karnataka), mutation, an Encumbrance Certificate, the conversion order if non-agricultural use is intended, and any layout / planning approval. Our document checklist walks through it.",
    },
    {
      q: "Can NRIs buy farm plots near Bangalore?",
      a: "Generally NRIs and OCIs cannot directly purchase agricultural, plantation, or farmhouse land in India under FEMA — converted (NA) land is treated differently. Get a FEMA plus state-law review before committing. See the NRI guidance in the Legal Navigator.",
    },
  ],
};

export const CITY_COPY: CityCopy = {
  heroTitle: "Farm plot projects in Bangalore",
  heroSubtitle:
    "Browse projects by corridor — from Devanahalli and Nandi Hills in the north to Kanakapura Road and Sarjapur–Anekal in the south.",
  intro:
    "Bangalore has one of India's most active weekend-farm and managed-farmland markets, driven by a large professional population, a strong plantation belt around the city, and fast-growing corridors in every direction. Each corridor has a different character — airport-led growth in the north, plantation and greenbelt land in the south, hill country toward Nandi, and the Tamil Nadu uplands around Hosur.\n\nWe organise projects by corridor so you can compare like with like: distance from the city, typical plot sizes, the kind of land, and the legal checks specific to the state. Counts below reflect live listings on AcreHub today.",
  priceNote:
    "Prices vary widely by corridor, distance from the city, plot size, amenities, and whether the land is converted — so treat any single figure with care. The range shown above is computed from current live listings only and will shift as more projects are added.",
  faqs: [
    {
      q: "Which Bangalore corridor is best for farm plots?",
      a: "There's no single best — it depends on your purpose. Devanahalli suits infrastructure-led holding, Nandi Hills suits scenic weekend farms and plantations, Kanakapura Road suits greenbelt and Cauvery-belt land, Mysore Road tends to be more affordable, and Sarjapur–Anekal is closest to the IT corridor. Compare distance, land type, and price for your goal.",
    },
    {
      q: "How far are these projects from the city?",
      a: "Most sit roughly 30–90 minutes from central Bangalore depending on the corridor and traffic. The corridor pages show the average distance computed from live listings.",
    },
    {
      q: "Do farm plots near Bangalore need conversion?",
      a: "It depends on the land and your intended use. Some plots are still classified agricultural; building a farmhouse or non-farm structure usually needs land-use conversion (NA) plus plan approval. Always check the conversion order and the Karnataka rules before assuming you can build.",
    },
  ],
};

export const CORRIDOR_COPY: Record<string, CorridorCopy> = {
  "kanakapura-road": {
    positioning: "South Bangalore's greenbelt — plantation belts, the Cauvery basin, and easy weekend-farm access.",
    knownFor:
      "Kanakapura Road runs south from Bangalore toward Kanakapura town and the Cauvery, with good connectivity via the NICE corridor and a metro extension reaching toward the southern suburbs. It's long been a greenbelt direction, known for coconut and areca plantations, granite hills, and a cooler, greener feel than the city — which is why it's popular for weekend farms and managed farmland.",
    landUse:
      "Plots here range from small managed farm plots to larger plantation parcels; some land is still agricultural and some is converted. Proximity to the city tends to keep prices firmer than corridors further out. Check each project for whether it is a sanctioned layout or a sale of agricultural plots, and confirm water source and access road.",
    legalNote:
      "This is Karnataka, so the usual checks apply: RTC/Pahani, mutation, Encumbrance Certificate, the mother-deed chain, conversion order if you intend non-farm use, and any layout approval. Watch for PTCL/granted-land and greenbelt restrictions. This is general guidance, not legal advice — verify with a lawyer.",
    faqs: [
      {
        q: "What documents should I check on Kanakapura Road?",
        a: "RTC/Pahani, mutation records, a long Encumbrance Certificate, the prior sale-deed chain, the conversion (NA) order if non-agricultural use is planned, and layout/planning approval where it's sold as a layout. A lawyer can verify PTCL/granted-land status.",
      },
      {
        q: "How far is Kanakapura Road from Bangalore?",
        a: "Projects typically sit roughly 30–60 km from central Bangalore depending on how far down the corridor they are — broadly an hour or so by road. The page header shows the average across current listings.",
      },
      {
        q: "Is the land here converted or agricultural?",
        a: "Both exist. Verify each plot's classification on the revenue record; if you plan to build, you'll usually need land-use conversion and plan approval first.",
      },
    ],
  },
  devanahalli: {
    positioning: "The airport corridor — infrastructure-led farmland north of Bangalore.",
    knownFor:
      "Devanahalli, north of the city, is anchored by Kempegowda International Airport and a band of business-park, hardware-park, and township activity along the corridor. That infrastructure has made it one of the most talked-about directions for land north of Bangalore, with a mix of managed farmland projects and plotted developments.",
    landUse:
      "Expect a spread from small managed farm plots to larger holdings, some agricultural and some converted. Demand from the airport story can push prices and marketing intensity higher here than in quieter corridors — which makes independent verification of approvals especially important.",
    legalNote:
      "Karnataka rules apply. Confirm RTC/mutation, Encumbrance Certificate, conversion status, and layout/planning approval, and check whether any part of the land falls under acquisition notifications or planning-authority restrictions near the airport. General guidance only — consult a lawyer.",
    faqs: [
      {
        q: "Why is Devanahalli in demand for farm plots?",
        a: "The airport plus surrounding business-park and infrastructure development draw buyers expecting long-term growth. That interest is real, but it also attracts heavy marketing — verify each project's approvals and title independently rather than relying on the 'airport' pitch.",
      },
      {
        q: "What approvals matter near the airport?",
        a: "Beyond title and conversion, check for planning-authority jurisdiction, any acquisition or road-widening notifications, and proper layout sanction where it's sold as a layout. A lawyer should confirm there are no encumbrances or notifications on the survey numbers.",
      },
      {
        q: "What plot sizes are typical in Devanahalli?",
        a: "They vary by project — from compact managed plots to larger parcels. The project's own listing shows its plot size range; use the inventory table on each listing for specifics.",
      },
    ],
  },
  "nandi-hills": {
    positioning: "Hill-view plantation and weekend-farm country beyond the airport.",
    knownFor:
      "Around Nandi Hills, further north past the airport, the land rises into scenic hill country known for vineyards and the Nandi Valley grape belt, orchards, and premium weekend farms. The cooler climate and views make it a sought-after direction for plantation-style and farmhouse-oriented projects.",
    landUse:
      "Plots tend toward plantation, orchard, and weekend-farm use, sometimes at a premium for the setting. Because it's hill and greenbelt terrain, eco-sensitive-zone and hill-area considerations can apply — check what construction, if any, is actually permitted before buying for a farmhouse.",
    legalNote:
      "Karnataka rules apply, with extra attention to hill-area, lake-buffer, and eco-sensitive-zone restrictions that can limit construction. Verify RTC/mutation, EC, conversion status, and any environmental or buffer-zone limits. This is general guidance — consult a lawyer.",
    faqs: [
      {
        q: "Are there building restrictions near Nandi Hills?",
        a: "Possibly. Hill-area, lake-buffer, and eco-sensitive-zone rules can restrict or prohibit construction on some parcels even if the land is otherwise saleable. Confirm exactly what is permitted on the specific survey number before assuming you can build.",
      },
      {
        q: "What grows well in this belt?",
        a: "The Nandi belt is known for grapes/vineyards and orchards thanks to its climate and elevation. Many projects here lean plantation or weekend-farm rather than dense plotting.",
      },
      {
        q: "How far is Nandi Hills from the airport and the city?",
        a: "It sits beyond the airport to the north — broadly an hour-plus from central Bangalore depending on the exact location. The header shows the average distance across current listings.",
      },
    ],
  },
  "mysore-road": {
    positioning: "The western corridor toward Mysuru — more affordable farmland with highway access.",
    knownFor:
      "Mysore Road heads west from Bangalore toward Ramanagara and Mysuru, along a well-connected highway past Bidadi's industrial and film-city activity. It's an established agricultural belt and tends to be one of the more affordable directions for farm and weekend-farm land near the city.",
    landUse:
      "Expect agricultural and weekend-farm plots, often at lower price points than the northern corridors, with the trade-off of distance and a more industrial-highway character in parts. Verify water source and genuine road access, which vary a lot along this stretch.",
    legalNote:
      "Karnataka rules apply: RTC/mutation, Encumbrance Certificate, conversion order for non-farm use, and layout approval where relevant. Confirm there are no industrial-zone or highway-widening notifications on the parcel. General guidance only — consult a lawyer.",
    faqs: [
      {
        q: "Is Mysore Road good for farming?",
        a: "Parts of this belt are genuine agricultural land with reasonable water; others are closer to industrial and highway development. Check the specific plot's water source, soil, and surroundings rather than the corridor reputation.",
      },
      {
        q: "Why is land here often cheaper?",
        a: "Generally greater distance from the prime southern/northern growth pockets and a more industrial-highway character keep prices lower. Lower price isn't automatically better value — weigh access, water, and approvals.",
      },
      {
        q: "Is highway access a plus or a risk?",
        a: "Both. Good connectivity helps, but proximity to a national highway can bring widening notifications or buffer rules on some parcels. Confirm the access road is legal and unaffected by notifications.",
      },
    ],
  },
  hosur: {
    positioning: "Tamil-Nadu-side corridor with Bangalore proximity, cooler uplands, and an industrial base.",
    knownFor:
      "Hosur sits just across the Tamil Nadu border, roughly 40 km from Bangalore, with a strong automotive and manufacturing base and the cooler Denkanikottai–Krishnagiri uplands nearby, long known for rose and horticulture cultivation. Bangalore buyers are drawn by the proximity, the climate, and often lower prices than comparable Karnataka corridors.",
    landUse:
      "Land here ranges from agricultural and horticultural plots to managed farm projects. The key difference is jurisdiction: this is Tamil Nadu, so the legal framework, revenue records (Patta/Chitta, FMB), and conversion process differ from Karnataka — don't assume Karnataka rules apply.",
    legalNote:
      "Important: Hosur is in Tamil Nadu, where land law differs from Karnataka, and AcreHub's Tamil Nadu legal guidance is still under review. Treat any note here as informational only, verify Patta/Chitta, A-Register, FMB, EC, and land classification, and consult a Tamil Nadu land lawyer before committing.",
    faqs: [
      {
        q: "Can a Bangalore buyer purchase farm plots in Hosur (Tamil Nadu)?",
        a: "Residency in Bangalore doesn't change Tamil Nadu's rules — a resident Indian can generally buy private agricultural land in TN, but the documents and process differ from Karnataka. Get a Tamil Nadu lawyer to verify Patta/Chitta, classification, and any restrictions first.",
      },
      {
        q: "What's different about Tamil Nadu land law here?",
        a: "Different revenue records (Patta/Chitta, A-Register, FMB), a different conversion and planning process, and different special-category-land risks. Our Tamil Nadu guidance is being finalised — until then, rely on a verified TN advocate.",
      },
      {
        q: "How far is Hosur from Bangalore?",
        a: "Hosur is roughly 40 km from central Bangalore — often under an hour or so by road via Hosur Road, which is a large part of its appeal to Bangalore buyers.",
      },
    ],
  },
  "sarjapur-anekal": {
    positioning: "South-east corridor near the IT belt — gated farm plots within commuting reach.",
    knownFor:
      "Sarjapur–Anekal, south-east of the city, sits close to the Sarjapur Road IT belt and the Anekal taluk's greener stretches. Its appeal is being near the tech corridor and a large professional population while still offering farmland and gated weekend-farm projects a short drive out.",
    landUse:
      "Expect a mix of gated farm plots and managed farmland, often pitched at IT-corridor buyers wanting a weekend farm without a long drive. Proximity to fast-developing areas can blur the line between farmland and peri-urban plotting — confirm whether you're buying genuine farm land or an unapproved layout.",
    legalNote:
      "Karnataka rules apply. Verify RTC/mutation, EC, the mother-deed chain, conversion status, and layout approval — and be especially careful of revenue-site or unapproved-layout risk in fast-developing pockets. General guidance only — consult a lawyer.",
    faqs: [
      {
        q: "Why Sarjapur–Anekal for farm plots?",
        a: "Closeness to the Sarjapur Road IT corridor and a large professional buyer base, with greener farmland and gated projects a manageable drive away. That demand also means more marketing — verify approvals carefully.",
      },
      {
        q: "Gated farm plots vs open plots here — what's the difference?",
        a: "Gated projects add shared infrastructure (roads, fencing, security, sometimes farm management) and maintenance fees; open plots don't. Either way, the title, conversion, and approval checks are the same.",
      },
      {
        q: "How do I avoid an unapproved layout here?",
        a: "Ask for the layout sanction and check the land is properly converted and the plots legally formed. If a project is sold as 'farm land' but used like a residential layout, treat that as a red flag and get a lawyer to verify.",
      },
    ],
  },
};

export function corridorCopy(slug: string): CorridorCopy {
  return (
    CORRIDOR_COPY[slug] ?? {
      positioning: "A Bangalore-region farm-plot corridor.",
      knownFor: "A corridor in the Bangalore region with farm and weekend-farm land.",
      landUse: "Plot sizes and prices vary by project; check each listing's details and the legal checklist.",
      legalNote: "Verify title, revenue records, conversion status, and approvals with a lawyer before buying.",
      faqs: [],
    }
  );
}
