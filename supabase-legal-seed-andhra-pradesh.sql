-- ============================================================================
-- AcreHub — Land Legal Navigator  ·  Andhra Pradesh seed
-- Source: docs/andhra-pradesh-agricultural-land-legal-rules.md (MeeBhoomi,
-- India Code AP, MEA FEMA guidance, PRS, and 2025 NALA policy reporting).
-- Run AFTER supabase-legal-navigator.sql. Safe to re-run (UPSERT).
-- ----------------------------------------------------------------------------
-- GOVERNANCE: seeded as a DRAFT (published = false). Confirm with your advocate,
-- then publish:
--
--   update public.legal_state_rules
--     set published = true, reviewed_by = 'Adv. <name>, Bar #<reg>', reviewed_at = now()
--     where state = 'andhra_pradesh';
--
--   update public.legal_articles
--     set published = true, reviewed_by = 'Adv. <name>', reviewed_at = now()
--     where slug in (
--       'can-a-non-farmer-buy-agricultural-land-in-andhra-pradesh',
--       'what-is-adangal-and-ror-1b-in-andhra-pradesh',
--       'assigned-and-dkt-land-risk-in-andhra-pradesh'
--     );
--
-- NOTE: Andhra Pradesh land-use conversion (NALA) rules were under active change
-- in 2025. Re-verify the current Government Order before publishing conversion text.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STATE RULE (draft)
-- ---------------------------------------------------------------------------
insert into public.legal_state_rules (state, state_label, data, reviewed_by, reviewed_at, published)
values
('andhra_pradesh', 'Andhra Pradesh', '{
  "agri_purchase": {
    "allowed_for": ["farmer_resident", "non_farmer_resident", "inherited_farmer"],
    "restricted_for": ["company", "llp", "trust", "partnership", "nri", "oci"],
    "conditions": [
      "Andhra Pradesh is generally treated as relatively open for Indian resident individuals — including non-farmers — buying ordinary private agricultural land.",
      "Eligibility is only the first layer: title, Adangal, ROR-1B, LP Map/FMB, mutation, Encumbrance Certificate, land classification, ceiling exposure, access and possession must all be verified.",
      "Screen for assigned / DKT, government / poramboke, dotted, ceiling-surplus and Scheduled Area / tribal land — these carry transfer restrictions or resumption risk and need lawyer review.",
      "Land-use conversion rules have been changing (the state moved to repeal/simplify the NALA framework in 2025); verify the latest Government Order and local-body process before relying on any non-agricultural use."
    ]
  },
  "nri_rules": {
    "can_purchase_agri": false,
    "can_inherit": true,
    "restrictions": [
      "Under FEMA/MEA guidance, NRIs and PIOs do not have general permission to purchase agricultural land, plantation property, or farmhouse property in India.",
      "An NRI/PIO may inherit such property, but transfer is restricted (generally only to Indian citizens permanently residing in India).",
      "Converted (non-agricultural) land is treated differently; obtain a FEMA plus Andhra Pradesh land-law review."
    ]
  },
  "company_rules": {
    "can_purchase_agri": false,
    "conditions": [
      "Company, LLP, trust, developer and institutional purchases need review for permitted use, ceiling exposure, land-use conversion, planning approvals, assigned/DKT and Scheduled Area restrictions, and FEMA where foreign investment exists.",
      "Request a corporate / institutional land purchase review before signing an agreement or paying token advance."
    ]
  },
  "conversion_required_for": ["agri", "agri_dry", "agri_irrigated"],
  "farmer_status_requirement": "none",
  "farmhouse_rules": [
    "Farmhouse, farm-plot and plotted development need land-use conversion plus layout / planning-authority or local-body approval, with legal road access and common-area handover.",
    "Confirm the current Andhra Pradesh conversion process and development permission before relying on any non-agricultural use.",
    "Watch for irrigation / tank-bed / canal, coastal, forest and Scheduled Area restrictions."
  ],
  "common_documents": [
    "Latest sale deed",
    "Parent document / mother deed and link documents",
    "Adangal",
    "ROR-1B (1-B extract)",
    "Pattadar passbook / title deed (where available)",
    "Mutation records",
    "LP Map / FMB / survey sketch",
    "Encumbrance Certificate",
    "Tax / land-revenue receipts",
    "Assignment / DKT or freehold-regularisation records (if applicable)",
    "Conversion order or current conversion approval (if non-agricultural use)",
    "Layout / planning-authority approval (if plotted)",
    "Legal heir / partition documents (if inherited)"
  ],
  "common_risks": [
    "Assigned / DKT land with transfer conditions or resumption risk",
    "Government / poramboke land wrongly listed as private",
    "Dotted land with uncertain or missing ownership entries",
    "Scheduled Area / tribal land (specialist review required)",
    "Ceiling-surplus / land-reform-sensitive land",
    "Adangal or ROR-1B extent mismatch with the sale deed",
    "Survey-number or boundary mismatch; missing LP Map / FMB",
    "Power-of-Attorney sale without valid scope or registration",
    "Inherited land sold without partition or co-owner consent",
    "Farm plot without conversion / layout approval; conversion status unclear",
    "Tank-bed / water-body / irrigation-command land"
  ],
  "references": [
    { "label": "MeeBhoomi (Andhra Pradesh land records: Adangal, ROR-1B, LP Maps)", "url": "https://meebhoomi.ap.gov.in/" },
    { "label": "India Code: Andhra Pradesh State Acts repository", "url": "https://www.indiacode.nic.in/handle/123456789/2486/" },
    { "label": "MEA guidance on acquisition and transfer of immovable property in India", "url": "https://www.mea.gov.in/images/pdf/acquisition-and-transfer-of-immovable-property-in-india.pdf" },
    { "label": "PRS: Land Records and Titles in India", "url": "https://prsindia.org/policy/analytical-reports/land-records-and-titles-india" },
    { "label": "Andhra Pradesh NALA repeal / land-conversion policy update (2025)", "url": "https://timesofindia.indiatimes.com/city/vijayawada/andhra-pradesh-moves-to-repeal-nALA-act-plans-seamless-land-conversion/articleshow/121785298.cms" }
  ]
}'::jsonb, 'PENDING_LAWYER_REVIEW', null, false)
on conflict (state) do update set
  state_label = excluded.state_label,
  data = excluded.data,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- ANDHRA PRADESH MOCK LAWYERS (samples; published)
