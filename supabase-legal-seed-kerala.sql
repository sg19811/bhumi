-- ============================================================================
-- AcreHub — Land Legal Navigator  ·  Kerala seed
-- Source: docs/kerala-agricultural-land-legal-rules.md (Kerala Survey & Land
-- Records, Registration Dept, Paddy Land & Wetland Act 2008, MEA, PRS).
-- Run AFTER supabase-legal-navigator.sql. Safe to re-run (UPSERT).
-- ----------------------------------------------------------------------------
-- GOVERNANCE: seeded as a DRAFT (published = false). Confirm with your advocate,
-- then publish:
--
--   update public.legal_state_rules
--     set published = true, reviewed_by = 'Adv. <name>, Bar #<reg>', reviewed_at = now()
--     where state = 'kerala';
--
--   update public.legal_articles
--     set published = true, reviewed_by = 'Adv. <name>', reviewed_at = now()
--     where slug in (
--       'can-a-non-farmer-buy-agricultural-land-in-kerala',
--       'paddy-and-wetland-data-bank-restrictions-in-kerala',
--       'what-is-btr-and-pokkuvaravu-in-kerala'
--     );
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STATE RULE (draft)
-- ---------------------------------------------------------------------------
insert into public.legal_state_rules (state, state_label, data, reviewed_by, reviewed_at, published)
values
('kerala', 'Kerala', '{
  "agri_purchase": {
    "allowed_for": ["farmer_resident", "non_farmer_resident", "inherited_farmer"],
    "restricted_for": ["company", "llp", "trust", "partnership", "nri", "oci"],
    "conditions": [
      "Kerala does not usually operate as a strict farmer-only purchase state for Indian resident buyers of ordinary private land.",
      "Kerala has strong land controls: Kerala Land Reforms ceiling limits, and paddy / wetland protection under the Kerala Conservation of Paddy Land and Wetland Act, 2008.",
      "Land classification is central — purayidam (dry/garden), nilam (paddy), wetland, plantation and Data Bank land each carry different restrictions.",
      "Verify title chain, BTR, Thandaper, possession certificate, Pokkuvaravu/mutation, survey/FMB, Encumbrance Certificate and Data Bank status; conversion or change-of-nature permission may be required for non-agricultural use."
    ]
  },
  "nri_rules": {
    "can_purchase_agri": false,
    "can_inherit": true,
    "restrictions": [
      "Under FEMA/MEA guidance, NRIs and PIOs do not have general permission to purchase agricultural land, plantation property, or farmhouse property in India.",
      "An NRI/PIO may inherit such property, but transfer is restricted (generally only to Indian citizens permanently residing in India).",
      "Converted (non-agricultural) land is treated differently; obtain a FEMA plus Kerala land-law review."
    ]
  },
  "company_rules": {
    "can_purchase_agri": false,
    "conditions": [
      "Company, LLP, trust and institutional purchases need review for Kerala Land Reforms ceiling exposure, plantation/exemption status, permitted use, paddy/wetland restrictions, conversion, local approvals, and FEMA where foreign investment exists.",
      "Request a corporate land purchase review before signing an agreement or paying token advance."
    ]
  },
  "conversion_required_for": ["agri", "agri_dry", "agri_irrigated"],
  "farmer_status_requirement": "none",
  "farmhouse_rules": [
    "Farmhouse, farm-plot and plotted development need land-use review plus, where applicable, conversion / change-of-nature permission and local-body building approval.",
    "If the land is nilam / paddy / wetland or in the Data Bank, an RDO order is typically needed before any construction; a water-conservancy set-apart may apply to larger parcels.",
    "Watch for CRZ (coastal), forest, hill-area and ecologically sensitive restrictions."
  ],
  "common_documents": [
    "Latest sale deed",
    "Parent deed / prior title deeds",
    "Encumbrance Certificate",
    "Basic Tax Register (BTR) extract",
    "Latest land tax receipt",
    "Possession certificate",
    "Thandaper details",
    "Pokkuvaravu / mutation records",
    "Survey / FMB / resurvey records",
    "Data Bank status (if land may be paddy / wetland)",
    "Conversion / change-of-nature or RDO order (if applicable)",
    "Local-body layout / building approval (if plotted or constructing)",
    "Legal heir / partition documents (if inherited)"
  ],
  "common_risks": [
    "Nilam / paddy land / wetland / Data Bank land with conversion and development restrictions",
    "Land-classification mismatch between deed, BTR, possession certificate and ground",
    "Converted land without a clear conversion / RDO order",
    "Kerala Land Reforms ceiling exposure (large holdings, entities, plantations)",
    "Assigned / patta land with transfer conditions",
    "CRZ, forest, hill-area or ecologically sensitive (Western Ghats) restrictions",
    "Devaswom / temple / church / trust land — authority to sell unclear",
    "Power-of-Attorney sale without valid scope or registration",
    "Inherited land sold without partition or co-owner consent",
    "Survey / boundary mismatch versus FMB / resurvey records"
  ],
  "references": [
    { "label": "Kerala Survey and Land Records Department", "url": "https://dslr.kerala.gov.in/" },
    { "label": "Kerala Registration Department", "url": "https://registration.kerala.gov.in/" },
    { "label": "Kerala Conservation of Paddy Land and Wetland Act, 2008 (paddy/wetland & Data Bank)" },
    { "label": "MEA guidance on acquisition and transfer of immovable property in India", "url": "https://www.mea.gov.in/images/pdf/acquisition-and-transfer-of-immovable-property-in-india.pdf" },
    { "label": "PRS: Land Records and Titles in India", "url": "https://prsindia.org/policy/analytical-reports/land-records-and-titles-india" }
  ]
}'::jsonb, 'PENDING_LAWYER_REVIEW', null, false)
on conflict (state) do update set
  state_label = excluded.state_label,
  data = excluded.data,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- KERALA MOCK LAWYERS (samples; published)
