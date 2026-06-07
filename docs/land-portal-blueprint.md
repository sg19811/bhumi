# BHŪMI — Parcel-First Land Intelligence Platform
### Complete Product Specification & Engineering Blueprint
**Codename:** `bhumi` · **Edition:** v1.0 · **Posture:** India-first, global-multi-jurisdiction by construction

---

## How to read this document

This is an authoritative build specification. It is opinionated by design — where the brief left something open, a default was chosen and the **assumption is stated inline** as `> ASSUMPTION:`. Engineers should treat the data model (Section E/T), the architecture (Section S), and the code-readiness blueprint (Section V) as the contract. Product/ops should treat Sections A–R as the requirement set. Nothing here is "nice to have" unless explicitly tagged `[GROWTH]`, `[TRUST+]`, or `[INTL]`.

**Naming.** The product name used throughout is **Bhūmi** ("land/earth"). It is a placeholder; swap freely. The internal acquisition arm is referred to as **Bhūmi Capital** to keep marketplace-neutral data separated from first-party buying.

### Global assumptions (stated once, apply everywhere)
> **ASSUMPTION 1 — Two-sided + first-party.** We run a public marketplace *and* an internal acquisition desk. To avoid conflict-of-interest erosion of trust, internal-buy intent is firewalled: internal teams see consented aggregate signals and public listings, never private buyer PII beyond what a normal agent would see, and every internal lead touch is audit-logged. This firewall is a *product feature*, surfaced in our trust page.

> **ASSUMPTION 2 — We are not a registry and not a law firm.** We never assert legal title. We assert *evidence* and *verification status*. Every legal output is explainable guidance with sources, plus an escalation path to a human expert.

> **ASSUMPTION 3 — Parcel ≠ Listing.** A parcel is a durable real-world entity that can be listed zero, one, or many times over its life. We own a *canonical* geometry and identity layer independent of any single listing or source.

> **ASSUMPTION 4 — Jurisdiction is data, not code.** State/district legal rules, eligibility, and field requirements live in versioned **Jurisdiction Packs** (config + rules + content), not in `if (state === 'KA')` branches.

> **ASSUMPTION 5 — Launch geographies.** MVP launches in **two clusters**: (a) **peri-urban Bengaluru rural + Mysuru belt (Karnataka)** for farmhouse/agri-residential/NA-converted demand, and (b) **Nashik–Pune agri belt (Maharashtra)** for orchard/vineyard/irrigated farmland. These two cover the richest record systems (Bhoomi/RTC; 7/12 Mahabhumi) and the strongest buyer demand we can monetize first.

---

## Table of Contents
- **A.** Executive Product Vision
- **B.** User Types (personas & sub-personas)
- **C.** Product Scope
- **D.** Listing Taxonomy
- **E.** Parcel-First Data Model
- **F.** India-First Legal & Workflow Design
- **G.** Document & Evidence System
- **H.** Geospatial System
- **I.** Verification, Trust, Risk & Safety
- **J.** Demand Capture
- **K.** Agent, Broker & Partner Ecosystem
- **L.** Internal Sales & Acquisition Command Center
- **M.** Market Intelligence & Good-Deal Discovery
- **N.** UX & Design System
- **O.** Public Pages & SEO Architecture
- **P.** AI Systems
- **Q.** Moderation & Compliance
- **R.** Integration Strategy
- **S.** Technical Architecture
- **T.** Database & API Spec
- **U.** Implementation Plan
- **V.** Code-Generation Readiness
- **W.** Output Quality Bar + Final Build Brief

---

# SECTION A — EXECUTIVE PRODUCT VISION

### Product vision
Bhūmi is the operating system for land truth. We turn an opaque, document-buried, broker-gated market into a parcel-by-parcel system where every meaningful claim — who owns it, how big it is, whether it's transferable to you, whether it's litigated, what it's worth — is **traceable to evidence and visible at a glance**. Buyers find land they can actually buy; sellers prove what they actually have; agents run a real business; and the market becomes legible for the first time.

### Positioning statement
*For* serious buyers, sellers, and agents of agricultural and rural land *who* are burned by fake listings, hidden encumbrances, and eligibility surprises, *Bhūmi is* a parcel-first land intelligence marketplace *that* makes verification, legality, and geospatial truth the default rather than an afterthought. *Unlike* generic property portals that bolt a "rural" filter onto urban-flat logic, *Bhūmi* is built from the ground up around the parcel, its evidence, and its transaction-readiness.

### Category definition
We are creating **"Land Intelligence Marketplace"** — distinct from "real estate portal." A real estate portal indexes *listings*. A land intelligence marketplace indexes *parcels with evidence*, where listings are a view over verified parcel truth, and where market intelligence is a first-class output, not a byproduct.

### Core wedge
**Verified parcel pages with visible trust tiers + a map-first search that shows real boundaries, not pins.** The wedge that nothing else has: a buyer can stand on a parcel page and see (1) the polygon on satellite, (2) the area reconciliation between document and map, (3) the eligibility verdict *for them* in this state, and (4) the evidence chain — before they ever call anyone.

### Why this portal wins over generic property sites
1. **Parcel truth, not pin soup.** Urban portals show address pins. Land needs polygons, survey/khasra identity, and area reconciliation. We have a canonical geometry layer.
2. **Eligibility is personalized and explained.** "Can I, a non-agriculturist from another state, buy this?" is *the* question for ag land. We answer it per-parcel, per-buyer, per-state, with sources.
3. **Trust is visible and tiered.** Every parcel and listing wears its verification tier like a nutrition label. Fakes can't hide.
4. **Demand is a product, not a form.** Buyer requirements are structured, mappable, matchable, and feed reverse-matching + market intelligence.
5. **Agents get a real CRM,** not a lead-dump. They stay because the tools make them money.
6. **The data compounds.** Every listing, requirement, visit, and verification becomes first-party market intelligence — defensible and monetizable.

### How it becomes famous & highly useful quickly
- **The Eligibility Checker** as a standalone viral tool ("Can I buy farmland in Karnataka?") — free, accurate, shareable, link-bait that ranks and converts.
- **Programmatic village/taluka/district pages** with *real* supply/demand/price data — durable SEO that compounds (Section O).
- **Shareable due-diligence packs + WhatsApp share cards** turn every serious buyer into a distributor.
- **Market reports** (district price-per-acre trends, "where is farmland demand rising") — PR-worthy data products that earn backlinks and authority.
- **Verified-only filter** word-of-mouth: once a buyer experiences "no fake listings," they tell everyone.

### North-star metrics
- **Primary North Star:** *Verified Transaction-Intent Matches per week* — a buyer with a verified requirement connected to a parcel at ≥`parcel-verified` tier where a genuine conversation/visit occurs. This single metric forces supply quality, demand quality, *and* matching to all improve together.
- **Supporting:**
  - Verified Parcel Coverage % per active cluster
  - Demand Capture Rate (requirements posted / unique serious visitors)
  - Trust Tier Mix (% of live listings at ≥`parcel-verified`)
  - Agent Activation & Retention (agents with ≥1 verified listing + responded lead in 30d)
  - Time-to-First-Verified-Match
  - Internal Acquisition Opportunity Yield (qualified watchlist parcels → closed by Bhūmi Capital)

### The five flywheels

**1. Marketplace flywheel.** More verified supply → better buyer experience → more buyer demand & requirements → more reasons for sellers/agents to list & verify → more verified supply.

**2. Trust flywheel.** Visible verification → buyers prefer verified → sellers/agents seek higher tiers → more documents & field inspections flow in → richer evidence corpus → cheaper/faster verification → more verification.

**3. Agent flywheel.** Good CRM + real leads → agents bring inventory & respond fast → response SLA & ranking rewards good agents → buyers trust top agents → more buyer demand routes to agents → agents invest more in the platform.

**4. Buyer-demand flywheel.** Easy "I want to buy" flow → structured demand → reverse-matching surfaces hidden supply → buyers get value without searching → more buyers post demand → demand heatmaps tell sellers where to list → supply follows demand.

**5. Internal acquisition flywheel.** Platform first-party signals (price cuts, long-on-market, high-demand/low-competition clusters) → opportunity scoring → Bhūmi Capital acquires/brokers good deals → realized outcomes calibrate the scoring models → sharper opportunity detection → better yield. (Strictly consent- and audit-gated per ASSUMPTION 1.)

---

# SECTION B — USER TYPES

Format per persona: **Goals · Pains · Key actions · Trust barriers · Dashboards · Notifications · Lead-routing · Permissions · KPIs.** Permissions reference roles defined in Section S (RBAC/ABAC).

### B.1 Buyer (root persona)
- **Goals:** find buyable land that matches intent and budget without getting scammed or stuck on eligibility.
- **Pains:** fake/duplicate listings, hidden litigation, area mismatch, "can I even buy this?", broker noise.
- **Key actions:** map search, save searches, post a requirement, view parcel pages, request DD pack, schedule a visit, contact (masked).
- **Trust barriers:** is the seller real? is the area real? is it litigated? can I legally buy?
- **Dashboards:** Saved searches, Matched parcels, My requirements, My visits, My DD packs.
- **Notifications:** new match, price drop on saved parcel, verification upgrade on watched parcel, visit reminders.
- **Lead routing:** buyer→listing creates a Lead routed to the listing's owning agent/seller (or internal queue if `off-market`/`internal`).
- **Permissions:** `buyer` — read public + own private; create requirement, lead, visit, offer.
- **KPIs:** match relevance, requirement completion, visit conversion.

**Sub-personas:**
- **B.1a Farmer buyer** — wants cultivable, irrigated, eligibility usually satisfied; cares about water, soil, access, crop fit. Needs vernacular UI, low bandwidth.
- **B.1b Investor buyer** — cares about appreciation, liquidity, legal cleanliness, exit. Wants market trends, undervaluation signals, NA-conversion potential.
- **B.1c Farmhouse buyer** — lifestyle; cares about scenery, access road, electricity/water, distance from city, build permissibility. Often non-agriculturist → eligibility is the gating question.
- **B.1d Developer/converter buyer** — cares about NA-conversion feasibility, zoning, road frontage, contiguous assembly, FSI/plotting potential. Needs parcel-assembly tooling.
- **B.1e Institutional buyer** — solar/warehouse/agri-processing/PE land funds; needs bulk acreage, title insurability, contiguity, due-diligence at scale, NDA rooms.

### B.2 Seller — Owner
- **Goals:** sell at a fair price quickly, prove legitimacy, avoid time-wasters.
- **Pains:** doesn't know what docs to show, undervalues/overvalues, gets lowballed, exposed to fraud.
- **Key actions:** create listing via wizard, upload docs, claim/draw parcel, choose verification tier, manage leads.
- **Trust barriers:** will my number be spammed? will I be scammed? is this site real?
- **Dashboards:** My listings, Lead inbox, Verification status, Price guidance, Views/saves analytics.
- **Notifications:** new lead, verification step needed, price guidance updates, listing expiring.
- **Lead routing:** owner-listed → owner inbox + optional co-broke pool.
- **Permissions:** `seller` — manage own parcels/listings/docs/leads.
- **KPIs:** listing-to-verified rate, lead response time, days-to-deal.

**Sub-personas:**
- **B.2a Family representative** — selling on behalf of family; must capture co-owner consent; needs SellerRelationshipToParcel = `family_representative` and consent workflow.
- **B.2b Power-of-Attorney seller** — must upload POA doc; system flags POA-based sales as higher-scrutiny; eligibility/validity caveats surfaced; co-owner cross-checks.

### B.3 Agent / Broker
- **Goals:** more qualified leads, more closings, manage inventory and pipeline.
- **Pains:** lead leakage, no CRM, reputation invisible, co-broke disputes.
- **Key actions:** onboard+KYC, bulk-import inventory, verify listings, work lead inbox, log calls/visits, co-broke, track commission.
- **Trust barriers:** will I get real leads? will the platform steal my clients/inventory?
- **Dashboards:** Lead inbox, Pipeline (kanban), Inventory, Response SLA, Reputation/ranking, Commission tracker, Team performance.
- **Notifications:** new lead (with SLA timer), buyer reply, listing verification status, ranking changes.
- **Lead routing:** territory + specialty + response-score weighted; co-broke pool; round-robin fallback.
- **Permissions:** `agent`, with `agency_admin` for agency owners; sub-account roles.
- **KPIs:** response time, lead→visit→deal conversion, reputation score, active inventory.

### B.4 Aggregator / Channel Partner
- **Goals:** monetize a network/inventory feed; refer buyers/sellers.
- **Key actions:** bulk feed integration, referral links, payout tracking, white-label microsite `[GROWTH]`.
- **Dashboards:** Feed health, Referral conversions, Payouts.
- **Lead routing:** referred leads tagged with partner attribution for payout.
- **Permissions:** `partner` (scoped API + referral console).
- **KPIs:** feed quality, referral conversion, payout accuracy.

### B.5 Surveyor / Field Verifier
- **Goals:** efficient field jobs, clear checklist, fast payment.
- **Key actions:** accept verification task, navigate to parcel, capture geo-tagged photos/video, confirm boundary, fill checklist, submit.
- **Trust barriers:** clarity of job, payment reliability, dispute protection.
- **Dashboards:** Job queue, Map of assigned parcels, Earnings, Quality score.
- **Notifications:** new job, SLA timer, rework requests.
- **Lead routing:** geo-nearest + rating + availability.
- **Permissions:** `field_verifier` (mobile-scoped; can write VerificationTask evidence only for assigned cases).
- **KPIs:** jobs/day, evidence quality score, rework rate, SLA adherence.

### B.6 Lawyer / Legal Associate
- **Goals:** review titles/encumbrances, answer escalations, produce opinions.
- **Key actions:** accept escalation, review evidence room, write legal opinion note, set risk flags.
- **Dashboards:** Escalation queue, Cases by risk, SLA.
- **Permissions:** `legal_associate` (read evidence rooms assigned; write LegalReview, RiskSignal).
- **KPIs:** turnaround, escalation resolution, dispute prevention.

### B.7 Internal Sales User (Bhūmi desk)
- **Goals:** convert platform demand/supply into transactions and revenue.
- **Key actions:** work unified lead queue, score leads, schedule visits, hand off to deal room.
- **Dashboards:** Lead queue, Pipeline, Territory analytics, Leaderboard, Forecast.
- **Permissions:** `internal_sales` (consent-gated PII; audit-logged).
- **KPIs:** pipeline velocity, conversion, revenue attribution.

### B.8 Internal Acquisitions User (Bhūmi Capital)
- **Goals:** find and capture undervalued/high-liquidity parcels for first-party buying.
- **Key actions:** review opportunity watchlists, run cluster analysis, flag parcels, initiate deal room.
- **Dashboards:** Opportunity board, Cluster heatmaps, Price-cut & long-on-market alerts, DealScore explainability.
- **Permissions:** `internal_acq` (aggregate + public + consented signals only; firewalled per ASSUMPTION 1).
- **KPIs:** opportunity yield, IRR on acquired parcels, model precision/recall.

