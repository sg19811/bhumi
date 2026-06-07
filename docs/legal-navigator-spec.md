# Land Legal Navigator — MVP Product & Technical Spec

> **Honest scope statement first.** The full vision described in the original prompt (21 sections: AI chatbot, document upload + AI review pipeline, empanelled lawyer marketplace with KYC + payments, full risk analyzer, internal legal-ops dashboard) is 6–12 months of multi-person team work, and the hardest parts are not code — they are lawyer recruitment, content review, and regulatory positioning. This document specifies only the **MVP** (2–3 weeks of Claude Code work) and lists the rest as explicit Phase 2 / Phase 3 deferrals. Build MVP, validate demand with real lead numbers, then expand.

---

## 1. Module name & positioning

**Name: Land Legal Navigator**

URL prefix: `/legal`. The existing `/eligibility` route redirects to `/legal`.

Tagline: *"Check your eligibility, understand state-wise rules, and get lawyer-backed guidance before buying agricultural land in India."*

Position the module as **informational guidance + lead generation for legal services** — *not* legal advice. Every result, article, and CTA carries a visible disclaimer; the brand promise is "we help you ask the right questions and connect you to a verified lawyer," not "we tell you it's safe to buy this land."

---

## 2. Primary user types (MVP-relevant)

| User | Concern | Wanted action | Lead value |
|---|---|---|---|
| Buyer (resident, non-farmer) | "Can I buy this in this state?" | Eligibility check + lawyer review | High |
| NRI buyer | Inheritance/purchase legality, repatriation | Eligibility + NRI advisory | Very high |
| Farmer buyer | Ceiling limits, conversion | Eligibility + checklist | Medium |
| Seller / land agent | Document readiness, listing trust | Document checklist + verification | High (acquisition signal) |
| Company/LLP/Trust buyer | Entity-specific restrictions | Eligibility + lawyer | Very high |
| Investor / farmhouse buyer | Conversion + zoning rules | Risk profile + lawyer | High |

Defer for Phase 2+: Internal sales team dashboard, legal ops team dashboard, lawyer dashboard, admin/compliance reviewer.

---

## 3. Routes (MVP)

```
/legal                                  hub
/legal/wizard                           multi-step eligibility wizard
/legal/result/[resultId]                saved wizard result (shareable)
/legal/state/[state]                    state guide (KA, MH, TN, AP, KL)
/legal/checklist                        document checklist tool
/legal/due-diligence                    10-step DD guide
/legal/lawyers                          mock lawyer directory
/legal/services                         service packages (mock pricing, no payment)
/legal/articles                         article index
/legal/articles/[slug]                  individual article
/legal/talk-to-lawyer                   global lead capture form
/eligibility                            301 redirect to /legal
```

Defer: `/legal/document-verification` (Phase 2), `/legal/lawyers/[id]` profile (Phase 2), `/legal/dashboard` internal (Phase 3).

---

## 4. MVP scope checklist

Each item is what Claude Code must deliver:

- [ ] `/legal` hub page (hero, three entry CTAs: Eligibility / Documents / Talk to Lawyer; trust badges; state grid; article previews; service preview)
- [ ] Multi-step wizard at `/legal/wizard` with state, district, citizenship, farmer status, entity type, land type, purpose
- [ ] Wizard result screen: verdict badge (green/amber/red/grey) + confidence score + risk score + state references + lawyer-consultation CTA + lead capture form + shareable result URL
- [ ] 5 state guide pages with structured content (KA + MH populated, TN + AP + KL stubbed as "PENDING LAWYER REVIEW")
- [ ] Document checklist tool (`/legal/checklist`) — pick state + land type, get personalized checklist
- [ ] Due diligence guided workflow (`/legal/due-diligence`) — 10 steps with explanations, progress tracking for logged-in users
- [ ] Mock lawyer directory (`/legal/lawyers`) — 6–10 mock profiles, "Contact" CTA leads to lead-capture form
- [ ] Service packages page (`/legal/services`) — 8 mock service cards with mock pricing, "Get started" → lead-capture
- [ ] 10 FAQ articles (titles below, content marked PENDING LAWYER REVIEW)
- [ ] Lead-capture flow with consent + UTM tracking, writes to `legal_inquiries` table
- [ ] SEO: per-page metadata, schema.org markup, sitemap inclusion
- [ ] Analytics events (PostHog) on every meaningful interaction
- [ ] Disclaimer footer on every result/article/state page (reused component)
- [ ] Mobile-first; works on a 360px-wide screen
- [ ] Auth-aware: logged-in users get progress saved; non-logged-in users can still use everything except progress save
- [ ] `/eligibility` 301 redirects to `/legal`

