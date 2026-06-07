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
    "allowed_for": ["farmer_resident", "inherited_farmer", "non_farmer_resident"],
    "restricted_for": ["company", "llp", "trust", "partnership"],
    "conditions": [
      "Since the 2020 amendment to the Karnataka Land Reforms Act, non-farmers can purchase agricultural land in Karnataka.",
      "Income limits on buyers have been removed.",
      "Land ceiling rules still apply (around 54 acres for an individual / 108 acres for a joint family — verify current limits)."
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
    "Farmhouse construction on agricultural land has a built-up area limit (verify current rules).",
    "Land must remain primarily agricultural in classification."
  ],
  "common_documents": [
    "RTC (Pahani)",
    "Mutation Register (MR) extract",
    "Encumbrance Certificate (EC, Form 15)",
    "Tippan / Akarband / FMB",
    "Sale Deed (mother deed plus current)",
    "Khata extract",
    "Conversion order (if NA)",
    "Tax receipts (land revenue)",
    "Survey sketch",
    "Form 10 (family tree, where inheritance applies)"
  ],
  "common_risks": [
    "Mutation pending or incorrect in the seller name",
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
}'::jsonb, 'PENDING_LAWYER_REVIEW', null, false),

('maharashtra', 'Maharashtra', '{
  "agri_purchase": {
    "allowed_for": ["farmer_resident", "inherited_farmer"],
    "restricted_for": ["non_farmer_resident", "company", "llp", "trust", "partnership", "nri", "oci"],
    "conditions": [
      "Maharashtra has historically restricted agricultural land purchase largely to agriculturists or those with an agricultural background.",
      "Non-agriculturists may need Collector permission, or can purchase NA-converted land without that restriction.",
      "Tenancy laws and land-ceiling limits apply — verify the current position for your district."
    ]
  },
  "nri_rules": {
    "can_purchase_agri": false,
    "can_inherit": true,
    "restrictions": [
      "Per RBI/FEMA, NRIs/OCIs cannot directly purchase agricultural, plantation, or farmhouse land.",
      "Inheritance of agricultural land from a resident is generally permitted.",
      "Purchase of NA-converted land is permitted."
    ]
  },
  "company_rules": {
    "can_purchase_agri": false,
    "conditions": [
      "Companies/LLPs generally cannot purchase agricultural land in Maharashtra without specific permission.",
      "Specific industrial / project use may be allowed with government approval — confirm the route."
    ]
  },
  "conversion_required_for": ["agri", "agri_dry", "agri_irrigated"],
  "farmer_status_requirement": "strict",
  "farmhouse_rules": [
    "Farmhouse use on agricultural land is regulated; verify local zoning and built-up limits.",
    "Conversion may be required depending on intended use."
  ],
  "common_documents": [
    "7/12 extract (Satbara Utara)",
    "8A extract (Khata)",
    "Mutation entries (Ferfar)",
    "Sale Deed (mother deed plus current)",
    "NA / conversion order (if converted)",
    "Encumbrance Certificate",
    "Property card (where applicable)",
    "Tax receipts (land revenue)",
    "Title search report"
  ],
  "common_risks": [
    "Tenancy rights under tenancy law",
    "Fragmentation / consolidation restrictions",
    "Mutation pending or incorrect",
    "Encroachment not reflected in records",
    "Pending litigation or family disputes"
  ],
  "references": [
    { "label": "Maharashtra Land Revenue Code, 1966" },
    { "label": "Bombay Tenancy and Agricultural Lands Act, 1948" },
    { "label": "Mahabhulekh 7/12 portal", "url": "https://bhulekh.mahabhumi.gov.in/" },
    { "label": "RBI FEMA Regulations (NRI/OCI land ownership)" }
  ]
}'::jsonb, 'PENDING_LAWYER_REVIEW', null, false)
on conflict (state) do update set
  state_label = excluded.state_label,
  data = excluded.data,
  updated_at = now();