### B.9 Admin / Superadmin
- **Goals:** keep the marketplace safe, accurate, and operational.
- **Permissions:** `admin`, `superadmin` (full, with break-glass audit).
- **Dashboards:** Moderation queue, System health, Verification SLA, Fraud signals.
- **KPIs:** moderation latency, fraud caught, uptime.

### B.10 Compliance Reviewer
- **Goals:** enforce DPDP/consent/retention, handle DSRs and grievances.
- **Permissions:** `compliance` (consent records, audit logs, DSR tooling; cannot edit listings).
- **KPIs:** DSR turnaround, consent coverage, incident MTTR.

### B.11 Content / SEO Editor
- **Goals:** publish durable, useful, schema-correct pages.
- **Permissions:** `content_editor` (CMS, SEOPage, KnowledgeSource).
- **KPIs:** indexed useful pages, organic traffic, page-level conversion.

### B.12 Data Analyst
- **Goals:** turn first-party data into intelligence and reports.
- **Permissions:** `analyst` (warehouse read, no raw PII without consent scope).
- **KPIs:** report cadence, model quality, decision impact.

---

# SECTION C — PRODUCT SCOPE

The product is one platform with four surfaces: **Public Marketplace**, **Operator Apps** (agent/seller/field), **Internal Command Center**, and **Content/SEO Engine**. Below is the full scope; MVP/phase tagging is in Section U.

| Module | One-line scope | Phase |
|---|---|---|
| Public marketplace | Map-first search, parcel pages, listing pages, trust tiers | 1 |
| Listing creation flow | Wizard: claim/draw parcel → details → docs → tier → publish | 1 |
| Parcel verification flow | Case → tasks → evidence → tier promotion | 2 |
| Due-diligence room | Permissioned evidence room + shareable DD pack PDF | 2 |
| Buyer requirement flow | Structured "I want to buy" + map geography + reverse matching | 1 |
| Map search | MapLibre vector parcels + facets + geo truth | 1 |
| AI legal assistant | Source-linked, state-aware eligibility & process guidance | 2 |
| AI parcel explainer | Plain-language parcel summary from evidence | 2 |
| AI internal lead copilot | Lead/score/next-best-action for internal teams | 3 |
| Agent CRM | Lead inbox, pipeline, inventory, SLA, reputation | 1→3 |
| Internal sales CRM | Unified queue, scoring, deal rooms, forecasting | 3 |
| Internal acquisition intelligence | Opportunity board, cluster/heatmap, DealScore | 3 |
| Market trends dashboards | Price/acre, time-on-market, demand-supply | 3 |
| Opportunity scoring engine | Explainable scores + confidence | 3 |
| Legal rules engine | Jurisdiction packs: eligibility, restrictions, checklists | 2 |
| Document intelligence engine | OCR + structured extraction + confidence + evidence chain | 2 |
| Jurisdiction adapter system | Country>state>district pluggable packs | 2→4 |
| Admin moderation | Listing/content/AI moderation, fraud, disputes | 1→2 |
| Marketing site | Brand, trust, how-it-works, for-agents | 1 |
| Content library | Legal guides, glossary, playbooks, KnowledgeSource | 2 |
| SEO landing page engine | Programmatic village/taluka/district/crop pages | 4 |
| Analytics / data warehouse | Event pipeline → warehouse → BI + models | 1→3 |

---

# SECTION D — LISTING TAXONOMY

Taxonomy is two-axis: **LandClass** (what the parcel fundamentally *is*) and **ListingIntent** (how it is being offered). A parcel has exactly one primary `LandClass` (plus optional secondary tags); a listing layers `ListingIntent` and category-specific fields on top. This separation matters because the same parcel may be listed as "orchard for sale" today and "NA-conversion candidate" later.

### D.1 LandClass enum + computed/required/optional fields

Legend: **R** required, **O** optional, **C** computed.

| LandClass | Defining traits | Required (R) | Optional (O) | Computed (C) |
|---|---|---|---|---|
| `agri_land` | Cultivable, agri-classified | survey/khasra id, area, district, water source(R as enum) | crop history, fencing | area_recon, eligibility_verdict |
| `irrigated_farmland` | Assured irrigation | irrigation_type(canal/borewell/drip/river), area | water_yield, pump details | water_score, price/acre |
| `dryland` | Rain-fed | area, soil_type | rainfall band | yield_risk_score |
| `orchard` | Standing fruit trees | crop_species, tree_count, age_band | yield/season, drip | income_potential |
| `plantation` | Tea/coffee/rubber/areca etc. | plantation_type, area, yield_band | labor lines, processing | revenue_proxy |
| `farmhouse_land` | Land sold for farmhouse use | road_access, electricity(bool), water(bool) | view/terrain tags | build_feasibility hint |
| `built_farmhouse` | Structure present | built_area, bedrooms, construction_year | amenities, furnishing | price split land/structure |
| `farm_plot_project` | Promoter-subdivided farm plots | project_id, plot_no, layout_approval_ref | club amenities | per-plot price/acre |
| `developed_rural_plot` | Plotted, basic infra | plot_dimensions, road_width, corner(bool) | sanction ref | plot premium |
| `na_converted` | Non-agricultural converted | conversion_order_ref, sanctioned_use | zone, FSI | conversion_confidence |
| `peri_urban_growth` | Urban-fringe upside | distance_to_growth_node, master_plan_zone(O) | road_widening signal | growth_score |
| `solar_suitable` | Solar dev potential | area(≥threshold), substation_distance(O), terrain_flatness(C) | DISCOM feasibility | solar_suitability_score |
| `warehouse_logistics` | Logistics potential | highway_distance, road_frontage, load_bearing(O) | zoning | logistics_score |
| `institutional_land` | Bulk/contiguous | total_acreage, contiguity(C), title_insurability(O) | NDA required(bool) | assembly_score |
| `joint_ownership` | Multi-owner | co_owner_count, consent_status(C) | partition status | consent_completeness |
| `distress_sale` | Urgent/distressed | urgency_reason(enum), motivation(O) | deadline | motivation_score |
| `litigated_flagged` | Active dispute/flag | case_ref(O), flag_type | court/forum | legal_complexity_score |
| `auction_bank` | Bank/auction-related | auction_ref, reserve_price, auction_date | bank name | (display-only, sourced) |
| `offmarket_internal` | Internal-only opportunity record | sourced_by, sourcing_note | owner_contact (consent-gated) | DealScore (internal) |

> **ASSUMPTION 6 — `auction_bank` and `litigated_flagged`** are *informational/flagged* classes, never auto-promoted to transaction-ready. They require legal review and carry permanent caveat cards.

> **ASSUMPTION 7 — `offmarket_internal`** records are invisible on the public marketplace and live behind the internal firewall; they exist so the acquisition desk can track sourced opportunities inside the same parcel graph without leaking PII.

### D.2 ListingIntent enum
`for_sale` · `for_lease` · `for_joint_development` · `for_partnership` · `expression_of_interest_only` · `off_market_internal`

### D.3 Cross-cutting required listing fields (all classes)
`parcel_ref`, `land_class`, `listing_intent`, `headline`, `asking_price` (+ `price_basis`: total | per_acre | per_sqft | per_guntha | negotiable), `area_value` + `area_unit` (acre/guntha/cent/bigha/hectare/sqft — unit table is jurisdiction-scoped, see Section F), `location_admin_path`, `seller_relationship`, `verification_tier` (computed), `media[]`, `disclaimer_block` (computed by jurisdiction).

### D.4 Computed-field philosophy
Computed fields are **never stored as truth**; they are stored as `{value, confidence, inputs[], computed_at, model_version}` so they are explainable and re-derivable. See Section M for formulas.

---

# SECTION E — PARCEL-FIRST DATA MODEL

The root entity is **Parcel**. Listings, evidence, signals, and scores hang off parcels. Below, each entity gives **Purpose · Key fields · Relationships · Validation · Lifecycle · Indexes · Geo indexes · Search facets · Analytics events.** Physical SQL/Prisma is in Section T; this is the logical model.

> **Modeling stance:** UUIDv7 PKs everywhere (time-sortable). All entities carry `created_at`, `updated_at`, `created_by`, `source_system`, `tenant_id` (for `[INTL]` multi-tenant later). Soft-delete via `deleted_at` for user content; hard-delete only via DSR pipeline (Section Q).

### E.1 Parcel (root)
- **Purpose:** durable canonical identity for a real-world land unit, independent of listings/sources.
- **Fields:** `id`, `canonical_area` `{value, unit, source, confidence}`, `primary_land_class`, `secondary_tags[]`, `admin_path_id` → Village/.../Country, `centroid (geography point)`, `current_geometry_id` → ParcelGeometry, `merge_of[]`/`split_into[]` (lineage), `status`, `confidence_overall (C)`.
- **Relationships:** 1—N ParcelIdentifier, 1—N ParcelGeometry (versioned), 1—N Listing, 1—N Document (via cases), 1—N *Signal, 0—1 InternalOpportunity.
- **Validation:** must have ≥1 identifier OR ≥1 geometry before it can be referenced by a listing; centroid must fall inside its admin boundary (warn if not).
- **Lifecycle:** `draft → claimed → active → merged/split → archived`.
- **Indexes:** `(admin_path_id)`, `(primary_land_class)`, `(status)`.
- **Geo indexes:** GiST on `centroid`; geometry indexes on ParcelGeometry.
- **Facets:** land_class, admin levels, area band, verification tier, price/acre band.
- **Events:** `parcel.created`, `parcel.identity_added`, `parcel.geometry_updated`, `parcel.merged`, `parcel.split`.

### E.2 ParcelGeometry (versioned)
- **Purpose:** the canonical, versioned boundary we *own*, separate from any provider layer.
- **Fields:** `id`, `parcel_id`, `geom (geometry(Polygon/MultiPolygon, 4326))`, `area_computed (C, m²)`, `source` (`drawn_by_user`/`uploaded_kml`/`gov_layer`/`survey_import`/`ai_assisted`), `source_ref`, `accuracy_class` (`survey_grade`/`sketch`/`approximate`), `is_current`, `superseded_by`.
- **Validation:** valid OGC geometry (`ST_IsValid`); area within tolerance of declared area else raise `AREA_MISMATCH` signal; SRID 4326.
- **Lifecycle:** `proposed → current → superseded`.
- **Geo indexes:** GiST on `geom`; computed `centroid` trigger.
- **Events:** `geometry.proposed`, `geometry.promoted`, `geometry.overlap_detected`.

### E.3 ParcelIdentifier (polymorphic identity)
- **Purpose:** all the ways a parcel is named across systems.
- **Fields:** `id`, `parcel_id`, `id_type` (enum below), `value` (normalized string), `raw_value`, `issuing_authority`, `as_of_date`, `confidence`, `source_document_id`.
- **`id_type` enum:** `ulpin` (Bhu-Aadhaar, 14-char), `survey_number`, `khasra`, `gut`, `khata`, `khewat`, `plot_number`, `municipal_property_id`, `revenue_subdivision`.
- **Validation:** ULPIN format check (14 alphanumeric); uniqueness of `(id_type, value, admin_path)` soft-enforced → duplicate triggers `DUPLICATE_IDENTIFIER` signal (not hard reject; real-world dupes happen via splits).
- **Facets:** id_type presence (drives "has ULPIN" filter).
- **Events:** `identifier.added`, `identifier.conflict_detected`.

### E.4 Administrative hierarchy: Country → State → District → Taluka/Tehsil → Village
- **Purpose:** canonical geography + jurisdiction routing + SEO page targets.
- **Fields per node:** `id`, `level`, `name`, `name_localized {lang:..}`, `parent_id`, `boundary (geography multipolygon, O)`, `codes {lgd_code, census_code,...}`, `jurisdiction_pack_id` (resolved at nearest applicable level).
- **Why one table (adjacency) + `level` enum:** simpler joins, supports `[INTL]` arbitrary depth; materialized `admin_path` ltree for fast ancestor queries.
- **Indexes:** `ltree` on path; GiST on boundary.
- **Facets:** every level is a facet and an SEO page.

### E.5 Listing
- **Purpose:** a time-bound offer over a parcel.
- **Fields:** `id`, `parcel_id`, `agent_id`/`seller_id` (owner), `land_class`, `listing_intent`, `headline`, `description`, `asking_price`, `price_basis`, `area_value/unit`, `verification_tier (C)`, `status`, `expires_at`, `flags[]`, `media[]`, `disclaimer_block (C)`, `seo_slug`.
- **Relationships:** N—1 Parcel, N—1 Agent/Seller, 1—N ListingMedia, 1—N Lead, 1—N Offer.
- **Validation:** parcel must be ≥`claimed`; price/area present; jurisdiction-required fields present (from pack); profanity/PII scan on description.
- **Lifecycle:** `draft → pending_moderation → live → under_offer → off_market → expired → withdrawn`.
- **Indexes:** `(status, expires_at)`, `(parcel_id)`, `(agent_id)`; trigram on headline.
- **Facets:** all of D.3 + freshness.
- **Events:** `listing.created/published/price_changed/status_changed/expired`.

### E.6 ListingMedia
- **Fields:** `id`, `listing_id`, `kind` (photo/video/drone/360/doc-preview), `storage_key`, `geo_tag (point, O)`, `captured_at (O)`, `hash`, `is_cover`, `moderation_status`, `watermark_applied`.
- **Validation:** EXIF stripped for privacy except retained geo when seller-consented; max sizes; NSFW/irrelevant scan.
- **Events:** `media.uploaded`, `media.flagged`.

### E.7 Seller + SellerRelationshipToParcel
- **Seller fields:** `id`, `user_id`, `kyc_status`, `display_name`, `contact (masked by default)`.
- **SellerRelationshipToParcel fields:** `id`, `seller_id`, `parcel_id`, `relationship_type` (`sole_owner`/`co_owner`/`family_representative`/`poa_holder`/`agent_authorized`/`unverified_claim`), `evidence_document_ids[]`, `consent_status`, `verified (C)`.
- **Validation:** `poa_holder` requires POA doc; `co_owner` triggers consent workflow; `unverified_claim` caps verification tier at `phone-verified`.
- **Lifecycle:** `claimed → evidence_pending → verified → disputed`.
- **Events:** `seller.relationship_claimed/verified/disputed`.

### E.8 BuyerRequirement (demand as first-class)
- **Purpose:** structured buyer intent, mappable + matchable.
- **Fields:** `id`, `buyer_id`, `intent` (farming/farmhouse/investment/development/institutional), `land_classes[]`, `geo_scope (geometry multipolygon | admin_ids[])`, `budget_band {min,max,currency}`, `acreage_band`, `irrigation_pref`, `access_pref`, `time_horizon`, `financing_readiness`, `verified_buyer (C)`, `status`, `match_count (C)`.
- **Relationships:** 1—N Lead (reverse-matched), 1—N SavedSearch link.
- **Validation:** at least intent + geo + budget OR acreage.
- **Lifecycle:** `active → fulfilled → paused → expired`.
- **Geo indexes:** GiST on `geo_scope` for reverse-match containment.
- **Facets:** drives demand heatmaps.
- **Events:** `requirement.created/matched/fulfilled`.