---

## 5. Database schema (run in Supabase SQL editor)

```sql
-- Curated state legal data. Lawyer-reviewed content only.
create table legal_state_rules (
  state text primary key,
  state_label text not null,                -- "Karnataka"
  data jsonb not null,                       -- see schema below
  reviewed_by text,                          -- lawyer name + bar reg
  reviewed_at timestamptz,
  published boolean not null default false,  -- never show unpublished content
  updated_at timestamptz default now()
);

-- Eligibility wizard answers + result
create table legal_eligibility_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  state text not null,
  answers jsonb not null,                    -- raw wizard answers
  verdict text not null,                     -- 'likely_eligible' | 'with_conditions' | 'needs_approval' | 'high_risk' | 'insufficient_info'
  confidence integer not null check (confidence between 0 and 100),
  risk_score integer not null check (risk_score between 0 and 100),
  rationale jsonb not null,                  -- which rules fired and why
  references_list jsonb,                     -- legal references shown
  next_steps jsonb,                          -- recommended actions
  created_at timestamptz default now()
);
create index on legal_eligibility_results (user_id);
create index on legal_eligibility_results (state, verdict);

-- Articles for FAQ and programmatic SEO
create table legal_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  body_md text not null,
  state text,                                -- nullable: pan-India articles too
  topic text not null,                       -- 'nri' | 'conversion' | 'document' | 'rtc' | 'mutation' | etc.
  land_types text[],                          -- which land types this applies to
  reading_minutes integer default 5,
  reviewed_by text,
  reviewed_at timestamptz,
  published boolean not null default false,
  seo_title text,
  seo_description text,
  schema_data jsonb,                          -- schema.org JSON-LD
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on legal_articles (state, topic);
create index on legal_articles (published, updated_at desc);

-- Mock lawyer directory (becomes real in Phase 2)
create table lawyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  bar_reg_placeholder text,                  -- not validated in MVP
  state text not null,
  districts text[],
  languages text[] not null,
  practice_areas text[] not null,
  experience_years integer,
  specializations text[],                    -- 'agri' | 'nri' | 'conversion' | 'document_review' | etc.
  consultation_modes text[],                 -- 'phone' | 'video' | 'in_person'
  consultation_fee_placeholder integer,      -- in rupees; not real pricing
  verification_badge text,                   -- 'pending' | 'verified' (mock data: 'verified')
  rating_placeholder numeric,                -- not real ratings
  bio text,
  is_mock boolean not null default true,     -- flag mock data clearly
  published boolean not null default true,
  created_at timestamptz default now()
);

-- Service packages (mock pricing in MVP)
create table legal_services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  included_items text[] not null,
  target_users text[] not null,              -- 'buyer' | 'nri' | 'agent' | 'seller'
  required_documents text[],
  turnaround_days_min integer,
  turnaround_days_max integer,
  starting_price_placeholder integer,        -- in rupees; not real pricing
  display_order integer default 0,
  published boolean not null default true,
  created_at timestamptz default now()
);

-- Lead capture
create table legal_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  whatsapp text,
  email text,
  state text,
  district text,
  land_type text,
  buyer_type text,
  budget_range text,
  legal_concern text,
  related_result_id uuid references legal_eligibility_results(id),
  related_service_slug text,
  related_lawyer_id uuid references lawyers(id),
  source_page text,                          -- '/legal/result/...', '/legal/services', etc.
  utm_source text, utm_medium text, utm_campaign text,
  consent_given boolean not null default false,
  consent_timestamp timestamptz,
  status text not null default 'new',        -- 'new' | 'contacted' | 'routed' | 'closed'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on legal_inquiries (status, created_at desc);
create index on legal_inquiries (user_id);

-- Per-user due-diligence progress
create table legal_dd_progress (
  user_id uuid references auth.users(id) on delete cascade,
  scope_id text,                             -- 'standalone' or a listing_id
  step_id text not null,                     -- 'verify_ownership', 'verify_title_chain', etc.
  completed boolean not null default false,
  completed_at timestamptz,
  notes text,
  primary key (user_id, scope_id, step_id)
);

-- RLS: legal_inquiries is the only sensitive table. Read via supabaseAdmin (server) only.
alter table legal_inquiries enable row level security;
create policy "insert legal inquiries" on legal_inquiries for insert with check (true);
-- No public select policy: only the server (service-role) reads inquiries.

alter table legal_eligibility_results enable row level security;
create policy "anyone insert results" on legal_eligibility_results for insert with check (true);
create policy "owner read own results" on legal_eligibility_results for select using (auth.uid() = user_id or user_id is null);

alter table legal_dd_progress enable row level security;
create policy "user manages own dd progress" on legal_dd_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public-readable tables (no PII)
alter table legal_state_rules enable row level security;
create policy "public read published states" on legal_state_rules for select using (published = true);
alter table legal_articles enable row level security;
create policy "public read published articles" on legal_articles for select using (published = true);
alter table lawyers enable row level security;
create policy "public read published lawyers" on lawyers for select using (published = true);
alter table legal_services enable row level security;
create policy "public read published services" on legal_services for select using (published = true);
```