-- ---------------------------------------------------------------------------
insert into public.lawyers (id, name, state, districts, languages, practice_areas, experience_years, specializations, consultation_modes, consultation_fee_placeholder, verification_badge, rating_placeholder, bio, is_mock, published)
values
('00000000-0000-4000-8000-0000000000eb', 'Adv. Sai Krishna Reddy', 'andhra_pradesh', '{Vijayawada,Guntur}', '{Telugu,English}', '{Agricultural land,Title verification}', 14, '{agri,document_review}', '{phone,video,in_person}', 1800, 'verified', 4.6, 'Sample profile. Title-chain and revenue-record verification across coastal Andhra.', true, true),
('00000000-0000-4000-8000-0000000000ec', 'Adv. Padma Latha', 'andhra_pradesh', '{Visakhapatnam,East Godavari}', '{Telugu,Hindi,English}', '{Assigned land,Conversion}', 11, '{document_review,conversion}', '{phone,video}', 2000, 'verified', 4.5, 'Sample profile. Assigned/DKT and dotted-land risk review, land-use conversion.', true, true)
on conflict (id) do update set
  name = excluded.name, state = excluded.state, districts = excluded.districts,
  languages = excluded.languages, practice_areas = excluded.practice_areas,
  experience_years = excluded.experience_years, specializations = excluded.specializations,
  consultation_modes = excluded.consultation_modes,
  consultation_fee_placeholder = excluded.consultation_fee_placeholder,
  verification_badge = excluded.verification_badge, rating_placeholder = excluded.rating_placeholder,
  bio = excluded.bio, is_mock = excluded.is_mock, published = excluded.published;

