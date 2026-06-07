-- ============================================================================
-- AcreHub — Land Legal Navigator  ·  Tamil Nadu seed
-- Source: docs/tamil-nadu-agricultural-land-legal-rules.md (sourced from TN
-- e-Services, DTCP advisories, MEA FEMA guidance, and PRS).
-- Run AFTER supabase-legal-navigator.sql. Safe to re-run (UPSERT).
-- ----------------------------------------------------------------------------
-- GOVERNANCE: seeded as a DRAFT (published = false). Confirm with your advocate,
-- then publish:
--
--   update public.legal_state_rules
--     set published = true, reviewed_by = 'Adv. <name>, Bar #<reg>', reviewed_at = now()
--     where state = 'tamil_nadu';
--
--   update public.legal_articles
--     set published = true, reviewed_by = 'Adv. <name>', reviewed_at = now()
--     where slug in (
--       'can-a-non-farmer-buy-agricultural-land-in-tamil-nadu',
--       'is-patta-enough-to-prove-ownership-in-tamil-nadu',
--       'what-to-check-before-buying-a-farm-plot-in-tamil-nadu'
--     );
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STATE RULE (draft)
-- ---------------------------------------------------------------------------
insert into public.legal_state_rules (state, state_label, data, reviewed_by, reviewed_at, published)
values
('tamil_nadu', 'Tamil Nadu', '{
  "agri_purchase": {
    "allowed_for": ["farmer_resident", "non_farmer_resident", "inherited_farmer"],
    "restricted_for": ["company", "llp", "trust", "partnership", "nri", "oci"],
    "conditions": [
      "For Indian resident individuals, Tamil Nadu is generally treated as open for buying private agricultural land — it does not operate as a strict farmer-only state.",
      "Eligibility is only the first layer: title, Patta/Chitta, A-Register, FMB sketch, Encumbrance Certificate, land classification, ceiling exposure, access and possession must all be verified.",
      "Land-ceiling limits apply under Tamil Nadu law; confirm aggregate holding and exposure for your case.",
      "The biggest risks are usually whether the seller has valid title, whether records match ground reality, and whether the land is private patta land versus government / poramboke / assigned land."
    ]
  },
  "nri_rules": {
    "can_purchase_agri": false,
    "can_inherit": true,
    "restrictions": [
      "Under FEMA/MEA guidance, NRIs and PIOs do not have general permission to purchase agricultural land, plantation property, or farmhouse property in India.",
      "An NRI/PIO may inherit agricultural land, plantation, or farmhouse property, but transfer of such inherited property is restricted (generally only to Indian citizens permanently residing in India).",
      "Converted (non-agricultural) land is treated differently; obtain a FEMA plus Tamil Nadu land-law review before proceeding."
    ]
  },
  "company_rules": {
    "can_purchase_agri": false,
    "conditions": [
      "Company, LLP, trust and institutional purchases require legal review for land-ceiling exposure, permitted use, land-use conversion, planning rules, and FEMA where foreign investment exists.",
      "Request a corporate land purchase review before signing an agreement or paying token advance."
    ]
  },
  "conversion_required_for": ["agri", "agri_dry", "agri_irrigated"],
  "farmer_status_requirement": "none",
  "farmhouse_rules": [
    "Farmhouse, farm-plot and plotted development usually need a land-use and planning approval check (DTCP / local body).",
    "Tamil Nadu DTCP references G.O. Ms. No. 79 (change of land use from agriculture to non-agriculture in non-planned areas) and the Tamil Nadu Combined Development Regulations and Building Rules, 2019.",
    "Verify the land-use zone per the master plan and obtain planning permission and building approval where construction is involved."
  ],
  "common_documents": [
    "Latest sale deed",
    "Parent document / mother deed",
    "Patta / Chitta",
    "A-Register extract",
    "FMB sketch",
    "Encumbrance Certificate",
    "Tax receipts",
    "Mutation / Patta transfer records",
    "Legal heir / partition documents (if inherited)",
    "Registered Power of Attorney (if represented)",
    "Conversion order (if non-agricultural use)",
    "Layout / DTCP approval (if plotted)"
  ],
  "common_risks": [
    "Poramboke / government / assigned land wrongly listed as private",
    "Seller name mismatch versus Patta and sale deed",
    "Patta or survey-number mismatch with the sale deed",
    "Missing FMB sketch or boundary dispute",
    "Short Encumbrance Certificate period hiding older charges",
    "Power-of-Attorney sale without valid scope or registration",
    "Inherited land sold without partition or co-owner consent",
    "Farm plot sold without layout / DTCP approval",
    "Farmhouse use without land-use conversion or planning approval",
    "Unclear or illegal road access"
  ],
  "references": [
    { "label": "Tamil Nadu e-Services of Land Records (Patta/Chitta/FMB/A-Register)", "url": "https://eservices.tn.gov.in/eservicesnew/index.html" },
    { "label": "Tamil Nadu DTCP buyer advisory", "url": "https://tcp.tn.gov.in/before%20buying%20of%20individual%20plot%20%20residential%20building" },
    { "label": "Tamil Nadu DTCP State Rules (conversion & development)", "url": "https://tcp.tn.gov.in/staterules" },
    { "label": "MEA guidance on acquisition and transfer of immovable property in India", "url": "https://www.mea.gov.in/images/pdf/acquisition-and-transfer-of-immovable-property-in-india.pdf" },
    { "label": "PRS: Land Records and Titles in India", "url": "https://prsindia.org/policy/analytical-reports/land-records-and-titles-india" }
  ]
}'::jsonb, 'PENDING_LAWYER_REVIEW', null, false)
on conflict (state) do update set
  state_label = excluded.state_label,
  data = excluded.data,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- TAMIL NADU MOCK LAWYERS (samples; published)