---

## 6. TypeScript types

```typescript
// app/lib/legal/types.ts

export type LandType =
  | 'agri' | 'agri_dry' | 'agri_irrigated' | 'plantation' | 'orchard'
  | 'farmhouse' | 'farm_plot' | 'gated_farm' | 'na_converted'
  | 'developed_rural' | 'estate' | 'commercial_rural'
  | 'solar_suitable' | 'warehouse_suitable' | 'eco_tourism';

export type BuyerType =
  | 'farmer_resident' | 'non_farmer_resident' | 'nri' | 'oci'
  | 'company' | 'llp' | 'partnership' | 'trust' | 'huf'
  | 'developer' | 'institutional';

export type Verdict =
  | 'likely_eligible' | 'with_conditions' | 'needs_approval'
  | 'high_risk' | 'insufficient_info';

export type EligibilityAnswers = {
  state: string;
  district?: string;
  taluk?: string;
  village?: string;
  citizenship: 'indian' | 'nri' | 'oci' | 'foreign';
  resident_status: 'resident' | 'non_resident';
  buyer_type: BuyerType;
  farmer_status: 'farmer' | 'non_farmer' | 'inherited_farmer';
  existing_agri_land: boolean;
  land_type: LandType;
  purpose: 'farming' | 'farmhouse' | 'investment' | 'plantation' | 'resort' | 'solar' | 'other';
  budget_range?: '0_25L' | '25_50L' | '50L_1Cr' | '1Cr_5Cr' | '5Cr_plus';
  timeline?: 'within_month' | '1_3_months' | '3_6_months' | '6_plus' | 'just_exploring';
  documents_available?: boolean;
};

export type EligibilityResult = {
  verdict: Verdict;
  confidence: number;       // 0-100
  risk_score: number;       // 0-100, higher = riskier
  headline: string;         // user-facing one-liner
  rationale: Array<{ rule_id: string; reason: string; severity: 'info' | 'warning' | 'block' }>;
  references: Array<{ label: string; url?: string; section?: string }>;
  next_steps: Array<{ id: string; label: string; cta_type: 'lawyer' | 'doc_check' | 'service' | 'article'; cta_target?: string }>;
  needs_lawyer_review: boolean;
};

export type JurisdictionRule = {
  state: string;
  state_label: string;
  data: {
    agri_purchase: { allowed_for: BuyerType[]; restricted_for: BuyerType[]; conditions: string[] };
    nri_rules: { can_purchase_agri: boolean; can_inherit: boolean; restrictions: string[] };
    company_rules: { can_purchase_agri: boolean; conditions: string[] };
    ceiling_limit_acres?: number;
    conversion_required_for: LandType[];
    farmer_status_requirement: 'strict' | 'lenient' | 'none';
    farmhouse_rules: string[];
    common_documents: string[];
    common_risks: string[];
    references: Array<{ label: string; url?: string }>;
  };
  reviewed_by?: string;
  reviewed_at?: string;
  published: boolean;
};

export type RiskCategory =
  | 'buyer_eligibility' | 'ownership' | 'title_chain' | 'encumbrance'
  | 'mutation' | 'survey' | 'litigation' | 'access' | 'conversion_zoning'
  | 'family_co_owner' | 'possession' | 'agent_credibility';

export type RiskScore = {
  overall: number;            // 0-100
  level: 'low' | 'medium' | 'high' | 'needs_lawyer' | 'insufficient_data';
  categories: Record<RiskCategory, { score: number; reason: string }>;
  data_confidence: number;
  missing_data: string[];
};
```

