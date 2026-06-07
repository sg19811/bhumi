-- ============================================================================
-- AcreHub — Land Legal Navigator  ·  Seed data
-- Run AFTER supabase-legal-navigator.sql. Supabase -> SQL Editor -> Run.
-- Safe to re-run: UPSERT on primary keys / unique slugs.
-- ----------------------------------------------------------------------------
-- GOVERNANCE: state rules + articles are seeded as DRAFTS (published = false).
-- The text below is AcreHub's working draft, NOT lawyer-attested. Replace with
-- your lawyer-verified content, set reviewed_by + reviewed_at, then publish:
--
--   update public.legal_state_rules
--     set published = true, reviewed_by = 'Adv. <name>, Bar #<reg>', reviewed_at = now()
--     where state in ('karnataka','maharashtra');
--
--   update public.legal_articles
--     set published = true, reviewed_by = 'Adv. <name>', reviewed_at = now()
--     where slug = '<slug>';
--
-- Lawyers + services are clearly MOCK / indicative and are published so the
-- directory and pricing pages render today.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STATE RULES (drafts)
-- ---------------------------------------------------------------------------
insert into public.legal_state_rules (state, state_label, data, reviewed_by, reviewed_at, published)
values
('karnataka', 'Karnataka', '{
  "agri_purchase": {
    "allowed_for": ["farmer_resident", "non_farmer_resident", "inherited_farmer"],
    "restricted_for": ["company", "llp", "trust", "partnership", "nri", "oci"],
    "conditions": [
      "The Karnataka Land Reforms (Amendment) Ordinance, 2020 omitted Sections 79A, 79B and 79C, so Indian residents — including non-farmers — can generally buy private agricultural land.",
      "Eligibility is only the first layer: title, RTC/Pahani, mutation history, 11E/survey sketch, Encumbrance Certificate, land classification, ceiling exposure, access and possession must all be verified.",
      "Land-ceiling limits still apply (commonly cited as around 54 acres for an individual / 108 acres for a joint family — verify current limits).",
      "Granted / PTCL-sensitive land carries special restrictions: Section 80-A bars relaxation for lands granted under the SC/ST (PTCL) Act, 1978. Treat such land as high-risk."
    ]
  },
  "nri_rules": {
    "can_purchase_agri": false,
    "can_inherit": true,
    "restrictions": [
      "Under FEMA/MEA guidance, NRIs and PIOs do not have general permission to purchase agricultural land, plantation property, or farmhouse property in India.",
      "An NRI/PIO may inherit such property, but transfer is restricted (generally only to Indian citizens permanently residing in India).",
      "Purchase of converted (NA) land is treated differently; obtain a FEMA plus Karnataka land-law review."
    ]
  },
  "company_rules": {
    "can_purchase_agri": false,
    "conditions": [
      "Company, LLP, trust and institutional purchases need legal review for ceiling exposure, permitted use, land-use conversion, planning rules, PTCL/granted-land risk, and FEMA where foreign investment exists.",
      "Request a corporate land purchase review before signing an agreement or paying token advance."
    ]
  },
  "ceiling_limit_acres": 54,
  "conversion_required_for": ["agri", "agri_dry", "agri_irrigated"],
  "farmer_status_requirement": "none",
  "farmhouse_rules": [
    "Farmhouse, farm-plot and plotted development usually need land conversion plus planning-authority / local-body approval.",
    "Check whether the land is still agricultural in the RTC, whether a conversion order exists, and whether the layout and access road are legally formed.",
    "Watch for lake-buffer, rajakaluve, forest, hill and eco-sensitive restrictions."
  ],
  "common_documents": [
    "Latest sale deed",
    "Parent document / mother deed",
    "RTC / Pahani",
    "Mutation Register extract / mutation history",
    "Encumbrance Certificate",
    "11E sketch (if a portion of a survey number is sold)",
    "Tippan / survey sketch / Atlas / revenue map",
    "Khata / e-khata extract (where applicable)",
    "Tax receipts (land revenue)",
    "Conversion order (if non-agricultural use)",
    "Layout / planning-authority approval (if plotted)",
    "PTCL / granted-land status confirmation",
    "Legal heir / partition documents (if inherited)"
  ],
  "common_risks": [
    "PTCL / granted (SC/ST) land with non-alienation conditions",
    "Government / gomala / kharab / tank-bed / rajakaluve land wrongly listed as private",
    "Seller name mismatch versus RTC, mutation and sale deed",
    "Survey-number or hissa mismatch; missing 11E for a subdivided parcel",
    "Short Encumbrance Certificate period hiding older charges",
    "Power-of-Attorney sale without valid scope or registration",
    "Inherited land sold without partition or co-owner consent",
    "Farm plot sold without conversion / layout approval",
    "Boundary dispute or unclear / illegal road access"
  ],
  "references": [
    { "label": "Karnataka Land Reforms Act, 1961 (India Code)", "url": "https://www.indiacode.nic.in/handle/123456789/7740" },
    { "label": "Karnataka Land Reforms (Amendment) Ordinance, 2020", "url": "https://upload.indiacode.nic.in/showfile?actid=AC_KA_71_596_00003_10_1551858304230&filename=13_of_2020-ordinance.pdf&type=ordinance" },
    { "label": "Karnataka Revenue Department / Bhoomi services", "url": "https://landrecords.karnataka.gov.in/" },
    { "label": "Mojini V3 (Karnataka survey services)", "url": "https://bhoomojini.karnataka.gov.in/" },
    { "label": "MEA guidance on acquisition and transfer of immovable property in India", "url": "https://www.mea.gov.in/images/pdf/acquisition-and-transfer-of-immovable-property-in-india.pdf" },
    { "label": "PRS: Land Records and Titles in India", "url": "https://prsindia.org/policy/analytical-reports/land-records-and-titles-india" }
  ]
}'::jsonb, 'PENDING_LAWYER_REVIEW', null, false),