-- ---------------------------------------------------------------------------
insert into public.lawyers (id, name, state, districts, languages, practice_areas, experience_years, specializations, consultation_modes, consultation_fee_placeholder, verification_badge, rating_placeholder, bio, is_mock, published)
values
('00000000-0000-4000-8000-0000000000e9', 'Adv. Karthik Subramanian', 'tamil_nadu', '{Chennai,Kancheepuram}', '{Tamil,English}', '{Agricultural land,Patta verification}', 15, '{agri,document_review}', '{phone,video,in_person}', 2000, 'verified', 4.6, 'Sample profile. Patta/Chitta and title-chain verification across northern Tamil Nadu.', true, true),
('00000000-0000-4000-8000-0000000000ea', 'Adv. Meena Raghavan', 'tamil_nadu', '{Coimbatore,Erode}', '{Tamil,English}', '{Conversion,Farm plots}', 12, '{conversion,document_review}', '{phone,video}', 2200, 'verified', 4.5, 'Sample profile. Land-use conversion, DTCP layout approvals, and farm-plot due diligence.', true, true)
on conflict (id) do update set
  name = excluded.name, state = excluded.state, districts = excluded.districts,
  languages = excluded.languages, practice_areas = excluded.practice_areas,
  experience_years = excluded.experience_years, specializations = excluded.specializations,
  consultation_modes = excluded.consultation_modes,
  consultation_fee_placeholder = excluded.consultation_fee_placeholder,
  verification_badge = excluded.verification_badge, rating_placeholder = excluded.rating_placeholder,
  bio = excluded.bio, is_mock = excluded.is_mock, published = excluded.published;