---

## 7. Component hierarchy

```
app/legal/
  page.tsx                     — hub (server)
  layout.tsx                   — shared layout: includes <LegalDisclaimerFooter />
  wizard/
    page.tsx                   — wizard shell (client)
    Wizard.tsx                 — step orchestrator
    steps/
      StateStep.tsx
      CitizenshipStep.tsx
      BuyerTypeStep.tsx
      LandTypeStep.tsx
      PurposeStep.tsx
      DetailsStep.tsx          — district, taluk, budget, timeline
      ReviewStep.tsx            — summary before submit
    ResultScreen.tsx            — verdict, risk, references, CTAs
  result/[id]/page.tsx          — shareable saved result (server)
  state/[state]/page.tsx        — state guide (server, static generation)
  checklist/page.tsx            — document checklist tool
  due-diligence/
    page.tsx                    — 10-step DD guide
    StepCard.tsx                — individual step with mark-complete
  lawyers/page.tsx              — mock directory grid (server)
  services/page.tsx             — service package cards (server)
  articles/
    page.tsx                    — article index
    [slug]/page.tsx             — individual article (server, generateStaticParams)
  talk-to-lawyer/page.tsx       — lead capture page (client)

app/components/legal/
  HeroSection.tsx
  VerdictBadge.tsx              — green/amber/red/grey
  RiskMeter.tsx                 — visual 0-100 with category breakdown
  ConfidenceBadge.tsx
  WizardProgress.tsx
  StateSelector.tsx             — reusable
  LandTypeSelector.tsx
  BuyerTypeSelector.tsx
  LegalDisclaimer.tsx           — inline disclaimer block
  LegalDisclaimerFooter.tsx     — page-bottom disclaimer
  LawyerCTA.tsx                 — standardized "Talk to a verified lawyer" CTA
  LawyerCard.tsx
  ServiceCard.tsx
  ArticleCard.tsx
  ChecklistItem.tsx
  LeadCaptureForm.tsx           — reusable, takes a "source" prop
  LeadCaptureModal.tsx          — popup variant
  TrustBadgesRow.tsx
  StateGuideContent.tsx         — renders content from legal_state_rules.data
  ResultShareButtons.tsx        — copy-link + WhatsApp share

app/lib/legal/
  types.ts                      — (above)
  eligibilityEngine.ts          — given answers + state rules, returns EligibilityResult
  riskScore.ts                  — computes RiskScore
  copy.ts                       — disclaimer text, verdict labels, etc.
  stateRules.ts                 — loads from legal_state_rules table; cache server-side
```

---

## 8. Eligibility engine logic (server-side, pure function)