### E.9 Agent + Agency
- **Agent:** `id`, `user_id`, `agency_id (O)`, `kyc_status`, `rera_or_reg_no (O)`, `territories[]` (admin_ids + polygons), `specialties[]` (land_classes), `reputation_score (C)`, `response_sla_ms (C)`, `status`.
- **Agency:** `id`, `name`, `business_kyc_status`, `owner_user_id`, `member_agent_ids[]`, `microsite_slug (O) [GROWTH]`.
- **Lifecycle:** `pending_kyc → active → suspended`.
- **Events:** `agent.onboarded/verified/ranked`.

### E.10 Lead + LeadAssignment
- **Lead:** `id`, `source` (listing_contact/requirement_match/seo_page/whatsapp/referral), `buyer_id (O)`, `parcel_id (O)`, `listing_id (O)`, `requirement_id (O)`, `intent_score (C)`, `status`, `partner_attribution (O)`, `consent_record_id`.
- **LeadAssignment:** `id`, `lead_id`, `assignee_type` (agent/internal_sales/agency_pool), `assignee_id`, `assigned_at`, `sla_deadline`, `responded_at (C)`, `reassign_reason (O)`.
- **Routing rules:** see Sections B & K (territory + specialty + response score + round-robin; off-market/internal → internal queue).
- **Lifecycle:** `new → assigned → contacted → qualified → visit → negotiation → won → lost`.
- **Events:** `lead.created/assigned/responded/stage_changed/closed`.

### E.11 Conversation, Visit
- **Conversation:** masked-contact threaded messaging; `id`, `lead_id`, `participants[]`, `channel` (in_app/whatsapp/email), `messages[]`, `pii_masked (bool)`.
- **Visit:** `id`, `lead_id`, `parcel_id`, `scheduled_for`, `mode` (in_person/video), `safe_meeting_flags`, `verification_capture_ids[]`, `status`, `outcome_note`.
- **Events:** `visit.scheduled/completed/no_show`.

### E.12 VerificationCase + VerificationTask
- **VerificationCase:** `id`, `parcel_id`, `listing_id (O)`, `target_tier`, `current_tier (C)`, `assigned_reviewer_id`, `sla_deadline`, `status`.
- **VerificationTask:** `id`, `case_id`, `task_type` (phone/kyc/relationship/doc_pack/geo/field_inspect), `assignee_id`, `evidence_ids[]`, `result` (pass/fail/needs_more), `auto_checks {area_recon, overlap, identifier_match}`.
- **Lifecycle (case):** `open → in_progress → evidence_review → approved → rejected → expired`.
- **Events:** `verification.case_opened/task_completed/tier_promoted/rejected`.

### E.13 Document, DocumentType, DocumentExtraction
- **Document:** `id`, `owner_scope` (parcel/listing/seller/case), `doc_type_id`, `storage_key`, `sha256`, `version`, `prev_version_id`, `redaction_profile`, `permission_grants[]`, `watermark_policy`, `extraction_status`.
- **DocumentType:** `id`, `code` (rtc_712/khasra_khatauni/mutation/sale_deed/gift_deed/inheritance/partition/tax_receipt/utility_bill/fmb_tippon/cadastral/possession/kyc/noc_consent/encumbrance_cert/bank_doc), `jurisdiction_scope`, `expected_fields_schema (JSON)`.
- **DocumentExtraction:** `id`, `document_id`, `extractor_version`, `fields {key:{value,confidence,bbox}}`, `overall_confidence`, `validation_results[]`.
- **Validation:** sha256 dedupe; field-level validation against DocumentType schema; cross-doc consistency (name/area/survey-no across docs) → signals.
- **Lifecycle (extraction):** `queued → ocr → structured → validated → failed`.
- **Events:** `document.uploaded/versioned`, `extraction.completed/low_confidence`.

### E.14 LegalRule, JurisdictionPack
- **JurisdictionPack:** `id`, `scope` (country/state/district), `version (semver)`, `effective_from`, `effective_to (O)`, `rules[] → LegalRule`, `field_requirements`, `unit_system`, `checklists[]`, `content_refs → KnowledgeSource`, `status` (draft/published/deprecated).
- **LegalRule:** `id`, `pack_id`, `rule_type` (`buyer_eligibility`/`transfer_restriction`/`ceiling_limit`/`conversion_requirement`/`consent_requirement`/`approval_requirement`), `predicate (JSON-logic over buyer+parcel attributes)`, `effect` (`allow`/`conditional`/`prohibit`/`require`), `explanation_template`, `source_refs[] (statute/section/url)`, `confidence`.
- **Why JSON-logic predicates:** rules are *data*, hot-swappable, versioned, and auditable; the engine (Section F) evaluates predicate against a context object and returns explainable verdicts.
- **Events:** `pack.published/deprecated`, `rule.evaluated`.

### E.15 Signals: CourtCase, Encumbrance, Utility, Risk
Each is a typed observation with provenance, never a verdict.
- **Common signal fields:** `id`, `parcel_id`, `signal_type`, `payload (JSON)`, `source` (gov_portal/user_report/ai_inference/field), `source_ref`, `observed_at`, `confidence`, `severity`, `status` (active/resolved/disputed).
- **CourtCaseSignal:** `case_ref`, `forum`, `parties (masked)`, `status`, `matched_by` (name/survey/manual).
- **EncumbranceSignal:** `type` (mortgage/lien/charge), `holder (masked)`, `amount (O)`, `as_of`.
- **UtilitySignal:** `electricity`, `water`, `road_access`, `internet` booleans/quality.
- **RiskSignal:** umbrella for `area_mismatch`, `boundary_mismatch`, `seller_mismatch`, `duplicate_listing`, `suspicious_pricing`, `ownership_chain_gap`.
- **Events:** `signal.raised/resolved/disputed`.

### E.16 Market data: MarketComp, PriceHistory, DemandSignal
- **MarketComp:** `id`, `parcel_id (O)`, `admin_path_id`, `land_class`, `event_type` (ask/listed/reduced/reported_sale), `price`, `price_per_acre (C, normalized)`, `area`, `observed_at`, `source`, `confidence`.
- **PriceHistory:** time series of asking changes per listing/parcel.
- **DemandSignal:** derived from requirements/searches/leads per admin cell + land_class; powers heatmaps + scarcity reports.
- **Events:** `comp.recorded`, `price.changed`, `demand.aggregated`.

### E.17 SavedSearch, Offer/EOI
- **SavedSearch:** `id`, `user_id`, `query (facets+geo)`, `alert_channels[]`, `frequency`.
- **Offer/EOI:** `id`, `listing_id`, `buyer_id`, `amount (O)`, `conditions`, `status` (submitted/countered/accepted/declined/withdrawn), `expires_at`.
- **Events:** `offer.submitted/countered/accepted`.

### E.18 InternalOpportunity, DealScore
- **InternalOpportunity:** `id`, `parcel_id`, `sourced_by`, `thesis`, `watchlist_ids[]`, `stage` (sourced/screening/diligence/offer/closed/passed), `firewall_class` (always `internal`).
- **DealScore:** explainable composite (Section M) `{score, confidence, components{...}, model_version, computed_at}`.
- **Events:** `opportunity.sourced/stage_changed`, `dealscore.computed`.

### E.19 AuditLog, ConsentRecord
- **AuditLog:** append-only `{id, actor_id, actor_role, action, entity_type, entity_id, before_hash, after_hash, ip, ua, at}`. Internal PII access *always* logged.
- **ConsentRecord:** `{id, subject_user_id, purpose (enum), scope, granted_at, withdrawn_at, version_of_notice, lawful_basis}`. DPDP-aligned (Section Q).
- **Events:** `consent.granted/withdrawn`, `audit.entry` (sink to warehouse).

### E.20 AIAnswer, KnowledgeSource
- **AIAnswer:** `{id, assistant, prompt_hash, context_refs[], answer_md, citations[], confidence, jurisdiction_pack_version, model_version, human_reviewed (O), feedback (O), labeled_ai (true)}`.
- **KnowledgeSource:** `{id, kind (statute/guide/glossary/gov_doc), title, url/storage_key, jurisdiction_scope, version, embedding_status, chunk_count}` — the RAG corpus root.
- **Events:** `ai.answer_generated`, `ai.escalated`, `knowledge.indexed`.

### E.21 PropertyOffice/LocalOffice, SEOPage, Dataset/MarketReport
- **LocalOffice:** `{id, name, admin_path_id, geo, contact, gbp_ref (O), staff_ids[]}` — powers LocalBusiness schema + on-ground trust.
- **SEOPage:** `{id, page_type, target_entity_ref, slug, generated_at, data_snapshot_ref, index_directive, schema_blocks[]}`.
- **Dataset/MarketReport:** `{id, scope, period, metrics_snapshot_ref, download_formats[], schema_type: Dataset}`.

---

# SECTION F — INDIA-FIRST LEGAL & WORKFLOW DESIGN

The legal layer is a **source-linked, state-aware rules engine** driven by versioned Jurisdiction Packs (E.14). It never asserts title; it produces *explainable verdicts + checklists + sources + escalation*.

> **ASSUMPTION 8 — Rules are curated by humans, served by the engine.** Each LegalRule's `predicate`, `explanation_template`, and `source_refs` are authored/reviewed by `legal_associate` + `content_editor`, version-controlled, and dated. The AI legal assistant *retrieves and explains* these rules; it does not invent law (Section P).

### F.1 Jurisdiction engine (country → state → district)
- Resolution order: most-specific applicable pack wins; missing levels inherit upward. A parcel's `jurisdiction_pack_id` is resolved at write time and cached, but re-resolved if packs change (with effective-dating).
- A **context object** is assembled for every eligibility query:
```json
{
  "buyer": { "is_agriculturist": false, "domicile_state": "DL", "is_nri": false,
             "is_company": false, "existing_landholding_ha": 0.0, "is_sc_st": false },
  "parcel": { "land_class": "agri_land", "state": "KA", "district": "Mysuru",
              "area_ha": 2.0, "is_na_converted": false, "is_tribal_designated": false },
  "intent": "farmhouse"
}
```

### F.2 State-specific eligibility (illustrative rule set; authored per pack)
These are *modeled rule shapes*, dated and source-linked in the actual packs (the engine is the contract; the legal content is curated and must be kept current by the legal team):
- **Karnataka pack:** post-2020 amendments substantially relaxed who may purchase agricultural land; rule emits `allow` for most buyers with `conditional` caveats on ceiling limits and tribal/granted-land restrictions; `explanation_template` cites the relevant amendment and section.
- **Maharashtra pack:** historically restricts purchase of agricultural land by non-agriculturists; rule emits `conditional`/`require` (e.g., permission pathways, agriculturist proof) with caveats; surfaces the "who is an agriculturist" sub-rule.
- **Common cross-state rules:** tribal/scheduled-area transfer prohibitions, land-ceiling limits, fragmentation/consolidation constraints, tenancy-law shadows, and NA-conversion requirements before non-agri use.

> **ASSUMPTION 9 — We display verdicts as guidance with confidence + date + source, and always show "verify with local authority/lawyer."** Because state land law changes and varies by sub-region, every verdict carries `as_of` date and a "rules may have changed — confirm" affordance.

### F.3 Transfer restrictions, permissions, approvals
Modeled as `transfer_restriction`/`approval_requirement` rules. Output is a **checklist** (F.7) e.g.: agriculturist certificate, ceiling declaration, prior permission from revenue authority where applicable, NA-conversion order for non-agri use, no-objection in scheduled areas.

### F.4 Converted / non-agricultural distinction
`na_converted` parcels carry `conversion_order_ref` and a `conversion_confidence` score (from DocumentExtraction). The engine branches: NA-converted land typically removes agri-buyer-eligibility constraints but introduces zoning/use rules. The parcel page shows a clear "Agricultural" vs "NA-converted" banner with what changes for the buyer.

### F.5 Inheritance / family ownership paths
Workflow recognizes succession: when `seller_relationship = family_representative`, the system requires inheritance/partition evidence and maps the **ownership chain** (who→who via deed/inheritance/partition), computing `ownership_chain_completeness` (Section I). Gaps raise `ownership_chain_gap` RiskSignal.

### F.6 POA + co-owner / consent workflows
- **POA path:** requires POA document, validity window, scope check (does POA authorize sale?), and elevated scrutiny flag. POA-based listings cannot reach `transaction-ready` without legal review.
- **Co-owner consent:** for `joint_ownership`, each co-owner gets a consent task; `consent_completeness = consented / total_co_owners`. Below threshold caps the tier and shows a visible "consent incomplete" card.

### F.7 Checklist engine
A checklist is generated per `(land_class, intent, jurisdiction, seller_relationship)` tuple from rule effects. Example scenario "non-agriculturist buying NA-converted farmhouse plot in Karnataka" yields a tailored checklist (eligibility ✔, conversion order ✔ required, sale deed, latest RTC/mutation, EC/encumbrance check, tax receipts, identity, boundary/FMB). Checklists drive the Due-Diligence Room (Section G) and the buyer's "What to verify" card.

### F.8 Mutation & record-of-rights awareness
The system understands that post-sale **mutation** updates the record of rights; it surfaces "mutation pending/completed" as a parcel state and reminds buyers it's a critical post-transaction step. We track, where evidence exists, the latest RTC/7-12/mutation extract date as a freshness signal.

### F.9 Circle-rate / guideline-value references
Where guideline/circle-rate data is available per district (sourced/ingested), the parcel page shows guideline value alongside asking, computing an `ask_vs_guideline_ratio` (display + analytics). Where unavailable, we show "guideline value not available for this area."

### F.10 Encumbrance & litigation flags
`EncumbranceSignal`/`CourtCaseSignal` drive visible caveat cards and cap verification tier. Matching is fuzzy (name/survey-no) → always shown as "possible, unverified" until reviewed; never defamatory/definitive.

### F.11 Legal answer style (the assistant's contract)
Every legal answer renders these labeled blocks (Section P enforces it):
1. **What this means** — plain-language summary.
2. **Why it matters** — the buyer/seller consequence.
3. **What to verify** — concrete checks.
4. **What documents are typically needed** — from checklist engine.
5. **Likely next steps** — sequenced actions.
6. **Known exceptions / state-specific caveats** — from rules with `conditional`.
7. **Sources used** — KnowledgeSource + LegalRule `source_refs`, with `as_of` dates.

Plus a persistent, **helpful (not scary) disclaimer**: "This is verified guidance, not legal advice. Land law is state-specific and changes — confirm critical points with a local lawyer or the revenue office. [Talk to a verified expert →]". The escalation CTA routes to `legal_associate` (Section B.6).