-- ---------------------------------------------------------------------------
insert into public.lawyers (id, name, state, districts, languages, practice_areas, experience_years, specializations, consultation_modes, consultation_fee_placeholder, verification_badge, rating_placeholder, bio, is_mock, published)
values
('00000000-0000-4000-8000-0000000000ed', 'Adv. Joseph Mathew', 'kerala', '{Ernakulam,Thrissur}', '{Malayalam,English}', '{Agricultural land,Title verification}', 16, '{agri,document_review}', '{phone,video,in_person}', 2200, 'verified', 4.7, 'Sample profile. Title-chain, BTR and survey verification across central Kerala.', true, true),
('00000000-0000-4000-8000-0000000000ee', 'Adv. Anjali Nair', 'kerala', '{Thiruvananthapuram,Kollam}', '{Malayalam,Hindi,English}', '{Paddy/wetland,Conversion}', 12, '{document_review,conversion}', '{phone,video}', 2400, 'verified', 4.6, 'Sample profile. Paddy/wetland Data Bank, change-of-nature and conversion review.', true, true)
on conflict (id) do update set
  name = excluded.name, state = excluded.state, districts = excluded.districts,
  languages = excluded.languages, practice_areas = excluded.practice_areas,
  experience_years = excluded.experience_years, specializations = excluded.specializations,
  consultation_modes = excluded.consultation_modes,
  consultation_fee_placeholder = excluded.consultation_fee_placeholder,
  verification_badge = excluded.verification_badge, rating_placeholder = excluded.rating_placeholder,
  bio = excluded.bio, is_mock = excluded.is_mock, published = excluded.published;