('maharashtra', 'Maharashtra', '{
  "agri_purchase": {
    "allowed_for": ["farmer_resident", "inherited_farmer"],
    "restricted_for": ["non_farmer_resident", "company", "llp", "trust", "partnership", "nri", "oci"],
    "conditions": [
      "Maharashtra is a restricted agricultural-land state. Section 63 of the Maharashtra Tenancy and Agricultural Lands Act generally bars transfer of agricultural land to a non-agriculturist unless the Act allows it or the Collector grants permission.",
      "Agriculturist buyers may proceed to due diligence, but ceiling, tenancy, 7/12, 8A, Ferfar/mutation, eSearch/Index II, Occupant Class-II and tribal-land status must still be checked.",
      "Limited routes for non-agriculturists exist — Collector permission, land inside municipal/planning-authority limits, land allocated for non-agricultural use in a plan (Section 63(1C)), or bona fide industrial/township use (Section 63-IA) — all conditional and needing legal review.",
      "Occupant Class-II / new-tenure land and tribal land carry transfer restrictions; treat as high-risk."
    ]
  },
  "nri_rules": {
    "can_purchase_agri": false,
    "can_inherit": true,
    "restrictions": [
      "Under FEMA/MEA guidance, NRIs and PIOs do not have general permission to purchase agricultural land, plantation property, or farmhouse property in India.",
      "An NRI/PIO may inherit such property, but transfer is restricted (generally only to Indian citizens permanently residing in India).",
      "Converted (NA) land is treated differently; obtain a FEMA plus Maharashtra land-law review before proceeding."
    ]
  },
  "company_rules": {
    "can_purchase_agri": false,
    "conditions": [
      "Company, LLP, trust, developer and institutional purchases need review for Section 63 / 63-IA applicability, ceiling exposure, permitted use, land-use conversion, Occupant Class-II and tribal restrictions, planning approvals, and FEMA where foreign investment exists.",
      "Request a corporate / development land purchase review before signing an agreement or paying token advance."
    ]
  },
  "conversion_required_for": ["agri", "agri_dry", "agri_irrigated"],
  "farmer_status_requirement": "strict",
  "farmhouse_rules": [
    "Farmhouse, farm-plot and plotted development require buyer eligibility plus NA/conversion or planning permission, layout approval, and legal road access.",
    "Check whether the land falls within a planning-authority area and whether Section 63(1C) use-conditions and timelines apply.",
    "Watch for tribal, Occupant Class-II, ceiling, forest, hill-station, eco-sensitive and CRZ restrictions."
  ],
  "common_documents": [
    "Latest sale deed",
    "Parent document / mother deed",
    "7/12 extract (Satbara)",
    "8A extract",
    "Ferfar / mutation entries",
    "eSearch / Index II registered-document search",
    "Property card (where applicable)",
    "Survey / Gat number and subdivision details",
    "Village map / measurement sketch",
    "Encumbrance / registration search report",
    "Tax receipts (land revenue)",
    "Agriculturist proof of buyer (where required)",
    "NA / conversion or planning permission (if non-agricultural use)",
    "Occupant Class-II / tribal-land permission (if applicable)",
    "Legal heir / partition documents (if inherited)"
  ],
  "common_risks": [
    "Non-agriculturist buying raw agricultural land (Section 63 bar)",
    "Occupant Class-II / new-tenure land without transfer permission or premium paid",
    "Tribal / Scheduled-Tribe land (MLRC 36/36A; Restoration Act, 1974) — high restoration risk",
    "Tenanted land or Section 43 transfer restriction",
    "Ceiling-surplus exposure",
    "7/12, 8A or Ferfar mismatch with the sale deed or eSearch records",
    "Government / gairan / nazul land wrongly listed as private",
    "Power-of-Attorney sale without valid scope or registration",
    "Farm plot without layout / planning approval; Section 63(1C) use-timeline risk",
    "Boundary dispute or unclear / illegal road access"
  ],
  "references": [
    { "label": "Maharashtra Tenancy and Agricultural Lands Act (India Code)", "url": "https://www.indiacode.nic.in/handle/123456789/19824" },
    { "label": "Section 63 / 63-IA (India Code PDF)", "url": "https://www.indiacode.nic.in/bitstream/123456789/19824/1/_tenancy_and_agricultural.pdf" },
    { "label": "MahaBhulekh (7/12, 8A, property card)", "url": "https://bhulekh.mahabhumi.gov.in/" },
    { "label": "Maharashtra IGR eSearch", "url": "https://esearchigr.maharashtra.gov.in/" },
    { "label": "MEA guidance on acquisition and transfer of immovable property in India", "url": "https://www.mea.gov.in/images/pdf/acquisition-and-transfer-of-immovable-property-in-india.pdf" },
    { "label": "PRS: Land Records and Titles in India", "url": "https://prsindia.org/policy/analytical-reports/land-records-and-titles-india" }
  ]
}'::jsonb, 'PENDING_LAWYER_REVIEW', null, false)
on conflict (state) do update set
  state_label = excluded.state_label,
  data = excluded.data,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- MOCK LAWYERS (clearly sample; published so the directory renders)