---

# SECTION G — DOCUMENT & EVIDENCE SYSTEM

The Evidence Room is the trust engine's fuel. Principle: **every parcel claim links to a document, every document is hashed, versioned, extracted, validated, and permission-scoped.**

### G.1 Supported document types
Record of Rights / RTC / 7-12 / Khasra-Khatauni / mutation extract · sale deed · gift deed · inheritance/succession docs · partition records · tax receipts · utility bills · maps (FMB / tippon / sketch / cadastral extract) · possession evidence · KYC/identity · NOC / co-owner consent · encumbrance certificate · optional bank/auction docs. Each maps to a `DocumentType` (E.13) with an `expected_fields_schema`.

### G.2 Pipeline (per upload)
```
upload → virus scan → sha256 (dedupe + tamper-evidence) → store (object storage, server-side encrypted)
      → classify (DocumentType inference) → OCR (multilingual: en + regional scripts)
      → structured extraction (LLM + layout model → fields with bbox + confidence)
      → field validation (against DocumentType schema) → cross-doc consistency checks
      → evidence-chain linking → tier impact recompute → events
```

### G.3 Document intelligence specifics
- **OCR + structured extraction.** Hybrid: layout/OCR engine for text + spatial coords, then an extraction model maps to schema fields. Each field stored as `{value, confidence, bbox, page}`.
- **Confidence scoring.** Per-field + overall; below threshold → `extraction.low_confidence` → human review queue; never silently trusted.
- **Field-level validation.** e.g., survey number matches parcel identifier; area on RTC reconciles with declared/geometry area (tolerance band); owner name consistent across deed→mutation→RTC.
- **Cross-document consistency** raises `seller_mismatch` / `area_mismatch` / `ownership_chain_gap` signals.

### G.4 Versioning, hashing, evidence chain
- **Versioning:** new upload of same logical doc → `prev_version_id` chain; diffs surfaced.
- **Hashing:** sha256 at ingest; stored immutably; shown as tamper-evidence ("document fingerprint").
- **Evidence chain:** a parcel claim (e.g., "2.0 acres, owned by X") links to the specific document + extracted field + bbox that supports it. The parcel page's "every claim → evidence" UX (Section N) is powered here.

### G.5 Redaction, watermarking, permissioned sharing
- **Redaction rules:** auto-redact Aadhaar/PAN/phone/signatures in any *shared* copy via `redaction_profile`; raw retained only in secured store with audit-logged access.
- **Watermarking:** shared/downloaded copies watermarked with viewer identity + timestamp (deters leakage).
- **Permissioned sharing:** `permission_grants[]` — owner grants per-document, per-recipient, time-boxed, revocable access. Due-Diligence Room (below) is the UI.
- **Audit logs:** every view/download/share of a document is an AuditLog entry.

### G.6 Due-Diligence Room
- A permissioned space per parcel/listing where a verified buyer (or their lawyer) is granted scoped access to the evidence set.
- **Capabilities:** browse documents by checklist category (F.7), see extraction + validation status, see RiskSignals, request missing docs, and export a **DD Pack PDF** (Section N) — watermarked, with verification tier, evidence index, map, and source list.
- **Access control:** owner-granted, time-boxed, watermarked, fully audited; default masked PII; no bulk download without explicit grant.

---

# SECTION H — GEOSPATIAL SYSTEM

> **Core stance:** we own a **canonical geometry layer** in PostGIS. Provider maps (Google, Bhuvan, state GIS) are *layers and tools*, never our source of truth. A **Source Registry** records where each spatial layer came from, its license, and attribution; adapters are **licensing-aware** so we never persist what a provider forbids.

### H.1 Storage & core ops (PostGIS)
- Geometries in `geometry(MultiPolygon, 4326)`; `geography` for distance; GiST indexes.
- **Area:** `ST_Area(geom::geography)` → m² → display in jurisdiction units (acre/guntha/cent/bigha/hectare).
- **Centroid / point-on-surface:** `ST_PointOnSurface` (guaranteed inside).
- **Validity:** `ST_IsValid` + `ST_MakeValid` on ingest.

### H.2 Boundary lifecycle: draw, upload, edit, compare
- **Draw:** MapLibre + Mapbox-GL-draw-style editor on satellite basemap; snapping; vertex edit.
- **Upload:** KML/KMZ/GeoJSON/Shapefile import → validate → ParcelGeometry `proposed`.
- **Edit:** versioned; old geometry `superseded`.
- **Compare:** overlay declared-vs-document-vs-drawn; show `ST_Difference`/area delta; this is the **area reconciliation** UX.

### H.3 Context & analytics
- **Access-road signal:** nearest road via routing/OSM-derived layer; distance + road class.
- **Settlement context:** nearest village/settlement, distance to growth node.
- **Discrepancy handling:** map area vs document area beyond tolerance → `area_mismatch` (severity scaled by %); boundary self-intersection or implausible shape → `boundary_mismatch`.
- **Overlap / duplicate detection:** `ST_Intersects` + `ST_Area(ST_Intersection)/ST_Area` ≥ threshold across parcels → `DUPLICATE_LISTING` / `geometry overlap` signal (catches the same land listed twice).
- **Proximity analytics:** distance to highway/substation/water body/town — feeds suitability scores (Section M).
- **Clustering / heatmaps / hotspots:** server-side `ST_ClusterDBSCAN` for supply clusters; demand heatmap from BuyerRequirement `geo_scope`; hotspot score = f(demand density, supply scarcity, liquidity).
- **Geofenced alerts:** users/agents/internal set polygons → notified on new listing/price-cut/requirement inside.
- **Route/access estimation:** isochrones from town centers `[GROWTH]`.

### H.4 Map layers & viewing
- Vector tiles for our parcels (self-hosted, e.g. tile server over PostGIS).
- Satellite/terrain basemaps via provider abstraction.
- Admin boundary layer (E.4) toggle.
- Historical imagery hooks where the provider's license permits (adapter-gated).
- Bhuvan-compatible / public-raster overlays as *view-only* layers (no persistence beyond cache where license forbids).

### H.5 Export
- KML / GeoJSON export of owned geometry; **PDF map pack** (parcel polygon on satellite + scale + centroid + admin context + attribution + verification tier) for DD packs and offline/low-bandwidth sharing.

### H.6 Provider abstraction layer
```ts
interface GeoProvider {
  geocode(q: string, bias?: BBox): Promise<GeoResult[]>;       // place search ≠ parcel truth
  reverseGeocode(p: LngLat): Promise<AdminContext>;
  basemapStyle(kind: 'satellite'|'terrain'|'streets'): StyleSpec;
  staticMap(req: StaticMapReq): Promise<ImageRef>;             // for share/PDF
  license(): LicenseInfo;                                      // persistence + attribution rules
  capabilities(): { historicalImagery: boolean; tiles: boolean };
}
```
Concrete adapters: `GoogleMapsProvider` (geocoding/place search/static maps/Earth-style UX), `BhuvanRasterProvider` (view overlays), `StateGisProvider` (per-state, where layers are publicly available), `OsmProvider` (roads/routing fallback). The **Source Registry** persists `{layer_id, provider, license, attribution_text, persist_allowed, cache_ttl}`.

> **Critical separation — place search vs parcel truth.** Geocoding a village name gives an *approximate location for navigation/centering*. It is **never** written as parcel geometry. Parcel truth comes only from drawn/uploaded/survey/gov-layer geometry, tagged with `accuracy_class`. The UI labels approximate locations distinctly from verified boundaries.

### H.7 Caching & licensing-aware boundaries
- Cache tiles/geocodes per provider TTL and only where license permits persistence.
- Attribution rendered on every map and exported asset per Source Registry.
- If a provider forbids storing derived data, the adapter marks results `ephemeral` and they're never written to canonical tables.

---

# SECTION I — VERIFICATION, TRUST, RISK & SAFETY

Trust is **visible, tiered, and earned through evidence**. Tiers are monotonic gates; each requires the prior plus new evidence.

### I.1 Verification tiers (ladder)
| Tier | Requirement | Visible badge |
|---|---|---|
| `basic` | listing exists, passed moderation | grey |
| `phone-verified` | seller/agent phone OTP verified | blue dot |
| `kyc-verified` | seller/agent KYC passed | blue check |
| `relationship-verified` | SellerRelationshipToParcel evidence verified | "Owner verified" |
| `parcel-verified` | identifier ↔ geometry ↔ admin reconciled; no blocking signals | green "Parcel verified" |
| `geo-verified` | boundary drawn/uploaded + area reconciled within tolerance | map-pin check |
| `document-pack-verified` | core doc checklist present, extracted, validated | doc-stack check |
| `field-inspected` | field verifier confirmed boundary + condition on-site | camera check |
| `transaction-ready` | doc pack + relationship + no blocking signals + (POA/co-owner cleared) | gold "Transaction-ready" |
| `premium-trusted` `[TRUST+]` | transaction-ready + legal review + freshness SLA maintained | gold star |

> **ASSUMPTION 10 — Tiers can be partially parallel.** `geo-verified` and `document-pack-verified` are independent gates that both feed `transaction-ready`. The UI shows a *progress ladder*, not a single number, so sellers know exactly what's missing.

### I.2 Trust badges & where they appear
On search cards, parcel pages, listing pages, agent profiles, share cards, DD packs, and in API responses. A single source of truth (`verification_tier (C)`) renders everywhere — "verification status visible everywhere" is enforced by making the badge a shared component bound to that field.

### I.3 Verification queue + SLA engine
- Cases enter a queue routed by `task_type` (auto-checks first, humans for the rest).
- **SLA engine:** per task type, deadlines + escalation; breaches alert admins and degrade reviewer score. Field jobs route to nearest verifier (Section H proximity).

### I.4 Risk & fraud signals (all from Section E.15)
- `area_mismatch` (doc vs geometry vs declared), `boundary_mismatch`, `seller_mismatch` (name across docs), `duplicate_listing` (geometry/identifier overlap), `suspicious_pricing` (>k σ from local comps — Section M), `ownership_chain_gap`, `encumbrance/litigation` flags.
- **Severity → effect:** blocking signals cap tier (e.g., active litigation caps below `transaction-ready` and shows permanent caveat); soft signals warn but don't block.

### I.5 Composite scores
- **ownership_chain_completeness** = verified links in chain / required links (deed→inheritance→partition→current). 
- **agent_quality_score** = f(response SLA, listing accuracy, dispute rate, closed deals, reputation) — Section M formula.
- These are explainable `{value, components, confidence}` objects.

### I.6 Safety: contact, meetings, spam
- **Safe contact masking:** phone/email masked; communication via in-app/relay; reveal only after both-party consent + lead acceptance.
- **Lead spam prevention:** rate limits, risk scoring on buyer accounts, OTP gates, honeypot detection; suspicious leads quarantined.
- **Safe meeting/visit workflow:** suggested public/safe meeting guidance, share-trip-with-contact, scheduled visits logged, optional field-verifier accompaniment for high-value.
- **Visit verification:** geo-tagged check-in confirms the visit happened at the parcel; feeds field-inspection evidence.

### I.7 Field verifier mobile workflow
Accept job → offline-capable map to parcel → guided checklist (stand at corners, capture geo-tagged photos/video, confirm/adjust boundary, note access/utilities/condition) → submit → auto area-recon → reviewer approves → tier promotes. Designed low-bandwidth, large-tap-target, vernacular.

### I.8 Internal reviewer tooling
Side-by-side: documents + extractions + geometry overlay + signals + checklist; one-click pass/fail/needs-more with reason codes; bulk actions; full audit. Reviewer decisions train extraction-confidence thresholds over time.

---

# SECTION J — DEMAND CAPTURE

Demand is a first-class product, equal to supply. The primary business goal — *capture real buyer demand region-wise* — lives here.

### J.1 "I want to buy land" flow
A 60-second, mobile-first wizard producing a `BuyerRequirement` (E.8):
1. **Intent** (farming / farmhouse / investment / development / institutional) — sets defaults downstream.
2. **Where** — draw on map *or* pick admin levels (state→district→taluka→village multi-select). Stored as polygon ∪ admin_ids.
3. **How much** — budget band + price basis preference.
4. **How big** — acreage band.
5. **What kind** — land_classes multi-select, irrigation pref, access-road requirement, farmhouse-vs-farming, development intent.
6. **When + readiness** — time horizon, financing readiness (self/loan/sold-other-asset).
7. **Verify me** `[GROWTH]` — optional buyer KYC → `verified_buyer` badge (gets priority routing + access to DD rooms faster).

### J.2 Saved searches, alerts, notifications
- SavedSearch (E.17) with alert frequency + channels: **in-app, email, WhatsApp** (Section R adapter), SMS fallback.
- Alert triggers: new match, price drop, verification upgrade, new listing in geofence.
- WhatsApp-first because rural/peri-urban buyers live there; templates pre-approved; opt-in + consent recorded.

### J.3 Reverse matching (demand → supply)
- A matcher runs requirement.geo_scope ∩ live listings, filtered by land_class/budget/acreage/irrigation, ranked by relevance + verification tier + freshness.
- Runs on requirement creation (instant results) and continuously (new listings → notify matched buyers). Match writes a `Lead(source=requirement_match)` only on buyer action (privacy-preserving — no auto-blasting seller PII).
- **Match relevance score** = weighted geo-fit + price-fit + size-fit + class-fit + irrigation-fit; explainable ("matches because: within your area, ₹/acre in band, irrigated as preferred").

### J.4 Demand intelligence (the moat)
- **Demand heatmaps:** aggregate requirement density per admin cell × land_class → visible to sellers/agents ("buyers are searching here") and to internal teams.
- **Demand scarcity reports:** cells with high demand + low verified supply = `[GROWTH]` seller-acquisition targets and internal-acquisition targets.
- **Internal demand dashboards:** region-wise demand capture rate, conversion, willingness-to-pay bands — the core asset for Bhūmi's commercial strategy. All consent-aware + aggregated where surfaced to internal teams.

### J.5 Why this beats "contact form" demand capture
Structured + mappable + matchable + consented demand becomes (a) instant buyer value, (b) seller acquisition signal, (c) market intelligence, (d) reverse-match supply discovery. A contact form gives none of that.

---

# SECTION K — AGENT, BROKER & PARTNER ECOSYSTEM

The best agent tools in the category — agents stay because Bhūmi makes them money and makes them look professional.

### K.1 Onboarding & verification
- **Agent onboarding:** profile → KYC (identity) → optional RERA/registration no. → territory setup (admin + polygons) → specialties (land_classes) → first listing.
- **Agency onboarding:** business KYC → owner account → invite sub-agents (role-based) → microsite slug `[GROWTH]`.
- Verification gates badges; unverified agents have capped lead access.