-- NOTE (Maharashtra gaps to confirm with lawyer): exact ceiling-limit acreage by
-- irrigation class; current Collector-permission process for non-agriculturists;
-- latest tenancy-law impact on resale. Left conservative ("strict") until verified.

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
('can-nris-buy-agricultural-land-in-india', 'Can NRIs buy agricultural land in India?', 'What NRIs and OCIs can and cannot buy, and the inheritance route.', 'PENDING LAWYER REVIEW

## Short answer

Placeholder content — replace with lawyer-reviewed text before publishing.', null, 'nri', '{agri,plantation,farmhouse}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'Can NRIs buy agricultural land in India?', 'What NRIs and OCIs can and cannot buy, and the inheritance route.'),
('can-a-non-farmer-buy-agricultural-land-in-karnataka', 'Can a non-farmer buy agricultural land in Karnataka?', 'How the 2020 amendment changed who can buy farmland in Karnataka.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', 'karnataka', 'eligibility', '{agri,agri_dry,agri_irrigated}', 5, 'PENDING_LAWYER_REVIEW', null, false, 'Can a non-farmer buy agricultural land in Karnataka?', 'How the 2020 amendment changed who can buy farmland in Karnataka.'),
('can-a-company-own-agricultural-land-in-india', 'Can a company own agricultural land in India?', 'Entity restrictions and the permission routes that may apply.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', null, 'company', '{agri}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'Can a company own agricultural land in India?', 'Entity restrictions and the permission routes that may apply.'),
('what-is-rtc-pahani-and-how-to-verify', 'What is RTC (Pahani) and how to verify it?', 'Reading the Record of Rights and spotting red flags.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', 'karnataka', 'rtc', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false, 'What is RTC (Pahani) and how to verify it?', 'Reading the Record of Rights and spotting red flags.'),
('what-is-mutation-and-why-it-matters', 'What is mutation and why does it matter?', 'Why the mutation entry must match the seller before you buy.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', null, 'mutation', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false, 'What is mutation and why does it matter?', 'Why the mutation entry must match the seller before you buy.'),
('what-is-encumbrance-certificate-ec', 'What is an Encumbrance Certificate (EC) and how to check it?', 'Finding loans, mortgages, and charges on a parcel.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', null, 'document', '{agri}', 5, 'PENDING_LAWYER_REVIEW', null, false, 'What is an Encumbrance Certificate (EC)?', 'Finding loans, mortgages, and charges on a parcel.'),
('document-checklist-for-buying-agricultural-land', 'Document checklist for buying agricultural land', 'The core documents to verify before any farmland purchase.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', null, 'document', '{agri,agri_dry,agri_irrigated}', 7, 'PENDING_LAWYER_REVIEW', null, false, 'Document checklist for buying agricultural land', 'The core documents to verify before any farmland purchase.'),
('document-checklist-for-buying-a-farmhouse', 'Document checklist for buying a farmhouse', 'Extra approvals to check when buying farmhouse land.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', null, 'document', '{farmhouse}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'Document checklist for buying a farmhouse', 'Extra approvals to check when buying farmhouse land.'),
('what-is-land-conversion-na', 'What is land conversion (NA) and when is it required?', 'When you must convert agricultural land for non-farm use.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', null, 'conversion', '{agri,na_converted}', 6, 'PENDING_LAWYER_REVIEW', null, false, 'What is land conversion (NA)?', 'When you must convert agricultural land for non-farm use.'),
('how-to-verify-land-ownership', 'How to verify land ownership before buying', 'A step-by-step way to confirm the seller truly owns the land.', 'PENDING LAWYER REVIEW

Placeholder content — replace with lawyer-reviewed text before publishing.', null, 'document', '{agri}', 7, 'PENDING_LAWYER_REVIEW', null, false, 'How to verify land ownership before buying', 'A step-by-step way to confirm the seller truly owns the land.')
on conflict (slug) do update set
  title = excluded.title, summary = excluded.summary, body_md = excluded.body_md,
  state = excluded.state, topic = excluded.topic, land_types = excluded.land_types,
  reading_minutes = excluded.reading_minutes, seo_title = excluded.seo_title,
  seo_description = excluded.seo_description, updated_at = now();

notify pgrst, 'reload schema';