-- ---------------------------------------------------------------------------
insert into public.lawyers (id, name, state, districts, languages, practice_areas, experience_years, specializations, consultation_modes, consultation_fee_placeholder, verification_badge, rating_placeholder, bio, is_mock, published)
values
('00000000-0000-4000-8000-0000000000e1', 'Adv. Anil Kulkarni', 'maharashtra', '{Pune,Nashik}', '{Marathi,Hindi,English}', '{Agricultural land,Title verification}', 16, '{agri,document_review}', '{phone,video,in_person}', 2000, 'verified', 4.7, 'Sample profile. Land title and agricultural transactions across western Maharashtra.', true, true),
('00000000-0000-4000-8000-0000000000e2', 'Adv. Shruti Desai', 'maharashtra', '{Pune,Satara}', '{Marathi,English}', '{NRI advisory,Conversion}', 11, '{nri,conversion}', '{phone,video}', 2500, 'verified', 4.6, 'Sample profile. NRI land matters, NA conversion, and FEMA compliance.', true, true),
('00000000-0000-4000-8000-0000000000e3', 'Adv. Ramesh Gowda', 'karnataka', '{Mysuru,Mandya}', '{Kannada,English}', '{Agricultural land,RTC verification}', 20, '{agri,document_review}', '{phone,in_person}', 1800, 'verified', 4.8, 'Sample profile. Bhoomi/RTC verification and rural land due diligence.', true, true),
('00000000-0000-4000-8000-0000000000e4', 'Adv. Lakshmi Rao', 'karnataka', '{Bengaluru Rural,Tumakuru}', '{Kannada,Telugu,English}', '{Conversion,Litigation}', 13, '{conversion,litigation}', '{video,in_person}', 2200, 'verified', 4.5, 'Sample profile. Land conversion, zoning, and dispute resolution.', true, true),
('00000000-0000-4000-8000-0000000000e5', 'Adv. Imran Sheikh', 'karnataka', '{Belagavi,Dharwad}', '{Kannada,Hindi,Urdu,English}', '{Title chain,Document review}', 9, '{document_review,agri}', '{phone,video}', 1500, 'verified', 4.4, 'Sample profile. Title-chain checks and sale-deed drafting for farmland.', true, true),
('00000000-0000-4000-8000-0000000000e6', 'Adv. Priya Menon', 'maharashtra', '{Mumbai,Thane}', '{Marathi,Hindi,English}', '{NRI advisory,Registration}', 14, '{nri,document_review}', '{phone,video}', 3000, 'verified', 4.7, 'Sample profile. NRI documentation, POA, and registration support.', true, true),
('00000000-0000-4000-8000-0000000000e7', 'Adv. Suresh Patil', 'maharashtra', '{Nashik,Ahmednagar}', '{Marathi,Hindi}', '{Agricultural land,Tenancy}', 22, '{agri,litigation}', '{phone,in_person}', 1700, 'verified', 4.6, 'Sample profile. Tenancy law and agricultural land transfers.', true, true),
('00000000-0000-4000-8000-0000000000e8', 'Adv. Deepa Shetty', 'karnataka', '{Mysuru,Hassan}', '{Kannada,English}', '{Due diligence,Farmhouse}', 12, '{document_review,conversion}', '{phone,video,in_person}', 2000, 'verified', 4.5, 'Sample profile. End-to-end due diligence for farmhouse and orchard buyers.', true, true)
on conflict (id) do update set
  name = excluded.name, state = excluded.state, districts = excluded.districts,
  languages = excluded.languages, practice_areas = excluded.practice_areas,
  experience_years = excluded.experience_years, specializations = excluded.specializations,
  consultation_modes = excluded.consultation_modes,
  consultation_fee_placeholder = excluded.consultation_fee_placeholder,
  verification_badge = excluded.verification_badge, rating_placeholder = excluded.rating_placeholder,
  bio = excluded.bio, is_mock = excluded.is_mock, published = excluded.published;

