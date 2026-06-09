// Static, code-resident buying guides — SEO content that ships with the app (no
// DB needed). Bodies use the MarkdownLite subset: ## / ### headings, "- " bullets,
// and blank-line-separated paragraphs. Educational only — NOT legal advice.

export type Guide = {
  slug: string;
  title: string;
  description: string; // meta description
  summary: string; // shown on the index + as Article description
  readingMinutes: number;
  updated: string; // ISO date, for Article schema
  body: string; // MarkdownLite markdown
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-buy-agricultural-land-in-karnataka",
    title: "How to Buy Agricultural Land in Karnataka: Step-by-Step Guide",
    description:
      "A practical, step-by-step guide to buying agricultural land in Karnataka — who can buy, the documents to verify, conversion, stamp duty, and common pitfalls. Educational, not legal advice.",
    summary:
      "Who can buy farmland in Karnataka after the 2020 reforms, the documents to verify, conversion, registration, and the mistakes to avoid.",
    readingMinutes: 7,
    updated: "2026-06-09",
    body: `Buying agricultural land in Karnataka has become more accessible since the 2020 amendments to the Karnataka Land Reforms Act, but the process still rewards careful due diligence. This guide walks through the steps in plain language.

## Who can buy agricultural land in Karnataka?

The 2020 amendment removed the earlier income ceiling and the rule that only agriculturists could buy farmland. In practice this means salaried professionals, businesspeople, and non-farmers can now purchase agricultural land in the state. NRIs, OCIs, and foreign nationals face separate RBI/FEMA restrictions and generally cannot buy agricultural land without specific approval — check your status before you proceed.

Rules change and exceptions exist, so confirm your eligibility for your specific case before paying any advance.

## Step 1: Confirm the land's classification

Make sure the parcel is genuinely agricultural and not, for example, forest land, granted land, or land under a ceiling case. Ask for the survey number and pull the latest RTC (Record of Rights, Tenancy and Crops, also called the "pahani").

## Step 2: Verify ownership and title

- Match the seller's name on the title deed to the latest RTC and mutation records.
- Trace the chain of ownership back at least 13–30 years.
- If the seller is selling on behalf of others (family, power of attorney), verify their authority in writing.

## Step 3: Get an encumbrance certificate

An Encumbrance Certificate (EC) for the last 30 years shows whether the land carries loans, liens, or court attachments. A clean EC is essential before you commit.

## Step 4: Check conversion status if you plan to build

Agricultural land must usually be converted to non-agricultural (NA) use before you can legally build a house or a project on it. If a seller claims the land is "converted," ask for the DC conversion order and confirm it.

## Step 5: Register the sale deed and pay stamp duty

The sale is complete only when the deed is registered at the sub-registrar's office and stamp duty plus registration fees are paid. Budget for this on top of the price — you can estimate it with our stamp duty calculator.

## Common pitfalls to avoid

- Paying a large advance before the title and EC are verified.
- Assuming a village name on a brochure equals an exact, pinned boundary.
- Ignoring access — confirm there is a legal approach road, not just a path across someone else's field.
- Trusting "converted" or "approved" claims without seeing the order.

This guide is educational and not legal advice. Land laws change and every parcel is different — always confirm the current rules and your specific situation with a qualified lawyer and the local revenue office before you buy.`,
  },
  {
    slug: "farm-plot-vs-agricultural-land-what-to-check",
    title: "Farm Plots vs Agricultural Land: What to Check Before You Buy",
    description:
      "Managed farm plots and gated farmland projects are not the same as buying raw agricultural land. Here's how they differ and exactly what to verify before you buy. Educational, not legal advice.",
    summary:
      "How managed/gated farm plot projects differ from raw farmland, and the specific checks — layout approval, conversion, developer track record — that protect you.",
    readingMinutes: 6,
    updated: "2026-06-09",
    body: `"Farm plots" and "managed farmland" projects have boomed near Indian cities, marketed as weekend getaways and appreciating assets. They can be a good fit — but they are a different product from buying a single piece of agricultural land, and they carry their own checklist.

## What is a managed farm plot project?

A developer aggregates a large parcel, divides it into smaller plots, and sells them individually — often with shared amenities (fencing, water, a clubhouse, caretaking) and a maintenance contract. "Gated farmland" and "plantation projects" are variations on the same idea.

## How it differs from raw agricultural land

- You are buying a sub-divided plot within a larger layout, not an independent survey number.
- A maintenance fee usually applies, sometimes indefinitely.
- The developer's promises (amenities, returns, buy-back) are only as good as the contract and their track record.
- The legal status of the layout — whether it is approved and converted — matters enormously.

## What to verify before you buy a farm plot

- Title and ownership of the parent land, exactly as you would for any parcel.
- Whether the layout has the necessary approvals, and whether the land is converted (NA) for the use being sold.
- What you actually own on paper — a registered plot with a clear survey/sub-division number, or only a share in an undivided parcel.
- The maintenance fee: how much, for how long, and what happens if the developer stops servicing it.
- The developer's other projects and their delivery history.
- Resale reality — can you sell the plot independently later, and to whom?

## The honest test

Treat the brochure's promises as marketing, and the documents as truth. If a project can't show you clean title, the conversion/approval orders, and a registrable plot, the amenities don't matter.

This guide is educational and not legal advice. Always verify ownership, approvals, and conversion independently, and consult a lawyer before any payment.`,
  },
  {
    slug: "how-to-verify-agricultural-land-before-buying",
    title: "How to Verify Agricultural Land Before Buying in India",
    description:
      "A buyer's due-diligence checklist for agricultural land in India — title, RTC, encumbrance, mutation, survey, and access — plus the red flags to walk away from. Educational, not legal advice.",
    summary:
      "The document-by-document due-diligence checklist for farmland in India, and the red flags that should make you pause.",
    readingMinutes: 6,
    updated: "2026-06-09",
    body: `Most land disputes trace back to a check that was skipped. Before you pay anything for agricultural land in India, work through this due-diligence list — ideally with a local lawyer.

## Start with the title and revenue records

- Title deed: confirm the seller is the legal owner and trace the chain of previous owners.
- RTC / 7-12 extract: the record of rights showing ownership, crops, and land type. Match the name and extent to the title.
- Mutation records: confirm ownership changes were properly recorded and there are no pending entries.

## Check for loans, liens, and disputes

An Encumbrance Certificate (EC) covering the last 30 years reveals mortgages, liens, or court attachments. Separately, ask whether the land is subject to any ongoing litigation.

## Confirm it isn't restricted land

Some land cannot be freely sold — for example granted land, tribal land, land under ceiling limits, or land notified for acquisition. Verify the parcel is free of these restrictions.

## Walk the boundaries

- Match the survey number against the map and physically walk the boundaries.
- Confirm the actual extent matches the documents.
- Check there is a legal approach road and right of way, not just an informal path.

## Red flags to take seriously

- A seller who resists sharing the RTC, EC, or original title.
- A price far below the local norm with no clear reason.
- Pressure to pay a large advance quickly.
- "Converted" or "approved" claims with no order to show.
- Boundaries that don't match the documents on the ground.

## Before you pay

Get the documents reviewed by a lawyer, confirm the registration and stamp duty process, and never pay a significant advance until the title and EC are verified in writing.

This guide is educational and not legal advice. Every parcel and state differs — consult a qualified lawyer and the local revenue office before buying.`,
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