```typescript
// app/lib/legal/eligibilityEngine.ts (sketch)

export function computeEligibility(
  answers: EligibilityAnswers,
  rule: JurisdictionRule
): EligibilityResult {
  const rationale: EligibilityResult['rationale'] = [];
  let needsLawyer = false;
  let blocks = 0;
  let warnings = 0;

  // Rule 1: NRI/OCI buying agricultural land
  if ((answers.citizenship === 'nri' || answers.citizenship === 'oci') &&
      ['agri', 'agri_dry', 'agri_irrigated', 'plantation', 'orchard'].includes(answers.land_type)) {
    if (!rule.data.nri_rules.can_purchase_agri) {
      rationale.push({
        rule_id: 'nri_no_agri',
        reason: `NRI/OCI cannot purchase agricultural land in ${rule.state_label} (RBI/FEMA rules).`,
        severity: 'block',
      });
      blocks++;
    } else {
      rationale.push({
        rule_id: 'nri_conditional_agri',
        reason: 'NRI/OCI purchase may be possible with RBI approval. Verify with a lawyer.',
        severity: 'warning',
      });
      warnings++;
      needsLawyer = true;
    }
  }

  // Rule 2: Non-farmer resident buying agricultural land
  if (answers.buyer_type === 'non_farmer_resident' &&
      ['agri', 'agri_dry', 'agri_irrigated'].includes(answers.land_type)) {
    if (rule.data.farmer_status_requirement === 'strict') {
      rationale.push({
        rule_id: 'farmer_status_required',
        reason: `${rule.state_label} requires farmer status to purchase agricultural land directly.`,
        severity: 'block',
      });
      blocks++;
    } else if (rule.data.farmer_status_requirement === 'lenient') {
      rationale.push({
        rule_id: 'farmer_status_conditional',
        reason: 'Purchase may be allowed under specific conditions or with permission.',
        severity: 'warning',
      });
      warnings++;
      needsLawyer = true;
    }
  }

  // Rule 3: Company/LLP/Trust buying agricultural land
  if (['company', 'llp', 'trust', 'partnership'].includes(answers.buyer_type) &&
      ['agri', 'agri_dry', 'agri_irrigated'].includes(answers.land_type)) {
    if (!rule.data.company_rules.can_purchase_agri) {
      rationale.push({
        rule_id: 'company_no_agri',
        reason: `Companies/LLPs/trusts generally cannot purchase agricultural land in ${rule.state_label}.`,
        severity: 'block',
      });
      blocks++;
    }
  }

  // Rule 4: Conversion required
  if (rule.data.conversion_required_for.includes(answers.land_type) &&
      ['investment', 'resort', 'solar'].includes(answers.purpose)) {
    rationale.push({
      rule_id: 'conversion_required',
      reason: 'Land conversion (NA permission) typically required for this intended use.',
      severity: 'warning',
    });
    warnings++;
  }

  // Compute verdict
  let verdict: Verdict;
  if (blocks > 0) verdict = 'high_risk';
  else if (warnings >= 2) verdict = 'needs_approval';
  else if (warnings === 1) verdict = 'with_conditions';
  else verdict = 'likely_eligible';

  // If lots of empty optional answers, lower confidence
  const confidence = computeConfidence(answers, rule);
  if (confidence < 40) verdict = 'insufficient_info';

  const risk_score = computeRiskScore(rationale, confidence);

  return {
    verdict,
    confidence,
    risk_score,
    headline: generateHeadline(verdict, rule.state_label, answers),
    rationale,
    references: rule.data.references,
    next_steps: generateNextSteps(verdict, needsLawyer, answers),
    needs_lawyer_review: needsLawyer || verdict !== 'likely_eligible',
  };
}
```

**Conservative principle:** when in doubt, downgrade the verdict and recommend lawyer review. Always include lawyer-consultation CTA on every non-`likely_eligible` result, and a softer "have a lawyer verify documents" CTA on `likely_eligible` too.

---

## 9. Risk score (visual; rule-based, not ML)

For MVP, compute from the same rationale + answers:

```
overall = 100 - (blocks * 30 + warnings * 15 + (100 - confidence) * 0.2)
clamp 0–100

level:
  >= 75: 'low'
  50–74: 'medium'
  25–49: 'high'
  < 25:  'needs_lawyer'

Per-category scores in MVP can be derived simply:
  buyer_eligibility:    based on citizenship/buyer_type rules
  ownership:            unknown without docs → 50 (medium)
  title_chain:          unknown → 50
  encumbrance:          unknown → 50
  mutation:             unknown → 50
  survey:               unknown → 50
  litigation:           unknown → 50
  access:               unknown → 50
  conversion_zoning:    derived from rule fired
  ...
```

Show overall risk as a colored arc + "Why this score" expandable list of categories. The honest framing: "We can only estimate risk from your answers; document review will refine this."

---

## 10. Example state data — Karnataka (curated, ready to seed)