-- ---------------------------------------------------------------------------
-- ANDHRA PRADESH FAQ ARTICLES (drafts; bodies drawn from the source doc)
-- ---------------------------------------------------------------------------
insert into public.legal_articles (slug, title, summary, body_md, state, topic, land_types, reading_minutes, reviewed_by, reviewed_at, published, seo_title, seo_description)
values
('can-a-non-farmer-buy-agricultural-land-in-andhra-pradesh',
 'Can a non-farmer buy agricultural land in Andhra Pradesh?',
 'Andhra Pradesh is generally open to resident buyers, but the parcel must be screened for assigned/DKT, dotted and Scheduled Area land.',
 'DRAFT — confirm with your advocate before publishing.

## Short answer

Usually yes. Andhra Pradesh is generally treated as more open than strict agriculturist-only states, so a non-farmer Indian resident can usually buy ordinary private agricultural land.

## But screen the parcel carefully

- Title chain, Adangal, ROR-1B, LP Map / FMB and mutation
- Encumbrance Certificate and land classification
- Assigned / DKT, government / poramboke, and dotted land status
- Scheduled Area / tribal restrictions
- Land-ceiling exposure
- Intended use — farmhouse, plot, resort, warehouse, solar or industrial use needs conversion and planning approval

## Bottom line

Eligibility is rarely the blocker in Andhra Pradesh; land classification and records are. Verify before any token advance.

Sources: MeeBhoomi; PRS, Land Records and Titles in India.',
 'andhra_pradesh', 'eligibility', '{agri,agri_dry,agri_irrigated}', 5, 'PENDING_LAWYER_REVIEW', null, false,
 'Can a non-farmer buy agricultural land in Andhra Pradesh?',
 'Andhra Pradesh is generally open to resident buyers, subject to title, Adangal/ROR-1B, assigned/DKT, dotted and Scheduled Area checks.'),

('what-is-adangal-and-ror-1b-in-andhra-pradesh',
 'What are Adangal and ROR-1B in Andhra Pradesh?',
 'The two core AP revenue records — and why neither is final proof of title.',
 'DRAFT — confirm with your advocate before publishing.

## Adangal

Adangal is a village revenue record showing survey details, extent, classification, and cultivation / possession details.

## ROR-1B (1-B)

ROR-1B is a Record-of-Rights extract showing pattadar / khata details, extent, and survey references.

## How to use them

- Pull both from the MeeBhoomi portal.
- Cross-check the holder name and extent against the registered sale deed, link documents, mutation, and LP Map / FMB.

## Important

Neither Adangal nor ROR-1B is final proof of title. Indian land records are presumptive and may not match the ground — read them together with the deed chain, EC, survey sketch and possession.

Sources: MeeBhoomi; PRS, Land Records and Titles in India.',
 'andhra_pradesh', 'rtc', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false,
 'What are Adangal and ROR-1B in Andhra Pradesh?',
 'The two core Andhra Pradesh revenue records, how to verify them, and why neither alone proves title.'),

('assigned-and-dkt-land-risk-in-andhra-pradesh',
 'Assigned and DKT land risk in Andhra Pradesh',
 'Why government-assigned and DKT land is high-risk, and what to verify before buying.',
 'DRAFT — confirm with your advocate before publishing.

## What it is

Assigned or DKT land is land granted by the government, often to landless or weaker-section beneficiaries, subject to conditions.

## Why it is high-risk

- It may carry transfer restrictions or resumption risk.
- Freehold / regularisation status is often unclear.
- Buying restricted assigned land can be void and lead to loss of the land.

## What to do

- Get the assignment order and its conditions.
- Check freehold / regularisation status and the latest Adangal / ROR-1B.
- Get a revenue-officer clarification and a specialist lawyer opinion before proceeding.

Related risk: dotted land — parcels with uncertain or missing ownership entries in revenue records — also needs revenue-record correction and title-chain reconciliation.

Sources: MeeBhoomi; Andhra Pradesh Revenue Department.',
 'andhra_pradesh', 'document', '{agri}', 6, 'PENDING_LAWYER_REVIEW', null, false,
 'Assigned and DKT land risk in Andhra Pradesh',
 'Government-assigned and DKT land carries transfer and resumption risk — what to verify before buying in Andhra Pradesh.')
on conflict (slug) do update set
  title = excluded.title, summary = excluded.summary, body_md = excluded.body_md,
  state = excluded.state, topic = excluded.topic, land_types = excluded.land_types,
  reading_minutes = excluded.reading_minutes, seo_title = excluded.seo_title,
  seo_description = excluded.seo_description, updated_at = now();

notify pgrst, 'reload schema';