-- ---------------------------------------------------------------------------
-- TAMIL NADU FAQ ARTICLES (drafts; bodies drawn from the source doc)
-- ---------------------------------------------------------------------------
insert into public.legal_articles (slug, title, summary, body_md, state, topic, land_types, reading_minutes, reviewed_by, reviewed_at, published, seo_title, seo_description)
values
('can-a-non-farmer-buy-agricultural-land-in-tamil-nadu',
 'Can a non-farmer buy agricultural land in Tamil Nadu?',
 'Tamil Nadu is generally open to resident individual buyers, but eligibility is only the first check.',
 'DRAFT — confirm with your advocate before publishing.

## Short answer

For an Indian resident individual, Tamil Nadu is generally treated as more open than states that impose strict agriculturist-only purchase rules. A non-farmer can usually proceed, but eligibility is only the first layer.

## What still must be verified

- Seller title and the parent / mother deed chain
- Patta / Chitta and A-Register extract
- FMB sketch and survey boundaries
- Encumbrance Certificate (ideally a long period)
- Land classification — private patta land versus government / poramboke / assigned land
- Land-ceiling exposure and intended land use

## Bottom line

Buyer eligibility is rarely the real risk in Tamil Nadu — title, land records, classification and land-use are. Get a lawyer to verify documents before any token advance.

Sources: Tamil Nadu DTCP buyer advisory; PRS, Land Records and Titles in India.',
 'tamil_nadu', 'eligibility', '{agri,agri_dry,agri_irrigated}', 5, 'PENDING_LAWYER_REVIEW', null, false,
 'Can a non-farmer buy agricultural land in Tamil Nadu?',
 'Tamil Nadu is generally open to resident individual buyers, subject to title, Patta/Chitta, EC and land-use verification.'),

('is-patta-enough-to-prove-ownership-in-tamil-nadu',
 'Is Patta enough to prove ownership in Tamil Nadu?',
 'No — Patta is important but must be read alongside the sale deed, title chain, A-Register, FMB and EC.',
 'DRAFT — confirm with your advocate before publishing.

## Short answer

No. Patta is an important revenue record, but it is not, by itself, final proof of title.

## Read Patta together with

- Registered sale deeds and the prior title chain
- A-Register extract (classification, extent, survey number)
- FMB sketch (survey boundaries and measurements)
- Encumbrance Certificate, tax receipts and possession records

## Why

In India, land ownership is generally presumptive — records can be spread across departments and may not always match ground reality. Patta and revenue records should never be treated as a government-guaranteed title.

Sources: PRS, Land Records and Titles in India; Tamil Nadu e-Services of Land Records.',
 'tamil_nadu', 'rtc', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false,
 'Is Patta enough to prove ownership in Tamil Nadu?',
 'Patta matters, but ownership in Tamil Nadu must be confirmed with the sale deed, title chain, A-Register, FMB and EC.'),

('what-to-check-before-buying-a-farm-plot-in-tamil-nadu',
 'What should I check before buying a farm plot in Tamil Nadu?',
 'Farm plots need title plus layout approval, land-use conversion, road handover and planning checks.',
 'DRAFT — confirm with your advocate before publishing.

## The extra checks for plotted land

- Seller title, Patta / Chitta, A-Register and EC
- Approved layout status and DTCP / local-body approval
- Land-use conversion (agriculture to non-agriculture) where applicable
- Road width, legal access, and whether roads / common areas have been handed over
- Land-use zone per the master plan, and planning permission where construction is involved
- RERA / project registration where the land is marketed as a plotted development

## Why it matters

Tamil Nadu DTCP specifically advises buyers to verify seller rights, Patta, EC, layout approval, road handover, land-use zone, and planning permissions before buying a plot.

Sources: Tamil Nadu DTCP buyer advisory; Tamil Nadu DTCP State Rules.',
 'tamil_nadu', 'conversion', '{farm_plot,developed_rural,na_converted}', 6, 'PENDING_LAWYER_REVIEW', null, false,
 'What to check before buying a farm plot in Tamil Nadu',
 'Farm plots in Tamil Nadu need layout approval, land-use conversion, road handover and planning checks beyond title.')
on conflict (slug) do update set
  title = excluded.title, summary = excluded.summary, body_md = excluded.body_md,
  state = excluded.state, topic = excluded.topic, land_types = excluded.land_types,
  reading_minutes = excluded.reading_minutes, seo_title = excluded.seo_title,
  seo_description = excluded.seo_description, updated_at = now();

notify pgrst, 'reload schema';