```json
{
  "state": "karnataka",
  "state_label": "Karnataka",
  "data": {
    "agri_purchase": {
      "allowed_for": ["farmer_resident", "inherited_farmer", "non_farmer_resident"],
      "restricted_for": ["company", "llp", "trust", "partnership"],
      "conditions": [
        "Since 2020 amendment to Karnataka Land Reforms Act, non-farmers can purchase agricultural land in Karnataka.",
        "Income limits have been removed.",
        "Land ceiling rules still apply (54 acres for individual / 108 acres for joint family — verify current limits)."
      ]
    },
    "nri_rules": {
      "can_purchase_agri": false,
      "can_inherit": true,
      "restrictions": [
        "Per RBI/FEMA, NRIs cannot directly purchase agricultural land, plantation, or farmhouse land.",
        "NRIs can inherit agricultural land from resident relatives.",
        "Purchase of converted (NA) land is permitted."
      ]
    },
    "company_rules": {
      "can_purchase_agri": false,
      "conditions": [
        "Companies/LLPs generally cannot own agricultural land in Karnataka without specific government permission.",
        "Permitted use cases (e.g., agro-industrial, solar) require explicit state government approval under specific statutes."
      ]
    },
    "ceiling_limit_acres": 54,
    "conversion_required_for": ["agri", "agri_dry", "agri_irrigated"],
    "farmer_status_requirement": "none",
    "farmhouse_rules": [
      "Farmhouse construction on agricultural land requires up to 10% built-up area limit (verify current rules).",
      "Land must remain primarily agricultural in classification."
    ],
    "common_documents": [
      "RTC (Pahani)",
      "Mutation Register (MR)",
      "Encumbrance Certificate (EC, Form 15)",
      "Tippan / Akarband / FMB",
      "Sale Deed (mother deed + current)",
      "Khata extract",
      "Conversion order (if NA)",
      "Tax receipts (land revenue)",
      "Survey sketch",
      "Form 10 (family tree, where inheritance applies)"
    ],
    "common_risks": [
      "Mutation pending or incorrect in seller's name",
      "Encroachments not reflected in records",
      "Joint ownership / family co-owner disputes",
      "Outstanding loans (encumbrance)",
      "Pending litigation"
    ],
    "references": [
      { "label": "Karnataka Land Reforms Act, 1961 (amended 2020)" },
      { "label": "Karnataka Bhoomi land records portal", "url": "https://landrecords.karnataka.gov.in/" },
      { "label": "RBI FEMA Regulations (NRI/OCI land ownership)" }
    ]
  },
  "reviewed_by": "PENDING_LAWYER_REVIEW",
  "reviewed_at": null,
  "published": false
}
```

**Karnataka and Maharashtra get this level of structured data in MVP. Tamil Nadu, Andhra Pradesh, Kerala start as `published: false` with placeholder content, marked "PENDING_LAWYER_REVIEW" — never published live without lawyer sign-off.**

---

## 11. FAQ articles — MVP titles (content to be lawyer-reviewed before publishing)

1. Can NRIs buy agricultural land in India?
2. Can a non-farmer buy agricultural land in Karnataka?
3. Can a company own agricultural land in India?
4. What is RTC (Pahani) and how to verify it?
5. What is mutation and why does it matter?
6. What is an Encumbrance Certificate (EC) and how to check it?
7. Document checklist for buying agricultural land
8. Document checklist for buying a farmhouse
9. What is land conversion (NA) and when is it required?
10. How to verify land ownership before buying

Each article has: title, summary, 600–1200 words body, state tag (where applicable), topic tag, FAQ schema.org markup, "Talk to a lawyer" CTA at end. Mark all as `published: false` until lawyer-reviewed.

---

## 12. SEO architecture (MVP-relevant)

- Per-page `generateMetadata` with unique title, description, OG, canonical
- Schema.org JSON-LD: `LegalService` (hub), `FAQPage` (articles where appropriate), `Article` (articles), `BreadcrumbList` (everywhere)
- Sitemap extends existing `sitemap.ts` to enumerate all published state pages + articles dynamically
- Internal linking: every article links to its state page and at least one related article; state pages link to relevant articles
- Robots: allow indexing for `/legal/**`; disallow `/legal/result/*` (results are personal)

Phase 2: programmatic `/legal/state/[state]/[topic]` pages built from cross-product of state × topic, generating hundreds of indexed pages.

---

## 13. Analytics events (PostHog naming)

```
legal_hub_viewed                  { source, utm }
legal_wizard_started               { state, source }
legal_wizard_step_completed        { step_id, step_index, state }
legal_wizard_abandoned             { last_step }
legal_wizard_completed             { state, verdict, risk_score, confidence }
legal_result_shared                { result_id, method }
legal_state_page_viewed            { state }
legal_article_viewed               { slug, state, topic, reading_minutes }
legal_checklist_generated          { state, land_type, buyer_type }
legal_dd_step_completed            { step_id, scope_id }
legal_lawyer_card_clicked          { lawyer_id }
legal_service_card_clicked         { service_slug }
legal_lead_captured                { source_page, state, concern_category, has_email }
legal_lawyer_cta_clicked           { context, state }
legal_disclaimer_expanded          { page }
```

---

## 14. Disclaimer templates (reuse these, lawyer-reviewed before final)