-- ---------------------------------------------------------------------------
-- SERVICE PACKAGES (indicative pricing; published)
-- ---------------------------------------------------------------------------
insert into public.legal_services (slug, name, description, included_items, target_users, required_documents, turnaround_days_min, turnaround_days_max, starting_price_placeholder, display_order, published)
values
('eligibility-review', 'Eligibility review', 'A lawyer confirms whether you can legally buy a specific parcel.', '{Buyer eligibility opinion,State-rule check,Written summary}', '{buyer,nri}', '{Buyer ID,Land details}', 2, 4, 2500, 1, true),
('document-verification', 'Document verification', 'Verify the core ownership and revenue documents before you commit.', '{Title deed check,RTC/7-12 verification,Mutation/khata check,Red-flag report}', '{buyer,seller}', '{Title deed,RTC/7-12,Mutation extract}', 3, 6, 5000, 2, true),
('encumbrance-title-search', 'Encumbrance & title search', 'Title-chain and encumbrance search to surface loans, charges, or gaps.', '{30-year title chain,Encumbrance Certificate review,Charge/mortgage check}', '{buyer}', '{Sale deeds,EC}', 4, 8, 7500, 3, true),
('nri-land-advisory', 'NRI land advisory', 'FEMA-compliant guidance for NRI/OCI buyers and inheritors.', '{FEMA eligibility opinion,Inheritance/repatriation guidance,POA support}', '{nri}', '{Passport/OCI,Land details}', 3, 7, 6000, 4, true),
('land-conversion-na', 'Land conversion (NA) support', 'Guidance and filing support for non-agricultural conversion.', '{Conversion feasibility,Application support,Follow-up checklist}', '{buyer,agent}', '{RTC/7-12,Survey sketch}', 15, 45, 15000, 5, true),
('full-due-diligence', 'Full due diligence', 'End-to-end legal due diligence before purchase.', '{Title + encumbrance,Litigation search,Mutation + survey check,Risk report,Lawyer call}', '{buyer,nri}', '{All available land documents}', 7, 14, 18000, 6, true),
('sale-deed-registration', 'Sale deed & registration', 'Drafting and registration support for the transaction.', '{Sale deed drafting,Stamp duty guidance,Registration support}', '{buyer,seller}', '{Verified documents,Buyer & seller IDs}', 5, 12, 12000, 7, true),
('agreement-review', 'Agreement review', 'Review of sale agreement / MoU before you sign.', '{Clause-by-clause review,Risk notes,Suggested edits}', '{buyer,seller,agent}', '{Draft agreement}', 1, 3, 2000, 8, true)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, included_items = excluded.included_items,
  target_users = excluded.target_users, required_documents = excluded.required_documents,
  turnaround_days_min = excluded.turnaround_days_min, turnaround_days_max = excluded.turnaround_days_max,
  starting_price_placeholder = excluded.starting_price_placeholder, display_order = excluded.display_order,
  published = excluded.published;