-- ---------------------------------------------------------------------------
-- KERALA FAQ ARTICLES (drafts; bodies drawn from the source doc)
-- ---------------------------------------------------------------------------
insert into public.legal_articles (slug, title, summary, body_md, state, topic, land_types, reading_minutes, reviewed_by, reviewed_at, published, seo_title, seo_description)
values
('can-a-non-farmer-buy-agricultural-land-in-kerala',
 'Can a non-farmer buy agricultural land in Kerala?',
 'Kerala is generally open to resident buyers, but ceiling rules and paddy/wetland controls are strict.',
 'DRAFT — confirm with your advocate before publishing.

## Short answer

Usually yes. Kerala is generally not a strict farmer-only purchase state for Indian resident buyers of ordinary private land.

## But Kerala has strong land controls

- Kerala Land Reforms ceiling limits on holdings
- Paddy / wetland protection under the 2008 Act, and the Paddy/Wetland Data Bank
- Land classification — purayidam, nilam (paddy), wetland, garden, plantation
- Conversion / change-of-nature permission for non-agricultural use

## Always verify

Title chain, BTR, Thandaper, possession certificate, Pokkuvaravu / mutation, survey / FMB, Encumbrance Certificate, and Data Bank status — before any token advance.

Sources: Kerala Survey and Land Records; Kerala Registration Department; PRS.',
 'kerala', 'eligibility', '{agri,agri_dry,agri_irrigated}', 5, 'PENDING_LAWYER_REVIEW', null, false,
 'Can a non-farmer buy agricultural land in Kerala?',
 'Kerala is generally open to resident buyers, subject to ceiling rules, paddy/wetland Data Bank controls, and land-record checks.'),

('paddy-and-wetland-data-bank-restrictions-in-kerala',
 'Paddy and wetland (Data Bank) restrictions in Kerala',
 'Why nilam / paddy / wetland and Data Bank land is high-risk for construction and conversion.',
 'DRAFT — confirm with your advocate before publishing.

## Why this matters

Kerala protects paddy land and wetland under the Kerala Conservation of Paddy Land and Wetland Act, 2008. Land recorded as nilam, paddy, or wetland — or included in the Paddy/Wetland Data Bank — can face serious conversion and development restrictions.

## What to check

- Data Bank status and BTR classification
- Physical nature of the land and any conversion history
- Whether a Revenue Divisional Officer (RDO) order exists
- For larger unnotified parcels, a water-conservancy set-apart may apply
- Local-body building permission for any construction

## Bottom line

Do not treat paddy / wetland / Data Bank land as safe to build on without an RDO order and a lawyer review.

Sources: Kerala Conservation of Paddy Land and Wetland Act, 2008; Kerala Revenue Department.',
 'kerala', 'conversion', '{agri,na_converted}', 6, 'PENDING_LAWYER_REVIEW', null, false,
 'Paddy and wetland (Data Bank) restrictions in Kerala',
 'Nilam / paddy / wetland and Data Bank land in Kerala faces strict conversion and construction limits — what to verify first.'),

('what-is-btr-and-pokkuvaravu-in-kerala',
 'What are BTR and Pokkuvaravu in Kerala?',
 'Kerala''s core revenue records — BTR, Thandaper and Pokkuvaravu — and how to use them.',
 'DRAFT — confirm with your advocate before publishing.

## Basic Tax Register (BTR)

The BTR is a key Kerala revenue record showing land classification, survey number, extent, and tax details.

## Thandaper

Thandaper is the revenue account / holder reference used in Kerala land tax records.

## Pokkuvaravu (mutation)

Pokkuvaravu is the revenue mutation process that updates records after a sale, inheritance, or partition.

## How to use them

Read BTR, Thandaper and Pokkuvaravu together with the sale deed, prior deeds, possession certificate, survey / FMB records, and the Encumbrance Certificate. Kerala records and the ground can differ, so survey and physical verification matter.

## Important

Revenue records are presumptive, not a guaranteed title. Confirm against the registered deed chain and possession.

Sources: Kerala Survey and Land Records; PRS, Land Records and Titles in India.',
 'kerala', 'rtc', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false,
 'What are BTR and Pokkuvaravu in Kerala?',
 'Kerala revenue records explained — BTR, Thandaper and Pokkuvaravu mutation — and why none alone proves title.')
on conflict (slug) do update set
  title = excluded.title, summary = excluded.summary, body_md = excluded.body_md,
  state = excluded.state, topic = excluded.topic, land_types = excluded.land_types,
  reading_minutes = excluded.reading_minutes, seo_title = excluded.seo_title,
  seo_description = excluded.seo_description, updated_at = now();

notify pgrst, 'reload schema';