**Footer disclaimer (every `/legal/**` page):**
> *Bhumi provides informational guidance on land laws and document requirements. We are not a law firm and do not provide legal advice. Information on this page is general in nature and may not apply to your specific situation. For decisions involving land purchase, ownership, or any legal action, consult a verified advocate.*

**Wizard result disclaimer (above and below result):**
> *This eligibility result is generated from the information you provided and our curated database of state land laws. It is informational only and not a legal opinion. Land laws change frequently. Before any purchase decision, please consult a verified land lawyer.*

**AI/automated content marker (where applicable):**
> *This response was generated using AI. While we curate our legal knowledge base carefully, AI-generated answers may be incomplete or outdated. We recommend lawyer review for any consequential decision.*

---

## 15. Implementation roadmap (3 weeks)

**Week 1 — foundation**
- Database tables (SQL above)
- Routes, layout, hub page
- Reusable components (HeroSection, VerdictBadge, LegalDisclaimer*, LawyerCTA, LeadCaptureForm, RiskMeter, TrustBadgesRow)
- Wizard skeleton with stepper + state, land type, buyer type, citizenship, purpose steps
- Eligibility engine with rules for KA + MH (4–6 starter rules)
- Result screen with verdict + risk + CTAs
- Disclaimer footer + content marker

**Week 2 — content & supporting pages**
- State guide pages (KA + MH populated; TN, AP, KL placeholder)
- Document checklist tool
- Due-diligence guided workflow
- Article system + 10 FAQ stubs (titles set, body placeholder)
- Mock lawyer directory with 8 mock profiles
- Service packages with 8 service cards
- Lead capture flow + Supabase writes
- 301 from `/eligibility`

**Week 3 — polish & ship**
- SEO metadata on every page
- Sitemap extension
- Schema.org markup
- Analytics events wired
- Mobile-first audit and fixes
- Accessibility audit
- Lawyer-content review handoff (parallel — start in Week 1, not blocking Week 3)
- Soft launch behind same URL

**Out of scope for the 3-week MVP:** AI chatbot, document upload, payments, real lawyer marketplace, internal legal ops dashboard, risk analyzer ML, multi-language, programmatic SEO pages beyond state guides.

---

## 16. Claude Code build prompts (paste into Claude Code in order)

### Prompt 1 — Database + types

```
Read docs/legal-navigator-spec.md. Implement the database schema from
section 5: create the SQL migration in supabase/migrations/ (or output
the SQL for me to run in the Supabase SQL editor). Then create
app/lib/legal/types.ts with the TypeScript types from section 6.
Don't build any pages yet. Show me the migration SQL before running.
```

### Prompt 2 — Foundation routes & shared components

```
Build the /legal route foundation per docs/legal-navigator-spec.md:
- app/legal/layout.tsx with the shared layout and disclaimer footer
- app/legal/page.tsx hub page with hero, three CTAs (Eligibility,
  Documents, Talk to Lawyer), trust badges, state grid (5 states),
  article previews, service packages preview
- All reusable components from section 7 under app/components/legal/:
  HeroSection, VerdictBadge, RiskMeter, ConfidenceBadge, WizardProgress,
  StateSelector, LandTypeSelector, BuyerTypeSelector, LegalDisclaimer,
  LegalDisclaimerFooter, LawyerCTA, LawyerCard, ServiceCard, ArticleCard,
  ChecklistItem, LeadCaptureForm, LeadCaptureModal, TrustBadgesRow,
  StateGuideContent
- 301 redirect from /eligibility to /legal
Mobile-first throughout. Reuse the existing earthy design tokens.
Show me a plan before writing code.
```

### Prompt 3 — Eligibility wizard + engine

```
Implement the eligibility wizard and engine per spec sections 7 & 8:
- app/legal/wizard/page.tsx + Wizard.tsx orchestrator
- Each step component under app/legal/wizard/steps/
- app/lib/legal/eligibilityEngine.ts: pure function computeEligibility()
  with rules for Karnataka and Maharashtra (use the JSON in section 10
  as Karnataka seed data; create equivalent for Maharashtra based on
  the spec's structure — flag any Maharashtra-specific gaps for lawyer
  review)
- ResultScreen.tsx showing verdict badge, risk meter, rationale list,
  references, next-step CTAs, lead capture form
- Save result to legal_eligibility_results table, generate shareable URL
- app/legal/result/[id]/page.tsx for the saved/shared result
Apply the conservative-verdict principle: when in doubt, downgrade and
recommend lawyer review.
Show me the engine implementation and the Karnataka/Maharashtra rules
before wiring the UI.
```