-- ---------------------------------------------------------------------------
-- ARTICLES (drafts; bodies are placeholders pending lawyer review)
-- ---------------------------------------------------------------------------
insert into public.legal_articles (slug, title, summary, body_md, state, topic, land_types, reading_minutes, reviewed_by, reviewed_at, published, seo_title, seo_description)
values
('can-nris-buy-agricultural-land-in-india', 'Can NRIs buy agricultural land in India?', 'What NRIs and OCIs can and cannot buy, and the inheritance route.', 'DRAFT — confirm with your advocate before publishing.

## Short answer

Generally, no. Under FEMA and Ministry of External Affairs guidance, NRIs and PIOs do not have general permission to purchase agricultural land, plantation property, or farmhouse property in India.

## Inheritance is different

An NRI or PIO may inherit agricultural land, plantation, or farmhouse property from a resident. But transfer of such inherited property is restricted — generally only to an Indian citizen permanently residing in India.

## What you can do

- Buy non-agricultural (residential or commercial) property under the general permission.
- For agricultural land, plantation, or farmhouse purchase, specific approval may be required — get a FEMA plus state land-law review first.

Source: MEA guidance on acquisition and transfer of immovable property in India.', null, 'nri', '{agri,plantation,farmhouse}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'Can NRIs buy agricultural land in India?', 'What NRIs and OCIs can and cannot buy, and the inheritance route.'),
('can-a-non-farmer-buy-agricultural-land-in-karnataka', 'Can a non-farmer buy agricultural land in Karnataka?', 'How the 2020 amendment changed who can buy farmland in Karnataka.', 'DRAFT — confirm with your advocate before publishing.

## Short answer

Usually yes, after 2020. The Karnataka Land Reforms (Amendment) Ordinance, 2020 omitted Sections 79A, 79B and 79C, which earlier restricted many non-agriculturists and tied purchase to income limits.

## But eligibility is only the first layer

Even as an eligible buyer, verify:

- Seller title and the parent / mother-deed chain
- RTC / Pahani and mutation history
- 11E sketch where a portion of a survey number is sold
- Encumbrance Certificate and land classification
- Land-ceiling exposure
- PTCL / granted-land status — high-risk if SC/ST granted land

## Bottom line

The 2020 reform widened who can buy, but title, records, ceiling and PTCL/granted-land checks still decide whether a deal is safe.

Sources: Karnataka Land Reforms (Amendment) Ordinance, 2020; Karnataka Bhoomi services.', 'karnataka', 'eligibility', '{agri,agri_dry,agri_irrigated}', 5, 'PENDING_LAWYER_REVIEW', null, false, 'Can a non-farmer buy agricultural land in Karnataka?', 'How the 2020 amendment changed who can buy farmland in Karnataka.'),
('can-a-company-own-agricultural-land-in-india', 'Can a company own agricultural land in India?', 'Entity restrictions and the permission routes that may apply.', 'DRAFT — confirm with your advocate before publishing.

## Short answer

It depends on the state and the structure. In many states, companies, LLPs and trusts cannot freely buy raw agricultural land without specific permission or a recognised route.

## What to check

- State rules: Karnataka generally restricts entity purchase of agricultural land without permission; Maharashtra routes industrial / township use through Section 63-IA and other purchases through Section 63.
- Permitted use: agro-industrial, solar, warehousing or township use often needs explicit approval.
- Land-use conversion and planning permissions for any non-farming activity.
- FEMA / FDI review where any foreign ownership or investment exists.

## Before you sign

Request a corporate land purchase review covering eligibility, ceiling exposure, conversion, and entity documents (board resolution, objects clause, authorised signatory).

Sources: Karnataka Land Reforms Act; Maharashtra Tenancy and Agricultural Lands Act (Sections 63 / 63-IA).', null, 'company', '{agri}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'Can a company own agricultural land in India?', 'Entity restrictions and the permission routes that may apply.'),
('what-is-rtc-pahani-and-how-to-verify', 'What is RTC (Pahani) and how to verify it?', 'Reading the Record of Rights and spotting red flags.', 'DRAFT — confirm with your advocate before publishing.

## What RTC (Pahani) shows

The RTC, or Pahani, is Karnataka''s Record of Rights. It shows the landholder, survey number, extent, land classification, and cultivation / crop details.

## How to verify

- View and download the RTC from the Karnataka Bhoomi portal.
- Cross-check the holder name against the sale deed and mutation history.
- For a subdivided parcel, confirm the 11E sketch and survey records.

## Important

RTC is not, by itself, final proof of title. Indian land records can be spread across departments and may not match ground reality. Read the RTC together with the sale deed, title chain, mutation, EC, survey sketch and possession.

Sources: Karnataka Bhoomi services; PRS, Land Records and Titles in India.', 'karnataka', 'rtc', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false, 'What is RTC (Pahani) and how to verify it?', 'Reading the Record of Rights and spotting red flags.'),
('what-is-mutation-and-why-it-matters', 'What is mutation and why does it matter?', 'Why the mutation entry must match the seller before you buy.', 'DRAFT — confirm with your advocate before publishing.

## What mutation is

Mutation (Ferfar in Maharashtra, the Mutation Register / MR in Karnataka) is the update of revenue records after a change of ownership — sale, inheritance, partition, gift, or court order.

## Why it matters

- It should show the current owner. If the mutation does not reflect the seller, treat the sale as a red flag.
- A mutation entry must be backed by a valid registered document, inheritance record, or order — never accept it on its own.
- Recent or pending mutation can hide disputes or an incomplete transfer.

## How to check

Pull the mutation history (Bhoomi in Karnataka, MahaBhulekh / Village Form 6 in Maharashtra) and match it against the sale deed and the RTC / 7-12.

Sources: Karnataka Bhoomi services; MahaBhulekh.', null, 'mutation', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false, 'What is mutation and why does it matter?', 'Why the mutation entry must match the seller before you buy.'),
('what-is-encumbrance-certificate-ec', 'What is an Encumbrance Certificate (EC) and how to check it?', 'Finding loans, mortgages, and charges on a parcel.', 'DRAFT — confirm with your advocate before publishing.

## What an EC shows

An Encumbrance Certificate lists registered transactions on a property — sales, mortgages, gifts, settlements, releases, court attachments, and charges — over a period.

## What to look for

- Active mortgages, loans or charges that must be cleared before purchase
- Court attachments or litigation references
- Suspicious recent transfers, or gaps in the title chain
- Mismatch between the EC and the sale-deed chain

## Practical tip

Ask for a long EC — at least 30 years where practical. In Maharashtra, also run an IGR eSearch / Index II registration search; that data is informational and not an ownership certificate, so confirm through the Sub-Registrar where needed.

Sources: Karnataka Kaveri Online Services; Maharashtra IGR eSearch.', null, 'document', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false, 'What is an Encumbrance Certificate (EC)?', 'Finding loans, mortgages, and charges on a parcel.'),
('document-checklist-for-buying-agricultural-land', 'Document checklist for buying agricultural land', 'The core documents to verify before any farmland purchase.', 'DRAFT — confirm with your advocate before publishing.

## Core documents to request

- Latest sale deed and the parent / mother-deed chain
- Record of Rights — RTC / Pahani (Karnataka), 7-12 and 8A (Maharashtra), Patta / Chitta and A-Register (Tamil Nadu)
- Mutation history (MR / Ferfar)
- Encumbrance Certificate (and eSearch / Index II in Maharashtra)
- Survey records — 11E sketch (KA, for subdivided parcels), FMB sketch (TN), survey / Gat map (MH)
- Tax / land-revenue receipts
- Seller identity proof and survey / subdivision details

## Case-specific extras

- Inherited land: legal heir certificate, partition / release deeds, consent of all co-owners
- POA sale: registered POA, scope, and revocation check
- Non-farm use: conversion order and layout / planning approval
- Karnataka: PTCL / granted-land status confirmation

## Bottom line

Records are presumptive, not a guaranteed title. Match every document against the others and against the ground before you pay a token advance.

Sources: state land-record portals; PRS, Land Records and Titles in India.', null, 'document', '{agri,agri_dry,agri_irrigated}', 7, 'PENDING_LAWYER_REVIEW', null, false, 'Document checklist for buying agricultural land', 'The core documents to verify before any farmland purchase.'),
('document-checklist-for-buying-a-farmhouse', 'Document checklist for buying a farmhouse', 'Extra approvals to check when buying farmhouse land.', 'DRAFT — confirm with your advocate before publishing.

## Everything in the agricultural-land checklist, plus

- Land-use / conversion: is the land still agricultural, and does the intended farmhouse use need NA conversion?
- Planning approval: DTCP / planning-authority or local-body approval where applicable
- Layout approval and legally formed plots (for farm-plot or gated-farm projects)
- Legal road access, and road / common-area handover
- Building / construction permission if a structure exists or is planned
- Zone restrictions: lake-buffer, forest, hill-station, eco-sensitive or CRZ areas
- Maharashtra: buyer eligibility under Section 63, and Occupant Class-II / tribal-land status
- RERA / project registration where the land is marketed as a plotted development

## Bottom line

Farmhouse and farm-plot buys fail more often on land-use and approvals than on title — verify both.

Sources: Tamil Nadu DTCP advisory; state revenue / planning rules.', null, 'document', '{farmhouse}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'Document checklist for buying a farmhouse', 'Extra approvals to check when buying farmhouse land.'),
('what-is-land-conversion-na', 'What is land conversion (NA) and when is it required?', 'When you must convert agricultural land for non-farm use.', 'DRAFT — confirm with your advocate before publishing.

## What conversion (NA) is

Land conversion, or NA (non-agricultural) permission, changes the permitted use of agricultural land so it can be used for housing, farmhouse, commercial, industrial, or other non-farming purposes.

## When it is required

- Building a farmhouse, resort, warehouse, or any structure beyond permitted agricultural use
- Plotted / layout development
- Commercial, industrial, or solar projects

## How it works

- Karnataka: apply through the Revenue Department; check, and download, the final conversion order.
- Maharashtra: conversion / planning permission, with Section 63(1C) for planning-zone land and Section 63-IA for industrial / township use.
- Tamil Nadu: DTCP land-use change rules (e.g. G.O. Ms. No. 79) and the Combined Development Regulations, 2019.

## Watch for

Use-condition timelines and non-utilisation charges, the master-plan / zone, and whether the RTC / 7-12 still shows the land as agricultural.

Sources: Karnataka Revenue Department; Maharashtra Tenancy Act (63(1C) / 63-IA); Tamil Nadu DTCP.', null, 'conversion', '{agri,na_converted}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'What is land conversion (NA)?', 'When you must convert agricultural land for non-farm use.'),
('how-to-verify-land-ownership', 'How to verify land ownership before buying', 'A step-by-step way to confirm the seller truly owns the land.', 'DRAFT — confirm with your advocate before publishing.

## A step-by-step check

1. Confirm the seller is the recorded owner — match ID to the RTC / 7-12 / Patta and the latest sale deed.
2. Trace the title chain back through the parent / mother deed (30+ years).
3. Pull the mutation history and confirm each entry is backed by a valid document or order.
4. Get a long Encumbrance Certificate (and eSearch / Index II in Maharashtra) to surface loans, charges, or attachments.
5. Verify survey records and boundaries — 11E / FMB / survey map versus the recorded extent and physical possession.
6. Check land classification — private versus government / poramboke / gairan / granted / tribal / forest land.
7. For non-farm use, confirm conversion and planning approvals.
8. Rule out litigation, co-owner / inheritance claims, and POA risks.

## Remember

In India, ownership is presumptive — records are not a government-guaranteed title. When the records and the ground do not match, stop and get a lawyer before paying anything.

Sources: state land-record portals; PRS, Land Records and Titles in India.', null, 'document', '{agri}', 7, 'PENDING_LAWYER_REVIEW', null, false, 'How to verify land ownership before buying', 'A step-by-step way to confirm the seller truly owns the land.'),
('can-a-non-farmer-buy-agricultural-land-in-maharashtra', 'Can a non-farmer buy agricultural land in Maharashtra?', 'Maharashtra restricts raw agricultural land to agriculturists under Section 63 — with limited exceptions.', 'DRAFT — confirm with your advocate before publishing.

## Short answer

Usually not directly. Maharashtra is a restricted state. Section 63 of the Maharashtra Tenancy and Agricultural Lands Act generally bars transfer of agricultural land to a non-agriculturist unless the Act allows it or the Collector grants permission.

## Possible routes (all conditional)

- Collector permission under Section 63.
- Land inside municipal / planning-authority limits, or allocated for non-agricultural use in a regional or development plan (Section 63(1C)).
- Bona fide industrial use or an integrated township project (Section 63-IA).

These routes carry use-condition, timeline and non-utilisation-charge risks and need legal review.

## Always check

7/12 and 8A extracts, Ferfar / mutation entries, eSearch / Index II, Occupant Class-II / new-tenure status, tribal-land restrictions, ceiling exposure, and tenancy (Section 43) restrictions.

Sources: Maharashtra Tenancy and Agricultural Lands Act, Sections 63 / 63-IA; MahaBhulekh.', 'maharashtra', 'eligibility', '{agri,agri_dry,agri_irrigated}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'Can a non-farmer buy agricultural land in Maharashtra?', 'Maharashtra restricts raw agricultural land to agriculturists under Section 63, with limited planning and industrial exceptions.')
on conflict (slug) do update set
  title = excluded.title, summary = excluded.summary, body_md = excluded.body_md,
  state = excluded.state, topic = excluded.topic, land_types = excluded.land_types,
  reading_minutes = excluded.reading_minutes, seo_title = excluded.seo_title,
  seo_description = excluded.seo_description, updated_at = now();

notify pgrst, 'reload schema';