### K.2 Inventory tooling
- **Bulk/CSV import** with a mapping UI (their columns → our schema) + validation + dedupe (against existing parcels by identifier/geometry).
- **Media upload tools** (drag-drop, drone/360, auto-watermark, EXIF privacy).
- **WhatsApp listing-share tools:** one-tap generate a share card (parcel image + key facts + verification tier + link) → send to clients/groups; tracks attribution.

### K.3 Lead & CRM
- **Lead inbox** with SLA timers (response score depends on it).
- **Lead routing:** territory ∩ specialty ∩ availability, weighted by response score + reputation; co-broke pool for shared inventory; round-robin fallback; partner-attributed leads tagged.
- **Pipeline (kanban):** new→contacted→qualified→visit→negotiation→won/lost; drag to advance.
- **CRM notes / tasks / reminders**, **call summaries** (AI-assisted, Section P), **follow-up automation** (sequences via WhatsApp/email/SMS, consent-gated).
- **Response SLA tracking** feeds reputation + routing.

### K.4 Co-brokerage, referral, payouts
- **Co-broke workflow:** list as co-broke %, accept partners, shared lead access, split tracking.
- **Referral tracking:** unique links, attribution to Lead, conversion view.
- **Payout/commission tracking:** ledger of earned/pending/paid; escrow-partner-ready (Section R) — *we don't custody funds in MVP; we track and integrate*.

### K.5 Reputation & ranking
- **activity_score** + **agent_quality_score** (Section M) → ranking that affects routing + search placement of their listings (quality-weighted, never pay-to-fake-rank). Visible reputation builds buyer trust.

### K.6 Presence & growth
- **Profile pages** (ProfilePage schema, Section O) + **agency pages** + **agent/agency landing pages** with their verified inventory + reputation + territory.
- **White-label microsite** `[GROWTH]` — agency's branded subdomain over our inventory + CRM.
- **Role-based sub-accounts** + **team performance dashboard**.
- **Agent education center** + **best-practice playbooks** (how to verify, how to get to transaction-ready faster, how to respond) — raises overall supply quality and retention.

---

# SECTION L — INTERNAL SALES & ACQUISITION COMMAND CENTER

A powerful internal OS for Bhūmi's own sales + acquisition teams, built on **first-party, consent-aware data**, with **RBAC/ABAC, audit trails, and explainable scores** (ASSUMPTION 1 firewall enforced).

### L.1 Unified lead queue + enrichment
- All inbound (listing contacts, requirement matches, SEO leads, WhatsApp, referrals) into one queue, deduped by person/parcel.
- **Enrichment from first-party signals:** prior searches, saved parcels, requirement details, visit history, engagement recency — *only* data the user provided/consented to. No third-party data brokering.

### L.2 Scoring suite (all explainable — Section M)
- **buyer_intent_score** — recency/frequency of intent actions + requirement completeness + financing readiness.
- **seller_motivation_score** — price cuts, time-on-market, distress flags, responsiveness.
- **parcel_readiness_score** — verification tier + doc completeness + signal cleanliness.
- **agent_reliability_score** — SLA + dispute + close rate.
- **opportunity_score / DealScore** — composite for acquisition (Section M).

### L.3 Acquisition intelligence
- **Watchlists** (saved cohorts of parcels/clusters).
- **Alerts:** price-reduction, long-time-on-market, **low-competition-high-demand** parcels (demand heatmap ∩ scarce supply), new contiguous-assembly opportunities.
- **District & cluster dashboards:** supply/demand/price/liquidity per micro-market.
- **Parcel 360 / User 360:** every signal, doc (permission-scoped), score, history in one view (PII access audit-logged).

### L.4 Sales operations
- Task assignment, call logs, meeting notes, visit scheduling, internal comments.
- **Funnel + conversion + cohort + territory analytics**, **team leaderboards**, **revenue attribution**, **pipeline forecasting** (weighted by stage probabilities).
- **Deal-room handoff:** qualified opportunity → structured deal room (parties, docs, checklist, status) → close.
- **Exportable reports** (CSV/PDF/scheduled).

### L.5 Governance baked in
- **RBAC/ABAC:** `internal_sales` and `internal_acq` see only consented PII; `internal_acq` is further restricted to aggregate/public/consented signals (firewall).
- **Audit trails:** every internal touch on a lead/parcel/doc logged (E.19).
- **Explainable scores:** every score shows its components + confidence + model version, so reps trust and can challenge them.
- **Opportunity surfacing:** the command center's job is to surface *real* acquisition opportunities for Bhūmi Capital while keeping the marketplace fair and the data lawful.

---

# SECTION M — MARKET INTELLIGENCE & GOOD-DEAL DISCOVERY

All scores are stored as `{value ∈ [0,1] or band, confidence ∈ [0,1], components{...weights}, inputs[], model_version, computed_at}` and are **explainable** (the UI can render "why this score"). Where public data is thin, we use **fallback + confidence decay** so a score is never silently overconfident.

### M.1 Normalization primitives
- **price_per_acre** = `asking_total / area_acres` (convert all area units → acres via jurisdiction unit table). For per-sqft inputs, convert via 1 acre = 43,560 sqft. Store both `price_per_acre` and `price_per_sqft`.
- **local comp set** = MarketComps within same admin cell (taluka→fallback district) + same/adjacent land_class + within recency window (default 18 months, decaying weight). Minimum n for confidence; below it, widen geography and lower confidence.

### M.2 Score definitions & formulas
Each is a weighted, bounded combination; weights are config (per jurisdiction, tunable). Defaults shown.