### Prompt 4 — Supporting pages

```
Build the remaining MVP pages per docs/legal-navigator-spec.md:
- app/legal/state/[state]/page.tsx — state guide, reads from
  legal_state_rules; renders content via StateGuideContent component.
  Use generateStaticParams for SSG.
- app/legal/checklist/page.tsx — pick state + land type → personalized
  document checklist drawn from legal_state_rules.data.common_documents
- app/legal/due-diligence/page.tsx — 10-step DD guide with per-step
  expand/collapse, mark-complete (writes to legal_dd_progress for
  logged-in users), progress bar
- app/legal/lawyers/page.tsx — mock lawyer grid using 8 seeded mock
  lawyer rows (create the seed data; flag is_mock=true)
- app/legal/services/page.tsx — 8 service cards using seeded data
- app/legal/articles/page.tsx + [slug]/page.tsx — article index +
  detail. Seed 10 FAQ articles from section 11 with body marked
  "PENDING LAWYER REVIEW".
- app/legal/talk-to-lawyer/page.tsx — global lead capture
Apply published=false to every article and state until lawyer-reviewed;
do not render unpublished content on the live site.
Show me the seed data scripts first.
```

### Prompt 5 — SEO + analytics + ship

```
Final pass per docs/legal-navigator-spec.md sections 12 & 13:
- Add per-page generateMetadata for every /legal/** page (unique title,
  description, OG, canonical)
- Add schema.org JSON-LD: LegalService on hub, Article + FAQPage on
  article pages, BreadcrumbList everywhere
- Extend app/sitemap.ts to include published state pages and articles
  dynamically from Supabase
- Add robots disallow for /legal/result/*
- Wire all PostHog events from section 13 — exact event names and
  property names as specified
- Mobile audit: every page works on 360px width
- Run the build, fix any TypeScript or lint errors
- Commit but don't push yet — I'll verify locally first
```

---

## 17. What's deferred (Phase 2/3 — explicit)

**Phase 2 (Month 2–4):**
- Real lawyer onboarding flow + KYC verification
- Lawyer profile pages with real reviews
- In-app consultation booking with calendar integration
- Document upload + AI extraction (Claude vision API)
- Document review case workflow (lead → ops triage → lawyer assignment)
- Internal legal ops dashboard
- Email/WhatsApp lead routing automation
- Payment integration for service packages
- State expansion: TN, AP, KL get full content; add Telangana, Goa, Gujarat
- Programmatic SEO pages at `/legal/state/[state]/[topic]` (cross-product)

**Phase 3 (Month 4+):**
- AI legal chatbot with RAG over curated knowledge base + state rules
- Strong "this is not legal advice" guardrails + mandatory lawyer-escalation CTA on every AI response
- Real risk analyzer (ML model trained on review outcomes)
- Lawyer dashboard (cases assigned, pipeline, earnings)
- Multi-language (Hindi + Kannada first; others extensible)
- Property listings show inline legal risk score
- Due diligence pre-bundled with listing purchases
- API for verified-developer partners

**Things you should never build:**
- AI confidently telling users "yes you can definitely buy this land" (regulatory + liability nightmare)
- Document upload without a lawyer-review backstop
- Lawyer marketplace without a real lawyer reviewing your business model (BCI/referral fee rules)

---

## 18. Non-code work that runs in parallel (start Week 1)

The code is the easy 30%. The remaining 70% is:

1. **Recruit 1–2 land lawyers** in Karnataka and Maharashtra. LinkedIn, bar association referrals, your network. Hire for content review at ₹50k–₹1L for the initial 5-state knowledge base.
2. **Get the disclaimer reviewed** by a real lawyer (could be the same lawyers). Wording matters for liability.
3. **Decide your business model with lawyers** before Phase 2: referral fees vs. commission vs. subscription — each has BCI implications.
4. **Establish content-review SLA**: every state rule update, every new article, requires `reviewed_by` and `reviewed_at` populated. Don't publish without it. This is the single most important governance rule.

Code without lawyer-reviewed content is a styled FAQ page. Lawyer-reviewed content turns it into a real legal-tech product.