- **parcel_quality_score** = `0.25·water + 0.20·access + 0.20·soil/terrain_fit + 0.15·shape_regularity + 0.20·utility_presence`. Inputs from UtilitySignal, geometry (shape via `ST_Area/ST_Perimeter` compactness), land_class fit.
- **legal_complexity_score** (higher = more complex/risky) = `0.30·litigation + 0.25·ownership_chain_gap + 0.20·poa_or_joint + 0.15·conversion_ambiguity + 0.10·encumbrance`. Drives caveats + tier caps.
- **liquidity_score** = `0.40·local_demand_density + 0.25·historical_time_to_offmarket + 0.20·comp_volume + 0.15·verification_tier`. How fast it could sell.
- **time_on_market** = days since `listing.published` (live). **listing_freshness_score** decays with staleness + rewards recent owner activity/updates.
- **demand_supply_imbalance** = `z(local_demand_density) − z(local_verified_supply_density)` per cell×class. Positive = under-supplied (good for sellers/internal acquisition).
- **urgency_indicator** = f(distress flag, price-cut magnitude & frequency, deadline). 
- **potential_undervaluation_score** = `clamp((local_median_ppa − parcel_ppa) / local_median_ppa, 0, 1)` adjusted by `parcel_quality_score` (so cheap-because-bad isn't flagged undervalued) and `legal_complexity_score` (discount for risk). **Confidence** scales with comp volume.
- **infrastructure_proximity_score** = decayed distances to highway/town/substation/water/airport (per intent: solar weights substation, logistics weights highway, farmhouse weights town+scenery).
- **terrain/soil/water suitability hooks** = pluggable; consume external soil/rainfall/water-table layers when available, else mark `data_unavailable` + neutral prior.
- **agent_quality_score** = `0.30·response_sla + 0.25·close_rate + 0.20·listing_accuracy + 0.15·(1−dispute_rate) + 0.10·tenure`.
- **buyer_intent_score / seller_motivation_score / parcel_readiness_score / agent_reliability_score** — as Section L, formulas analogous (RFM-style for intent; signal-driven for motivation; tier+docs+signals for readiness).
- **DealScore (internal_attractiveness)** = `0.30·potential_undervaluation + 0.25·liquidity + 0.20·parcel_quality + 0.15·(1−legal_complexity) + 0.10·demand_supply_imbalance`, gated to ≥ confidence threshold before surfacing to acquisition desk.

### M.3 Explainability & confidence model
- Every surfaced score renders top contributing components and the data behind them.
- **Confidence** = f(input completeness, comp volume, data recency, source reliability). Low confidence → shown as "indicative" with a wider band and a "needs verification" nudge, never as a hard number.
- **Fallback hierarchy** for sparse data: taluka comps → district comps → state×class priors → "insufficient data" (suppress score rather than fabricate).

### M.4 Surfaces
- **Micro-market trend pages** (also SEO, Section O): price/acre trend, demand index, supply count, liquidity, top searched classes — per village/taluka/district.
- **Price trend dashboards** + **map-based market monitor** (choropleth of ppa, demand, imbalance).
- **Investable cluster detection** (`ST_ClusterDBSCAN` over high-DealScore parcels) → internal watchlist recommendations.

---

# SECTION N — UX & DESIGN SYSTEM

**Principles:** map-first · mobile-first · low-bandwidth-friendly · multilingual-ready · simple data entry · progressive disclosure · trust-first · high clarity · excellent empty states · WhatsApp-friendly sharing · verification clarity everywhere · quick comparison · printable/shareable DD packs.

### N.1 Information architecture (top nav)
`Explore (map+list)` · `Buy land (post requirement)` · `Sell / List` · `For Agents` · `Market & Reports` · `Learn (legal guides/glossary)` · `Account`. Internal & operator apps live under separate authenticated shells.

### N.2 Page map (public)
- **/** home (search box → map, trust pitch, top clusters, market teaser)
- **/explore** map-first search (split map + cards; facets; draw-to-search)
- **/parcel/[id]** & **/listing/[slug]** parcel/listing detail (the hero surface)
- **/buy** requirement wizard · **/requirements/[id]** buyer requirement page
- **/sell** listing wizard
- **/agents/[slug]**, **/agency/[slug]** profiles
- **/markets/[admin-path]** micro-market pages · **/reports/[id]** dataset/report pages
- **/learn/[guide]**, **/glossary/[term]**, **/eligibility** (the viral checker)
- **/offices/[id]** local office pages

### N.3 Search IA
Split-view: **map (primary)** + result cards (secondary); facets = land_class, area band, price band, verification tier (default-on "verified only" toggle), irrigation, access, freshness; **draw-polygon-to-search**; cluster pins zoom to parcels; "no results" → demand-capture CTA ("Tell us what you want → we'll find it").

### N.4 Parcel page (the most important screen)
Sections, top-to-bottom, mobile-stacked:
1. **Hero:** map with the actual polygon on satellite + verification tier badge + key facts (area, ppa, land_class, location).
2. **Eligibility card:** "Can you buy this?" — personalized verdict + caveats + sources (Section F.11), with a sign-in nudge to personalize.
3. **Area reconciliation:** declared vs document vs map, with visual + tolerance verdict.
4. **Evidence & trust:** the verification ladder (what's done / what's missing) + every claim → evidence link.
5. **Legal requirement cards:** checklist for *your* scenario.
6. **Signals/caveats:** litigation/encumbrance/risk (honest, non-defamatory, "possible/unverified" where uncertain).
7. **Market context:** ppa vs local median, trend, liquidity, undervaluation (indicative).
8. **AI parcel explainer:** plain-language summary (labeled AI, sourced).
9. **Contact/visit:** masked contact, schedule visit, request DD room access, make offer/EOI.
10. **Share:** WhatsApp share card + PDF map pack + DD pack (if granted).

### N.5 Other key flows/screens
- **Listing creation wizard** (claim/draw parcel → details → docs → choose tier → preview → publish) with progressive disclosure + inline validation + "get to transaction-ready" progress.
- **Due-diligence room** (checklist-categorized docs + statuses + export).
- **Buyer requirement page** (editable, match list, alerts).
- **Agent dashboard** (lead inbox + pipeline + inventory + SLA + reputation).
- **Sales dashboard / Admin dashboard / Market dashboard** (internal shells).
- **Legal assistant panel** (right-rail/drawer with the 7-block answer format).
- **Share cards** (1200×630 OG + WhatsApp 1:1) and **PDF report layouts** (DD pack, map pack, market report).

### N.6 Design tokens & component library
- **Tokens:** color (trust greens, caution ambers, neutral earth tones; semantic — `--trust`, `--caution`, `--danger`, `--surface`, `--ink`), spacing scale (4px base), radius, typography (system + Indic-script-capable fonts), elevation, motion (reduced-motion aware).
- **Components:** `TrustBadge`, `VerificationLadder`, `ParcelMap`, `AreaReconciliation`, `EligibilityCard`, `EvidenceLink`, `LegalAnswerBlock`, `FacetBar`, `ListingCard`, `RequirementWizard`, `LeadInbox`, `PipelineKanban`, `ScoreExplainer`, `ShareCard`, `EmptyState`, `LangSwitcher`. Built on a headless+Tailwind system (Section S), documented in Storybook.
- **Low-bandwidth:** lazy maps, static-map fallback, image compression, skeletons, offline-tolerant field app (PWA + service worker).
- **Multilingual:** i18n keys, RTL-ready, Indic scripts; content (guides) localizable; language switcher persists.

---

# SECTION O — PUBLIC PAGES & SEO ARCHITECTURE

> **North star for SEO:** genuinely useful pages backed by real data — *no thin pages*. Every programmatic page carries unique data + map + filters + user value, and **schema matches visible content** exactly. We deliberately **do not rely on FAQ rich-result tactics** (their eligibility is now restricted) and instead invest in **QAPage, ProfilePage, LocalBusiness, Organization, Dataset, BreadcrumbList, ImageObject** and Place/RealEstateListing where the visible content supports it.

### O.1 Rendering strategy
- **SSG/ISR** for location/market/guide/profile pages (regenerate on data change via on-demand revalidation + scheduled ISR).
- **SSR** for personalized/search/eligibility-result pages.
- **CSR islands** for the map.
- Next.js App Router; per-route caching directives.

### O.2 URL design (clean, hierarchical, stable)
```
/explore
/markets/{state}/{district}/{taluka}/{village}
/{state}/farmland-for-sale            (class × geo landing)
/{state}/{district}/orchards-for-sale
/farmhouse-land/{state}/{district}
/parcel/{ulpin-or-id}
/listing/{slug}
/agents/{slug}  /agency/{slug}  /offices/{slug}
/learn/{guide-slug}  /glossary/{term}
/reports/{report-slug}
/eligibility   /eligibility/{state}
```
Canonical = self for unique pages; faceted combinations canonicalize to the nearest indexable parent (O.5).

### O.3 Sitemaps
- Sitemap **index** → per-type child sitemaps (listings, parcels, markets, agents, guides, reports), each ≤50k URLs, `lastmod` accurate, regenerated on publish; large types paginated. Submitted via Search Console; news/image sitemaps where relevant.

### O.4 Metadata, OG, image SEO
- Per-page unique `<title>`/`<meta description>` from data templates (never duplicated).
- **Open Graph + Twitter cards** with generated map/parcel images (1200×630).
- **ImageObject** schema for parcel/listing media with captions, geo, license; descriptive alt text; responsive `srcset`; lazy-load; CDN-served WebP/AVIF.

### O.5 Faceted navigation & crawl control
- **Indexable facets:** geo levels, land_class, "verified only" — i.e., facets that map to genuine demand and durable inventory.
- **Non-indexable facets:** sort orders, ephemeral price sliders, multi-select combinatorial explosions → `noindex` or `rel=nofollow` + canonical to base, and excluded from sitemaps.
- **Pagination:** self-canonical paginated pages with `rel=next/prev` semantics handled via clean URLs (`?page=`), or load-more with crawlable links; never canonical page 2→1.
- **Crawl-budget controls:** robots rules for operator/internal/auth areas; parameter handling; low-value/empty pages get `noindex` until they cross a data-richness threshold (e.g., ≥N listings or ≥N comps). **Indexation guardrail:** a page is only indexable if it passes a "usefulness gate" (has unique data + map + ≥ threshold content).

### O.6 Schema strategy (match visible content)
- **Organization** (site-wide) + **LocalBusiness** (each LocalOffice with NAP, geo, hours).
- **ProfilePage** for agent/agency pages (with the person/org + their verified inventory).
- **QAPage** for genuine Q&A pages (real questions + answers shown on page).
- **Dataset** for market reports (with distribution/downloads).
- **BreadcrumbList** everywhere; **ImageObject** for media.
- **RealEstateListing/Place** for listings *only where the visible page mirrors the markup*.
- Validated in CI against schema.org + Search Console enhancement reports.

### O.7 Programmatic landing templates (data-backed)
Each template injects unique data so pages aren't thin:
- **Village/Taluka/District market pages:** live supply count, median ppa, price trend sparkline, demand index, top land_classes, map with parcels, "post requirement" CTA, related localities, recent verified listings.
- **Class × geo pages** ("orchards for sale in Nashik"): filtered inventory + class explainer + local price band + map.
- **Crop-specific land pages** (vineyard/areca/mango belts), **irrigation-type pages** (canal/borewell/drip), **farmhouse-specific pages** — each with genuinely distinct data + guidance.

### O.8 Content hubs & authority
- **Legal guide library** (state-wise eligibility, conversion, mutation, POA, inheritance) — the authority engine; source-linked, dated, expert-reviewed.
- **Glossary** (RTC, 7-12, khasra, gut, mutation, EC, NA, ULPIN…).
- **Q&A pages** built from real user/legal-assistant questions (QAPage).
- **Market reports / datasets** (district price reports, demand maps) — PR + backlink magnets (Dataset schema).
- **Internal linking:** hub→spoke (guide↔glossary↔market↔listing↔parcel), breadcrumb trails, "related localities/classes," contextual links from guides to relevant inventory.

### O.9 Multilingual SEO
- `hreflang` for en + regional languages; localized slugs where appropriate; one canonical per locale; localized content for high-value hubs first.

### O.10 Local & GBP strategy
- **Google Business Profile** for each LocalOffice (NAP consistent with LocalBusiness schema), field-team service-area listings where applicable; reviews funnel; office pages cross-link to local market pages.

---

# SECTION P — AI SYSTEMS

**Global AI doctrine:** every assistant is RAG-grounded, source-linked, jurisdiction-aware, clearly labeled as AI where it faces users, conservative on legal/financial claims, logged (`AIAnswer`, E.20), and has a human-escalation path. No assistant asserts legal title or gives definitive legal/financial advice; they explain evidence + curated rules + sources.

### P.0 Shared architecture
- **RAG:** KnowledgeSource corpus (statutes/guides/glossary/gov docs) + structured parcel/evidence context → retrieval over **pgvector** (hybrid: BM25/full-text + vector) → assembled prompt → model → post-processor enforces answer schema + citation presence → moderation → store `AIAnswer`.
- **Jurisdiction selection:** the parcel's resolved JurisdictionPack version pins which LegalRules + content chunks are eligible for retrieval; answer records the pack version so it's reproducible.
- **Citation strategy:** answers must cite KnowledgeSource chunk ids / LegalRule source_refs; the post-processor **rejects** legal/eligibility answers lacking citations and forces a "I can't confirm — talk to an expert" fallback.
- **Confidence handling:** model + retrieval confidence → if low, downgrade to "indicative" and surface escalation.
- **Refusal/escalation:** out-of-scope, high-risk, or low-confidence → refuse with a helpful redirect + human handoff (legal_associate / surveyor / support).
- **Audit logging + labeling:** all outputs stored with prompt_hash, context_refs, model_version; user-facing outputs badged "AI-generated, source-linked."
- **Moderation:** input + output passed through safety + PII + legal-risk filters (Section Q).

### P.1 Buyer assistant
- **Purpose:** help buyers find & understand parcels, explain eligibility, compare options. **Sources:** listings, parcel evidence, market context, legal rules. **Answer:** conversational + parcel cards + "why it matches." **Refusal:** no investment guarantees; routes valuation questions to "indicative" framing. **UI:** Explore + parcel page drawer.

### P.2 Seller assistant
- **Purpose:** guide listing creation, suggest missing docs to raise tier, draft descriptions. **Sources:** checklist engine, the seller's own docs/extractions. **Action-oriented:** "add the mutation extract to reach document-pack-verified." **UI:** listing wizard.

### P.3 Listing creation assistant
- **Purpose:** turn a few inputs (+ uploaded docs) into a structured draft listing; auto-fill from DocumentExtraction (area, survey no, owner) with confidence and human confirm. **Guardrail:** never auto-publishes; seller confirms every extracted field.

### P.4 Legal assistant (flagship)
- **Purpose:** answer eligibility/process/document questions in the strict 7-block format (Section F.11). **Sources:** ONLY published JurisdictionPack LegalRules + KnowledgeSource; **no ungrounded generation.** **Citation:** mandatory, with `as_of` dates. **Refusal:** anything beyond curated scope → "this needs a local lawyer" + escalation. **Labeling:** "Verified guidance, not legal advice." **UI:** /eligibility, parcel page, drawer.

### P.5 Document explainer
- **Purpose:** explain what an uploaded document is, what its fields mean, and what's missing/inconsistent. **Sources:** DocumentExtraction + DocumentType schema + glossary. **Conservative:** flags low-confidence extractions rather than guessing.

### P.6 Parcel summary generator
- **Purpose:** plain-language parcel summary from evidence + signals + scores. **Sources:** parcel graph only. **Labeled AI; every sentence backed by an evidence/score reference.**

### P.7 Agent assistant
- **Purpose:** draft follow-ups, summarize calls, suggest next-best-action, prioritize leads. **Sources:** agent's CRM data (their own). **Action-oriented**, consent-gated for any buyer-facing message (Section R/Q).

### P.8 Internal sales copilot
- **Purpose:** prioritize the unified queue, explain scores, draft outreach, summarize Parcel/User 360. **Sources:** first-party consented data behind the firewall. **Audit:** every copilot action logged; PII access recorded.

### P.9 Acquisition insight assistant
- **Purpose:** explain DealScores, surface clusters, narrate "why this is an opportunity" for Bhūmi Capital. **Sources:** aggregate/public/consented signals only (firewall). **Conservative on valuation;** always shows confidence + comps.

### P.10 Support bot
- **Purpose:** product help, deflect FAQs, route to humans. **Sources:** help content. **Hands off** anything legal/transactional to the right human or specialized assistant.

### P.11 Prompt architecture (template shape)
System prompt per assistant = role + strict scope + answer schema + citation requirement + refusal rules + jurisdiction pin + safety rules. (Concrete templates in Section V.)

---

# SECTION Q — MODERATION & COMPLIANCE

Designed around **India DPDP Act 2023**, consent, retention, auditability, and intermediary-safe-harbour-aware governance, extensible to other regimes `[INTL]`.

### Q.1 Content & listing moderation
- **Listing moderation:** automated pre-checks (PII in description, profanity, duplicate via identifier/geometry, implausible price/area) → `pending_moderation` → human queue for flagged → publish/reject with reason. Post-publish reporting + re-review.
- **Media moderation:** NSFW/irrelevant/again-PII scan; watermarking; EXIF privacy.
- **AI-output moderation:** every user-facing AI answer passes safety + legal-risk + PII filters; legal answers without citations are blocked; harmful/unsafe content suppressed.
- **Legal-risk moderation:** no defamatory ownership/litigation assertions; uncertain signals shown as "possible/unverified."

### Q.2 Dispute handling
- Disputes (ownership, duplicate, misrepresentation) open a case → relevant signals set `disputed` → tier capped → routed to admin/legal → resolution + audit. Listings can be paused pending resolution.

### Q.3 Privacy, consent, DPDP alignment
- **Consent capture:** purpose-specific ConsentRecords (marketing, WhatsApp, lead-sharing, KYC) with notice version + lawful basis; granular, withdrawable.
- **Privacy notices:** layered notice; clear "who sees your contact and when."
- **Access controls:** RBAC/ABAC (Section S); PII masked by default; reveal gated + logged.
- **DSR-ready architecture:** data mapped to subjects; export + correction + erasure pipelines; erasure cascades through soft-delete → hard-delete job with audit + dependency handling (legal-hold exceptions).
- **Grievance handling:** named grievance officer flow, SLA-bound, tracked.
- **Data retention policy:** per data class TTLs (e.g., raw KYC minimal retention, audit logs long-retention, marketing data until withdrawal); automated retention jobs.

### Q.4 AI labeling & provenance
- All AI content labeled; `AIAnswer` retains provenance (sources, model, prompt hash). Generated images (e.g., map renders) carry provenance metadata. Human-reviewed AI outputs flagged as such.

### Q.5 Safe-harbour-aware governance + incident response
- Notice-and-takedown workflow, repeat-offender policy, transparency logging.
- **Logging & incident response:** centralized audit + security logs; incident runbooks; breach-notification workflow; MTTR tracked.

---

# SECTION R — INTEGRATION STRATEGY

Everything external is a **replaceable adapter** behind a stable interface, with **retry policy, rate limits, audit logging, secrets handling, fallback, and a mock implementation** for dev/test. No business logic calls a vendor SDK directly — only adapters.

### R.1 Adapter contract (every integration implements)
```ts
interface Adapter<Req, Res> {
  name: string; version: string;
  call(req: Req, ctx: AdapterCtx): Promise<Result<Res>>;   // typed Result, never throws raw vendor errors
  healthCheck(): Promise<HealthStatus>;
  capabilities(): Capabilities;
  rateLimit: RateLimitPolicy;        // token-bucket per provider
  retry: RetryPolicy;                // exp backoff + jitter, idempotency keys
  fallback?: Adapter<Req, Res>;      // chained fallback (e.g., SMS if WhatsApp fails)
}
```
- **Secrets:** vault-managed; never in code/env-committed; rotated; per-env.
- **Audit:** every external call logged (provider, latency, status, cost) to the warehouse.
- **Mocks:** deterministic fixtures so the whole product runs offline in dev/CI.

### R.2 Adapters to build
| Domain | Interface | Primary | Fallback / notes |
|---|---|---|---|
| Maps/geocode/place | `GeoProvider` (H.6) | Google Maps Platform | OSM/Nominatim; licensing-aware |
| Satellite/raster overlays | `RasterProvider` | provider tiles | Bhuvan/public rasters (view-only) |
| Gov land records | `LandRecordProvider` | per-state portals (Bhoomi/Mahabhumi…) | manual upload fallback; **read/verify only** |
| Registration | `RegistrationProvider` | NGDRS-style flows | informational; deep-link where API absent |
| Doc storage | `ObjectStore` | S3/R2 | — (encrypted, signed URLs) |
| OCR/extraction | `OcrProvider` | cloud OCR + layout model | secondary OCR; confidence merge |
| WhatsApp | `MessagingProvider` | WhatsApp Business API (BSP) | SMS fallback |
| SMS/Email | `MessagingProvider` | SMS gateway / email ESP | secondary providers |
| KYC | `KycProvider` | India KYC vendor | manual review fallback |
| Payments/escrow | `PaymentProvider` | gateway (subscriptions/lead credits) | escrow-partner-ready interface; **no fund custody in MVP** |
| Analytics | `EventSink` | product analytics + warehouse | dual-write |
| CRM export | `CrmExporter` | CSV/webhook/Sheets | — |
| BI/warehouse | `WarehousePipe` | ClickHouse/BigQuery loader | — |

> **ASSUMPTION 11 — Government portals are integrated as read/verify assistants, not write-back.** We do not auto-file mutations/registrations; we link out and assist. Where official APIs exist and permit, we ingest for verification; otherwise users upload extracts and we verify.

### R.3 Webhooks (inbound) + events (outbound)
- Inbound: messaging delivery receipts, KYC results, payment status → signed, idempotent handlers.
- Outbound: domain events (Section S/T) for partners/warehouse via signed webhooks with retry + DLQ.

---

# SECTION S — TECHNICAL ARCHITECTURE

> **Opinionated stack (justified):** TypeScript-first monorepo. **Next.js (App Router)** web/BFF; **NestJS modular monolith** for core API (split to services only when a seam proves load-bearing — avoids premature microservices); **PostgreSQL 16 + PostGIS 3.4** as system of record; **Prisma** for relational + **Kysely/raw SQL** for PostGIS-heavy queries (Prisma's spatial support is weak — hybrid is deliberate); **Redis** (cache + rate limit + BullMQ queues); **OpenSearch** (full-text + facets) synced from Postgres; **pgvector** for RAG (keep AI infra in Postgres early); **MapLibre GL** client + self-hosted vector tiles over PostGIS; **S3/R2** object storage; **ClickHouse** product-event warehouse; **Cerbos** for ABAC policies; **Cloudflare** CDN. Why not GraphQL: tRPC gives end-to-end types internally and REST/OpenAPI serves partners — GraphQL's flexibility isn't worth its caching/complexity cost here.

### S.1 Monorepo structure (pnpm + Turborepo)
```
bhumi/
  apps/
    web/                 # Next.js public marketplace + operator + internal shells
    field/               # PWA for field verifiers (offline-first)
    api/                 # NestJS core API (REST/OpenAPI + tRPC router)
    workers/             # BullMQ workers (extraction, matching, scoring, sitemaps, alerts)
    tiles/               # vector tile server over PostGIS
  packages/
    db/                  # Prisma schema + Kysely types + migrations + seeds
    domain/              # entities, value objects, domain services (framework-free)
    geo/                 # geometry utils, GeoProvider abstraction, area/unit conversion
    legal-engine/        # JSON-logic rule evaluator + jurisdiction resolution
    doc-intel/           # extraction pipeline contracts + validators
    scoring/             # explainable score functions (pure, testable)
    search/              # OpenSearch indexers + query builders
    ai/                  # RAG, prompt templates, assistant orchestration, citation enforcer
    adapters/            # all external adapters + mocks (R.1)
    ui/                  # design system (tokens + components + Storybook)
    contracts/           # zod DTOs, OpenAPI, event schemas (shared truth)
    config/              # env schema (zod), feature flags
    observability/       # logging, tracing, metrics helpers
  infra/                 # IaC (Terraform), Helm/compose, CI config
```

### S.2 Environments & local dev
- **Envs:** `local` (docker-compose: postgres+postgis, redis, opensearch, clickhouse, minio), `preview` (per-PR), `staging`, `prod`. All external adapters default to **mock** locally → entire app runs offline.
- **Local:** `pnpm dev` boots compose + apps; seed fixtures (Section V) load two launch clusters.

### S.3 CI/CD
- PR: typecheck, lint, unit, integration (testcontainers: postgis/redis/opensearch), schema validation (zod↔OpenAPI↔schema.org), migration dry-run, preview deploy.
- Main: build, e2e (Playwright), canary deploy, auto-rollback on SLO breach.
- Migrations gated and reversible; expand/contract pattern (never destructive in one step).

### S.4 Test strategy
- **Unit:** pure domain + scoring + legal-engine + geo (high coverage on these).
- **Integration:** API + DB (testcontainers) + adapters-as-mocks.
- **Geo tests:** known polygons → known areas/overlaps (golden fixtures).
- **E2E:** core journeys (search→parcel→requirement→lead; list→verify→publish).
- **Contract tests:** adapters vs mock + recorded fixtures.

### S.5 Security model + RBAC/ABAC
- AuthN: session (web) + JWT (api/service) + OTP; KYC step-up for sensitive actions.
- **ABAC via Cerbos:** policies over `{principal: role+attrs, resource: type+owner+tier+firewall_class, action}`. Examples: `internal_acq` denied on resources with PII unless aggregate; document view requires `permission_grant`; field_verifier writes only assigned cases.
- Secrets in vault; row-level tenant isolation `[INTL]`; PII encryption at rest; signed URLs for docs; full audit (E.19).

### S.6 Observability, flags, jobs
- **Observability:** OpenTelemetry traces, structured logs, RED/USE metrics, SLO dashboards + alerts.
- **Feature flags:** per-env + per-cluster rollout (launch-geo gating).
- **Background jobs (BullMQ):** extraction, matching, scoring recompute, alert fan-out, sitemap regen, retention/erasure, search reindex, tile cache warm.
- **Migrations/seed:** Prisma migrate + raw SQL for PostGIS/indexes; deterministic seeds.

### S.7 Caching, CDN, file storage, doc pipeline
- **Caching:** Redis for hot reads (parcel page, eligibility verdicts keyed by pack version + buyer attrs), CDN for static/SSG, tile cache with provider-TTL.
- **CDN:** Cloudflare; image transforms (WebP/AVIF, responsive).
- **File storage:** S3/R2, server-side encryption, lifecycle (raw KYC short TTL), signed time-boxed URLs, watermark-on-egress for shared docs.
- **Doc pipeline:** event-driven (upload → queue → OCR → extract → validate → signal → tier recompute), idempotent, resumable.

### S.8 Event naming + warehouse
- **Event schema:** `domain.entity.action` past-tense (`listing.published`, `verification.tier_promoted`, `requirement.matched`, `lead.responded`). Versioned envelopes `{event, version, occurred_at, actor, entity_ref, payload, trace_id}`. Emitted via **transactional outbox** → relay → ClickHouse + outbound webhooks (no lost events).
- **Warehouse schema:** star-ish — fact tables (`fact_lead`, `fact_listing_event`, `fact_search`, `fact_verification`, `fact_visit`) + dims (`dim_parcel`, `dim_admin`, `dim_agent`, `dim_buyer`, `dim_jurisdiction`, `dim_date`). Powers dashboards + scoring features.

---

# SECTION T — DATABASE & API SPEC

### T.1 Enums (Postgres enum types)
```sql
CREATE TYPE land_class AS ENUM ('agri_land','irrigated_farmland','dryland','orchard','plantation',
  'farmhouse_land','built_farmhouse','farm_plot_project','developed_rural_plot','na_converted',
  'peri_urban_growth','solar_suitable','warehouse_logistics','institutional_land','joint_ownership',
  'distress_sale','litigated_flagged','auction_bank','offmarket_internal');
CREATE TYPE listing_intent AS ENUM ('for_sale','for_lease','for_joint_development','for_partnership',
  'expression_of_interest_only','off_market_internal');
CREATE TYPE listing_status AS ENUM ('draft','pending_moderation','live','under_offer','off_market','expired','withdrawn');
CREATE TYPE verification_tier AS ENUM ('basic','phone_verified','kyc_verified','relationship_verified',
  'parcel_verified','geo_verified','document_pack_verified','field_inspected','transaction_ready','premium_trusted');
CREATE TYPE identifier_type AS ENUM ('ulpin','survey_number','khasra','gut','khata','khewat',
  'plot_number','municipal_property_id','revenue_subdivision');
CREATE TYPE seller_relationship AS ENUM ('sole_owner','co_owner','family_representative','poa_holder',
  'agent_authorized','unverified_claim');
CREATE TYPE signal_type AS ENUM ('area_mismatch','boundary_mismatch','seller_mismatch','duplicate_listing',
  'suspicious_pricing','ownership_chain_gap','court_case','encumbrance','utility');
CREATE TYPE geometry_source AS ENUM ('drawn_by_user','uploaded_kml','gov_layer','survey_import','ai_assisted');
CREATE TYPE accuracy_class AS ENUM ('survey_grade','sketch','approximate');
CREATE TYPE admin_level AS ENUM ('country','state','district','taluka','village');
```

### T.2 Relational + PostGIS schema (core tables, abridged DDL)
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE admin_area (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  level admin_level NOT NULL,
  name text NOT NULL,
  name_i18n jsonb DEFAULT '{}',
  parent_id uuid REFERENCES admin_area(id),
  path ltree NOT NULL,
  codes jsonb DEFAULT '{}',
  boundary geometry(MultiPolygon,4326),
  jurisdiction_pack_id uuid,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX admin_area_path_gist ON admin_area USING gist(path);
CREATE INDEX admin_area_boundary_gist ON admin_area USING gist(boundary);

CREATE TABLE parcel (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  primary_land_class land_class NOT NULL,
  secondary_tags text[] DEFAULT '{}',
  admin_area_id uuid NOT NULL REFERENCES admin_area(id),
  centroid geography(Point,4326),
  current_geometry_id uuid,
  canonical_area_value numeric, canonical_area_unit text, canonical_area_source text,
  canonical_area_confidence numeric,
  confidence_overall numeric,
  status text NOT NULL DEFAULT 'draft',
  jurisdiction_pack_id uuid,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX parcel_admin_idx ON parcel(admin_area_id);
CREATE INDEX parcel_class_idx ON parcel(primary_land_class);
CREATE INDEX parcel_centroid_gix ON parcel USING gist(centroid);

CREATE TABLE parcel_geometry (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  parcel_id uuid NOT NULL REFERENCES parcel(id) ON DELETE CASCADE,
  geom geometry(MultiPolygon,4326) NOT NULL,
  area_computed_m2 numeric,
  source geometry_source NOT NULL,
  source_ref text,
  accuracy accuracy_class NOT NULL DEFAULT 'sketch',
  is_current boolean DEFAULT false,
  superseded_by uuid REFERENCES parcel_geometry(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT geom_valid CHECK (ST_IsValid(geom))
);
CREATE INDEX parcel_geometry_gix ON parcel_geometry USING gist(geom);
CREATE INDEX parcel_geometry_current ON parcel_geometry(parcel_id) WHERE is_current;

CREATE TABLE parcel_identifier (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  parcel_id uuid NOT NULL REFERENCES parcel(id) ON DELETE CASCADE,
  id_type identifier_type NOT NULL,
  value text NOT NULL, raw_value text,
  issuing_authority text, as_of_date date,
  confidence numeric, source_document_id uuid,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX parcel_identifier_lookup ON parcel_identifier(id_type, value);
CREATE INDEX parcel_identifier_parcel ON parcel_identifier(parcel_id);

CREATE TABLE listing (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  parcel_id uuid NOT NULL REFERENCES parcel(id),
  owner_seller_id uuid, owner_agent_id uuid,
  land_class land_class NOT NULL,
  intent listing_intent NOT NULL DEFAULT 'for_sale',
  headline text NOT NULL, description text,
  asking_price numeric, price_basis text, currency text DEFAULT 'INR',
  area_value numeric, area_unit text,
  verification_tier verification_tier NOT NULL DEFAULT 'basic',
  status listing_status NOT NULL DEFAULT 'draft',
  seo_slug text UNIQUE, expires_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX listing_status_idx ON listing(status, expires_at);
CREATE INDEX listing_parcel_idx ON listing(parcel_id);
CREATE INDEX listing_headline_trgm ON listing USING gin(headline gin_trgm_ops);

CREATE TABLE buyer_requirement (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  buyer_id uuid NOT NULL,
  intent text NOT NULL,
  land_classes land_class[] DEFAULT '{}',
  geo_scope geometry(MultiPolygon,4326),
  admin_area_ids uuid[] DEFAULT '{}',
  budget_min numeric, budget_max numeric, currency text DEFAULT 'INR',
  acreage_min numeric, acreage_max numeric,
  irrigation_pref text, access_pref text,
  time_horizon text, financing_readiness text,
  verified_buyer boolean DEFAULT false,
  status text DEFAULT 'active', match_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX requirement_geo_gix ON buyer_requirement USING gist(geo_scope);

CREATE TABLE document (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  owner_scope text NOT NULL, owner_ref uuid NOT NULL,
  doc_type_code text NOT NULL,
  storage_key text NOT NULL, sha256 char(64) NOT NULL,
  version int DEFAULT 1, prev_version_id uuid REFERENCES document(id),
  redaction_profile text, watermark_policy text,
  extraction_status text DEFAULT 'queued',
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX document_dedupe ON document(sha256, owner_ref);

-- signals (one table, typed payload)
CREATE TABLE parcel_signal (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  parcel_id uuid NOT NULL REFERENCES parcel(id),
  signal_type signal_type NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  source text, source_ref text,
  severity int DEFAULT 0, confidence numeric,
  status text DEFAULT 'active', observed_at timestamptz DEFAULT now()
);
CREATE INDEX signal_parcel_idx ON parcel_signal(parcel_id, signal_type, status);

-- knowledge corpus for RAG
CREATE TABLE knowledge_chunk (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  source_id uuid NOT NULL,
  jurisdiction_scope text, content text NOT NULL,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX knowledge_embedding_idx ON knowledge_chunk USING ivfflat (embedding vector_cosine_ops);

-- append-only audit
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  actor_id uuid, actor_role text, action text NOT NULL,
  entity_type text, entity_id uuid,
  before_hash text, after_hash text, ip inet, ua text,
  at timestamptz DEFAULT now()
);
```
(Other tables — `seller`, `agent`, `agency`, `lead`, `lead_assignment`, `verification_case`, `verification_task`, `document_extraction`, `legal_rule`, `jurisdiction_pack`, `market_comp`, `price_history`, `demand_signal`, `saved_search`, `offer`, `internal_opportunity`, `deal_score`, `consent_record`, `ai_answer`, `local_office`, `seo_page`, `dataset` — follow the same conventions from Section E.)

### T.3 RLS guidance
- Enable RLS on PII-bearing + document tables. Policies: owner can read/write own; admins via role; `internal_*` per Cerbos-derived claims; documents readable only with an active `permission_grant` row. Cerbos is the policy brain; RLS is defense-in-depth for direct DB access.

### T.4 API design — REST (public/partner) + tRPC (internal) + tiles
**Justification:** REST/OpenAPI for stable, cacheable, partner-friendly public surface; tRPC for type-safe internal app↔api; no GraphQL (see S). Versioned `/v1`. Cursor pagination, idempotency keys on writes, rate limits per key/role, ETags + CDN cache on read.

Representative REST endpoints:
```
# Search & parcels
GET  /v1/search/listings?bbox=&land_class=&min_acre=&tier=&page=
POST /v1/search/geo            # polygon-in-body draw-to-search
GET  /v1/parcels/{id}          # parcel 360 (public-safe projection)
GET  /v1/parcels/{id}/evidence # permissioned
GET  /v1/listings/{slug}

# Map tiles / layers
GET  /v1/tiles/parcels/{z}/{x}/{y}.mvt
GET  /v1/layers/admin/{level}.mvt
GET  /v1/layers/sources        # source registry + attribution

# Demand
POST /v1/requirements          # create buyer requirement
GET  /v1/requirements/{id}/matches

# Listing & verification
POST /v1/listings              # draft (assistant-assisted)
POST /v1/listings/{id}/publish
POST /v1/verification/cases
POST /v1/verification/tasks/{id}/evidence

# Leads / CRM
POST /v1/leads
POST /v1/leads/{id}/assign
PATCH /v1/leads/{id}/stage

# AI
POST /v1/ai/legal/eligibility   # {buyerCtx, parcelId} -> 7-block answer + citations
POST /v1/ai/parcel/{id}/explain

# Admin / Analytics
GET  /v1/admin/moderation/queue
GET  /v1/analytics/markets/{adminPath}
POST /v1/webhooks/{provider}    # signed inbound
```

### T.5 Event contracts (outbound)
```json
{ "event":"verification.tier_promoted","version":1,"occurred_at":"...",
  "actor":{"id":"...","role":"reviewer"},
  "entity_ref":{"type":"parcel","id":"..."},
  "payload":{"from":"geo_verified","to":"transaction_ready","case_id":"..."},
  "trace_id":"..." }
```
Webhook delivery: signed (HMAC), at-least-once, idempotency key, retry+DLQ.

---

# SECTION U — IMPLEMENTATION PLAN

> Goal: the **MVP must already win in the two launch clusters** (ASSUMPTION 5). We ship trust + map + demand before breadth.

### U.1 Scopes
- **MVP (win one/two geographies):** auth + parcel/identity/geometry + listing wizard (draw/upload boundary, area recon) + map-first search + parcel page with **visible trust tier (up to geo_verified)** + buyer requirement flow + reverse matching + masked leads + basic agent onboarding + eligibility checker (Karnataka + Maharashtra packs, curated) + WhatsApp alerts + admin moderation + event pipeline.
- **Fast-launch additions:** agent CRM (inbox/pipeline/SLA), saved searches, demand heatmap (basic), SEO market pages for the two clusters, share cards.
- **Growth:** verification cases + field-verifier PWA + document intelligence + due-diligence room + legal assistant (full 7-block) + document-pack/field/transaction-ready tiers + more jurisdiction packs.
- **Trust-upgrade `[TRUST+]`:** premium-trusted tier, legal review workflow, dispute system, advanced fraud signals, escrow-partner integration.
- **Enterprise/International `[INTL]`:** multi-tenant, white-label microsites, partner API, additional countries via packs, institutional NDA rooms, BI exports.

### U.2 Milestones → epics (critical path **bold**)
| Phase | Milestone | Epics |
|---|---|---|
| 1 | **Data & identity** | **monorepo+CI**, **db/postgis schema+migrations**, auth/RBAC(Cerbos), **parcel+geometry+identifier**, admin hierarchy + seed clusters |
| 1 | **Supply in** | listing wizard, **draw/upload boundary + area recon**, media pipeline, moderation, OpenSearch index |
| 1 | **Find & demand** | **map-first search + tiles**, parcel page + **trust badge**, requirement wizard, **reverse matching**, masked leads, alerts(WhatsApp) |
| 1 | Agents v1 | agent onboarding/KYC, lead inbox |
| 1 | Eligibility | legal-engine + **KA/MH packs (curated)** + /eligibility |
| 2 | Verify | verification cases/tasks + SLA, field PWA, tiers→field_inspected |
| 2 | Evidence | doc intelligence (OCR/extract/validate), DD room, signals→tier caps |
| 2 | Legal AI | RAG corpus + legal assistant (7-block) + parcel explainer |
| 3 | Internal OS | unified lead queue, scoring suite, deal rooms, dashboards, forecasting |
| 3 | Intelligence | market dashboards, DealScore, cluster detection, watchlists |
| 4 | SEO/Growth | programmatic page engine, content hubs, local offices/GBP, referral loops, microsites, i18n |

### U.3 Dependencies & critical path
Schema/identity → geometry/area-recon → search & parcel page → matching & leads. Verification depends on evidence+signals; legal AI depends on packs+corpus; internal OS depends on event pipeline+scoring; SEO depends on data density (so it's Phase 4 by design).

### U.4 Staffing (lean, opinionated)
- 1 TL/architect, 2 full-stack (web+api), 1 geospatial eng (PostGIS/tiles/MapLibre), 1 data/ML (extraction+scoring+RAG), 1 design/UX, 0.5 legal-content lead (curates packs), 0.5 ops/QA. Scale data + content for Phase 3/4.

### U.5 Release & demo plan
- **Release:** trunk-based, feature-flagged, per-cluster rollout; weekly to staging, biweekly to prod; canary + auto-rollback.
- **Demo (MVP):** Mysuru farmhouse parcel — draw boundary → area recon → eligibility verdict (non-agriculturist, Karnataka) → trust ladder → buyer posts requirement → instant reverse match → masked lead to agent. Then Nashik orchard with WhatsApp share card + market page.

---

# SECTION V — CODE-GENERATION READINESS

### V.1 Primary modules & interfaces (from `packages/`)
```ts
// packages/geo
export interface GeoService {
  area(geom: GeoJSONPolygon): { m2: number; acres: number; guntha: number };
  reconcile(declared: AreaInput, doc: AreaInput|null, geom: GeoJSONPolygon|null): AreaReconResult;
  overlaps(geom: GeoJSONPolygon, excludeParcelId?: string): Promise<OverlapHit[]>;
  centroid(geom: GeoJSONPolygon): LngLat;
}
// packages/legal-engine
export interface LegalEngine {
  resolvePack(adminAreaId: string, at?: Date): Promise<JurisdictionPack>;
  evaluateEligibility(ctx: EligibilityContext): Promise<EligibilityVerdict>; // 7-block-ready
  checklist(args: ChecklistArgs): Checklist;
}
// packages/scoring
export interface Scoring {
  dealScore(parcel: ParcelFeatures): Score;
  undervaluation(parcel: ParcelFeatures, comps: MarketComp[]): Score;
  agentQuality(agent: AgentMetrics): Score;
} // all return {value,confidence,components,inputs,model_version,computed_at}
// packages/ai
export interface Assistant {
  ask(req: AssistantRequest): Promise<AIAnswer>; // RAG + citation enforcement + moderation
}
// packages/adapters (R.1) — GeoProvider, MessagingProvider, OcrProvider, KycProvider, ...
```

### V.2 Sample payloads

**Parcel object**
```json
{
  "id": "0190f3a2-7c11-7e44-8a01-9b2c3d4e5f60",
  "primary_land_class": "farmhouse_land",
  "secondary_tags": ["peri_urban_growth"],
  "admin_path": "India > Karnataka > Mysuru > Hunsur > Kallahalli",
  "canonical_area": { "value": 2.0, "unit": "acre", "source": "drawn_by_user", "confidence": 0.82 },
  "centroid": { "lng": 76.21, "lat": 12.31 },
  "identifiers": [
    { "id_type": "survey_number", "value": "123/2", "confidence": 0.9, "source_document_id": "..." },
    { "id_type": "ulpin", "value": "KA12AB34CD56EF", "confidence": 0.7 }
  ],
  "geometry_ref": "0190f3a2-...-current",
  "verification_tier": "geo_verified",
  "signals": [ { "signal_type": "area_mismatch", "severity": 1, "confidence": 0.6,
                 "payload": { "declared_acre": 2.0, "computed_acre": 1.86, "delta_pct": 7 } } ],
  "scores": { "parcel_quality": { "value": 0.71, "confidence": 0.6 } }
}
```

**Listing object**
```json
{
  "id": "...", "parcel_id": "0190f3a2-...", "land_class": "farmhouse_land", "intent": "for_sale",
  "headline": "2-acre farmhouse plot near Mysuru, drip + borewell, road-facing",
  "asking_price": 8500000, "price_basis": "total", "currency": "INR",
  "area_value": 2.0, "area_unit": "acre",
  "verification_tier": "geo_verified", "status": "live",
  "media": [ { "kind": "photo", "is_cover": true, "watermark_applied": true } ],
  "disclaimer_block": "Karnataka — verify eligibility & latest RTC/mutation. Guidance, not legal advice.",
  "seo_slug": "farmhouse-land-hunsur-mysuru-2-acre-123-2"
}
```

**Buyer requirement object**
```json
{
  "id": "...", "buyer_id": "...", "intent": "farmhouse",
  "land_classes": ["farmhouse_land","na_converted"],
  "admin_area_ids": ["<mysuru>","<hunsur>"],
  "budget": { "min": 5000000, "max": 12000000, "currency": "INR" },
  "acreage": { "min": 1, "max": 3 },
  "irrigation_pref": "borewell", "access_pref": "motorable_road",
  "time_horizon": "3_months", "financing_readiness": "self_funded",
  "verified_buyer": true, "status": "active", "match_count": 7
}
```

**Risk/score object**
```json
{
  "subject": { "type": "parcel", "id": "0190f3a2-..." },
  "score_name": "deal_score", "value": 0.78, "confidence": 0.55,
  "band": "high_opportunity",
  "components": {
    "potential_undervaluation": { "value": 0.62, "weight": 0.30 },
    "liquidity": { "value": 0.80, "weight": 0.25 },
    "parcel_quality": { "value": 0.71, "weight": 0.20 },
    "legal_complexity_inv": { "value": 0.85, "weight": 0.15 },
    "demand_supply_imbalance": { "value": 0.90, "weight": 0.10 }
  },
  "inputs": { "local_median_ppa": 4600000, "parcel_ppa": 4250000, "comp_n": 9 },
  "model_version": "deal_score@1.2.0", "computed_at": "2026-06-06T00:00:00Z",
  "firewall_class": "internal"
}
```

### V.3 Prompt templates (abridged)

**Legal assistant (system)**
```
You are Bhūmi's Legal Guidance assistant for {JURISDICTION_PACK.name} v{pack.version} (as_of {pack.effective_from}).
SCOPE: Only use the provided LegalRules and KnowledgeSource chunks. Never invent statutes or assert title.
OUTPUT exactly these blocks: What this means | Why it matters | What to verify | Documents typically needed |
Likely next steps | Known exceptions / state caveats | Sources used.
RULES: cite every legal claim with [source_id]; if no citation supports a claim, omit it. If confidence is low or
the question is outside scope, reply: "I can't confirm this — please consult a local lawyer/revenue office" + escalation CTA.
Label output as "Verified guidance, not legal advice." Buyer context: {context_json}.
```
**Parcel explainer (system)**
```
Summarize this parcel for a non-expert buyer using ONLY the provided evidence, signals, and scores.
Every factual sentence must reference an evidence id or score. State uncertainty plainly (e.g., area mismatch).
Do not give investment advice. Output is AI-generated and source-linked.
```

### V.4 DTOs/contracts, route map, state, workers, tests, seeds, ADRs
- **DTOs:** zod schemas in `packages/contracts` are the single source → generate OpenAPI + TS types + runtime validation.
- **UI route map:** as Section N.2 (public) + `/agent/*`, `/internal/*`, `/admin/*` authenticated shells + `/field/*` PWA.
- **State mgmt:** server components + React Query for server state; minimal client state (URL-as-state for search/facets); Zustand for map/editor local state.
- **Search indexing plan:** Postgres → outbox event → indexer worker → OpenSearch (listings/parcels/markets); geo truth stays in PostGIS; reconcile nightly.
- **Background workers:** `extraction`, `matcher`, `scorer`, `alerts`, `sitemap`, `retention`, `reindex`, `tile-warm`.
- **Testing scaffolds:** vitest (unit), testcontainers (integration), Playwright (e2e), golden geo fixtures.
- **Seed fixtures:** 2 clusters, ~50 parcels with geometries, identifiers, 10 listings at varied tiers, 5 requirements, 3 agents, KA/MH jurisdiction packs, knowledge corpus seed.
- **ADR list:** ADR-001 modular monolith over microservices; ADR-002 Prisma+Kysely hybrid for PostGIS; ADR-003 REST+tRPC, no GraphQL; ADR-004 pgvector for RAG; ADR-005 jurisdiction-as-data; ADR-006 parcel-canonical-geometry ownership vs providers; ADR-007 ClickHouse for events; ADR-008 Cerbos ABAC + RLS defense-in-depth; ADR-009 transactional outbox; ADR-010 trust-tier as single computed source of truth.

### V.5 Code conventions
TypeScript strict; zod at all boundaries; pure domain/scoring/legal functions (no I/O) for testability; adapters never leak vendor types; events past-tense; migrations expand/contract; everything PII touches is audited; feature-flag new surfaces; conventional commits + trunk-based.

### V.6 Incremental coding sequence (maps to phases)
1. `packages/db` schema+migrations+seeds → `packages/domain` + `contracts`.
2. `apps/api` auth+RBAC + parcel/identifier/geometry CRUD + `packages/geo` area-recon/overlap.
3. `apps/web` listing wizard (+ map editor) + moderation + OpenSearch indexer.
4. Map-first search + tiles (`apps/tiles`) + parcel page + TrustBadge.
5. Requirement wizard + matcher worker + masked leads + WhatsApp alerts.
6. `legal-engine` + KA/MH packs + /eligibility.
7. Verification cases + field PWA → evidence/doc-intel + DD room → legal AI.
8. Internal OS + scoring + dashboards → SEO engine + content hubs + i18n.

---

# SECTION W — OUTPUT QUALITY BAR & FINAL BUILD BRIEF

### Condensed build brief
Build **Bhūmi**, a parcel-first land intelligence marketplace, India-first (launch in **Mysuru/Bengaluru-rural, Karnataka** and **Nashik–Pune, Maharashtra**), global-ready via **jurisdiction-as-data packs**. The root entity is the **Parcel** (canonical identity + owned geometry), not the listing. The wedge is **verified parcel pages with visible trust tiers, a map-first search showing real boundaries, and a personalized, source-linked eligibility verdict** — plus **demand capture as a first-class product** feeding reverse-matching and market intelligence. Stack: TS monorepo, Next.js + NestJS, Postgres/PostGIS, Prisma+Kysely, OpenSearch, pgvector, MapLibre, Redis/BullMQ, ClickHouse, Cerbos, Cloudflare. Every claim → evidence; every score → explainable; every AI answer → source-linked + labeled + escalatable; internal acquisition firewalled + audited.

### Top differentiators
1. Canonical, owned parcel geometry + identity (ULPIN-aware) — not pins, not provider-locked.
2. Personalized per-state **eligibility verdict** with sources (the unanswered question in ag-land).
3. **Visible verification ladder** everywhere; fakes can't hide.
4. Document-intelligence **evidence chain** (claim→doc→field→bbox).
5. **Demand as a product** → reverse matching + demand heatmaps → seller/internal acquisition signal.
6. Explainable **opportunity/DealScore** powering a firewalled first-party acquisition desk.
7. Durable, data-backed **SEO** (no thin pages, correct schema, no FAQ-tactic reliance).

### Most important MVP screens
Map-first search · Parcel page (polygon + eligibility + trust ladder + area recon) · Listing wizard (draw boundary + area recon) · Buyer requirement wizard + match list · Agent lead inbox · Eligibility checker.

### Most important datasets
Canonical parcel geometry+identity · Admin hierarchy + boundaries (KA/MH) · Jurisdiction packs (eligibility rules + sources) · MarketComps (price/acre) · DemandSignals (requirements/searches) · Verification evidence corpus · Knowledge corpus (legal guides/glossary).

### Most important integrations
Google Maps Platform (geocode/place/static) · WhatsApp Business (alerts/leads) · OCR/extraction · KYC · object storage · state land-record read/verify · ClickHouse warehouse.

### Most important dashboards
Demand heatmap + scarcity (region-wise demand capture) · Verification SLA + moderation · Agent reputation/SLA · Internal opportunity board (DealScore + clusters) · Micro-market price/liquidity monitor.

### Most important growth loops
Verified-supply↔demand marketplace loop · Trust ladder loop · Agent CRM retention loop · Demand-capture reverse-match loop · SEO data-page compounding loop · Firewalled internal-acquisition calibration loop.

### Most important product-design risks to manage
1. **Legal accuracy & freshness** — packs must be curated, dated, and reviewed; never let AI invent law. Mitigation: citation-enforced engine + human review + visible `as_of` + escalation.
2. **Trust-vs-internal-acquisition conflict** — the firewall must be real and visible, or trust collapses. Mitigation: ABAC + audit + public transparency page.
3. **Geometry truth vs convenience** — never let place-search approximations masquerade as parcel boundaries. Mitigation: `accuracy_class` + UI labeling + source registry.
4. **Provider licensing** — don't persist what licenses forbid. Mitigation: licensing-aware adapters + source registry.
5. **Privacy (DPDP)** — consent, masking, retention, DSR from day one, not bolted on.
6. **SEO thin-page risk** — usefulness gate + indexation guardrails; schema must match visible content.
7. **Fake/duplicate supply** — geometry/identifier dedupe + signals + visible tiers as the antidote.

### Best next coding sequence for immediate implementation
`packages/db` (PostGIS schema + enums + indexes + seeds) → `packages/domain` + `packages/contracts` (zod DTOs) → `apps/api` (auth + Cerbos + parcel/identifier/geometry) → `packages/geo` (area-recon + overlap) → `apps/web` listing wizard with map editor → `apps/tiles` + map-first search + parcel page + TrustBadge → requirement wizard + matcher worker + masked leads → `legal-engine` + KA/MH packs + /eligibility. Ship to the two launch clusters, then layer verification → evidence/legal-AI → internal OS → SEO/growth.

---
*End of specification. This document is the build contract; deviations should be recorded as ADRs.*
