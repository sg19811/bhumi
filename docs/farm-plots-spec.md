# Farm Plot Projects — MVP Blueprint for AcreHub

> **Honest framing.** The full prompt describes ~6 months of work if built literally. This document is the **MVP only — 1 week of Claude Code work** — because that's what genuinely moves the marketplace. Phase 2 and Phase 3 are listed explicitly so nothing is forgotten, but they're not what we build now. The spec author's own instruction ("Do not overbuild") is the binding constraint here.

---

## 1. How Farm Plot Projects fits into AcreHub

This is a **category, not a vertical.** Farm plot projects are land that happens to be sold as part of a managed/gated/plantation project — but they're still land, sold on a marketplace where buyers already filter by `land_type`, location, price, and trust signals.

That means ~80% of the work is *extending what already exists*, not building parallel infrastructure:

- The existing `listings` table holds the project (one row per project, plot inventory in a child table)
- The existing `/explore`, `/listings`, `/region/[district]`, `/land/[type]` pages already surface listings — adding new `land_type` values plus a few new fields lights them up for farm plot projects automatically
- The existing listing detail page (`/listing/[id]`) gets conditional sections when the listing is a farm plot project type
- The existing listing creation wizard (`/listing/new`) gets conditional fields for projects
- The existing buyer requirement form (`/buy`) gets the new land types as options
- The existing admin pending-approval queue handles farm project moderation with zero changes
- The existing Trust Score, Suitability panel, price insight, sitemap, search logs, inquiry flow, save/compare, and WhatsApp share all work for farm projects with **no code changes**

What's genuinely new is a small layer of farm-project-specific surfaces: a `/farm-plots` hub, a couple of corridor landing pages, and inventory display on the detail page. That's the whole MVP.

---

## 2. Recommended MVP scope (1 week of Claude Code work)

**In scope:**

- New `land_type` values: `farm_plot_project`, `managed_farmland`, `farmhouse_plot`, `gated_farm_plot`, `plantation_project`
- Additive columns on `listings` for project-specific fields (all nullable)
- One new child table: `farm_project_plots` (plot inventory — genuine 1-to-many data)
- Conditional rendering on `/listing/new` wizard — when a project-type `land_type` is selected, show project-specific fields and a simple inline plot inventory editor
- Conditional rendering on `/listing/[id]` — when listing is a project type, show new sections: project overview, plot inventory table, corridor + distance, amenities, developer profile placeholder
- `/farm-plots` hub page (server, ISR) — Bangalore-region focus, corridor grid, sample projects, price band, FAQ schema, link to `/legal` for legal checklist (don't duplicate legal content)
- `/farm-plots/bangalore` city page — broader copy + corridor list with counts
- `/farm-plots/[corridor]` pages for the 6 highest-priority corridors only (start narrow, expand once you have real projects in each)
- New `land_type` chips on `/explore` filter bar; show in existing card label
- New options in `/buy` buyer requirement form
- Sitemap extension
- Search logging picks up corridor from URL/query automatically

**Explicitly deferred to Phase 2:**
- Developer dashboard, developer profile pages, developer onboarding flow
- Total Cost Calculator (build later under `/tools` — `/farm-plots/calculator` is just a link for now)
- Site visit booking system, site visit checklist as a feature (link to a printable page is fine)
- Buyer Decision Report
- Project document upload tied to project (use the existing verification flow on the parent listing)
- Tiered verification badges (use existing single `is_verified` for MVP)
- Risk Score specific to farm plots (existing Trust Score covers MVP)
- Premium placement, lead assignment, internal sales workflow specific to farm plots
- WhatsApp project brochure generator

**Explicitly deferred to Phase 3:**
- AI buyer report, AI developer listing assistant, AI legal explainer
- Drone/360 tours
- Maintenance transparency dashboard
- Resale marketplace for plot owners
- PostGIS project boundaries
- OCR document pipeline

---

## 3. Route structure

```
EXISTING ROUTES — reuse, add conditional rendering:
  /listing/new                  → wizard: conditional fields when land_type is project-type
  /listing/[id]                 → detail: conditional sections when listing is project-type
  /listing/[id]/edit            → same conditional fields as /listing/new
  /explore                      → add new land_type chips, no other change
  /listings                     → no change (filters work)
  /buy                          → add new land types to requirement form
  /land/farm_plot_project       → already works via existing /land/[type] template
  /land/managed_farmland        → already works
  /region/[district]            → already works (filters naturally)
  /admin                        → already works (pending queue handles projects)

NEW ROUTES — server components, ISR (60-min revalidate):
  /farm-plots                   → hub; Bangalore-region focus, corridor grid, sample projects
  /farm-plots/bangalore         → city page (corridor list with project counts)
  /farm-plots/[corridor]        → corridor page for the top 6:
                                  - kanakapura-road
                                  - devanahalli
                                  - nandi-hills
                                  - mysore-road
                                  - hosur (TN-side)
                                  - sarjapur-anekal
  /farm-plots/legal-checklist   → redirect / link to /legal/checklist with farm-plot prefill

DEFERRED TO PHASE 2 (do not build now):
  /farm-plots/calculator        → 30-min calculator under /tools, link to it later
  /farm-plots/compare           → existing /compare already works; deep-link with farm-plot filter
  /developers/dashboard         → Phase 2 only
  /admin/farm-plot-verification → not needed; existing /admin handles it
```

**Why only 6 corridors for MVP:** an empty corridor page is worse SEO than no page. Ship the 6 you're most likely to seed first; add more in Phase 2 as real projects appear in them.

---

## 4. Data model recommendation

**Final choice: hybrid — extend `listings` + one small child table for plot inventory.**

Reasoning:
- Most project fields are 1-to-1 with a listing (project name, total acres, developer name, corridor). Putting them on `listings` keeps the existing read paths intact — `/explore`, `/region/*`, `/land/*`, ListingCard, Trust Score, search filters, sitemap all "just work."
- Plot inventory is genuinely 1-to-many (one project has many plots of different sizes/prices). That deserves its own table.
- Everything else from the prompt (amenities, documents, leads, site visits, comparisons) **already has a home** in existing infrastructure — don't duplicate.

```sql
-- 1. New land_type values (handled in app-level enum/options, not a check constraint)

-- 2. Additive columns on listings (all nullable, defaults safe)
alter table listings add column if not exists project_name text;
alter table listings add column if not exists developer_name text;
alter table listings add column if not exists project_stage text;      -- 'pre_launch' | 'launched' | 'partial_inventory' | 'completed'
alter table listings add column if not exists total_project_acres numeric;
alter table listings add column if not exists plot_count integer;
alter table listings add column if not exists plot_size_min_value numeric;
alter table listings add column if not exists plot_size_max_value numeric;
alter table listings add column if not exists plot_size_unit text;     -- 'sqft' | 'guntha' | 'cent' | 'acre'
alter table listings add column if not exists maintenance_fee_amount integer;     -- in rupees
alter table listings add column if not exists maintenance_fee_period text;        -- 'monthly' | 'quarterly' | 'yearly' | 'one_time'
alter table listings add column if not exists corridor text;            -- 'kanakapura-road' etc. — same slug as URL
alter table listings add column if not exists nearest_city text;         -- 'bangalore' | 'hyderabad' etc.
alter table listings add column if not exists distance_from_city_km numeric;
alter table listings add column if not exists travel_time_minutes integer;
alter table listings add column if not exists layout_approval_status text;        -- 'approved' | 'pending' | 'not_required' | 'unknown'
alter table listings add column if not exists conversion_status text;              -- 'converted' | 'agricultural' | 'partial' | 'unknown'
alter table listings add column if not exists amenities jsonb default '[]';        -- ['internal_roads','fencing','clubhouse','security','drip_irrigation','plantation','farm_management']
alter table listings add column if not exists possession_timeline text;            -- 'ready' | '6_months' | '12_months' | '24_months' | 'phased'

-- 3. Plot inventory (the only genuinely new table)
create table if not exists farm_project_plots (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  plot_label text,                                  -- 'Plot A-12' or 'Phase 1 / Block 2 / Plot 12'
  size_value numeric not null,
  size_unit text not null,                          -- 'sqft' | 'guntha' | 'cent' | 'acre'
  price numeric,                                    -- total price for this specific plot
  status text not null default 'available',         -- 'available' | 'sold' | 'reserved' | 'on_hold'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists farm_project_plots_listing_id_idx on farm_project_plots(listing_id);
create index if not exists farm_project_plots_status_idx on farm_project_plots(status);

alter table farm_project_plots enable row level security;

-- Public read of plots that belong to active listings
create policy "public read available plots" on farm_project_plots for select
  using (
    exists (
      select 1 from listings l
      where l.id = farm_project_plots.listing_id
        and l.status = 'active'
    )
  );

-- Listing owner manages their plots
create policy "owner manages plots" on farm_project_plots for all to authenticated
  using (
    exists (
      select 1 from listings l
      where l.id = farm_project_plots.listing_id
        and l.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from listings l
      where l.id = farm_project_plots.listing_id
        and l.owner_user_id = auth.uid()
    )
  );

-- Admin override (uses existing is_admin() function from your codebase)
create policy "admin manages plots" on farm_project_plots for all to authenticated
  using (is_admin())
  with check (is_admin());
```

**What we do NOT add to the schema** (and why):
- `farm_projects` table — redundant; the listing IS the project
- `farm_project_amenities` table — JSONB array on `listings.amenities` is enough for MVP; relational table only justified when you need amenity-level filtering at scale
- `farm_project_documents` — existing `verification_requests` table covers this
- `farm_project_leads` — existing `inquiries` table covers this
- `farm_project_site_visits` — Phase 2; until then, site-visit requests come through the inquiry form with a tag
- `farm_project_verifications` — existing `verification_requests` table
- `farm_project_comparisons` — existing compare feature already persists user state

---

## 5. Component plan

**Reuse as-is, no changes:**
- `Header`, `Logo`, `Footer`
- `Map`, `MapLoader`, `WhatsAppShare`, `SaveButton`, `ShareButton`
- `TrustScore` / `TrustBadge`, `PriceInsight`, `MarketStats`, `SuitabilityPanel`
- `SearchBar`, `LeadCaptureForm`
- `CompareTray`, `StickyContactBar`
- All authentication and admin components

**Extend (add conditional rendering for project types):**
- `ListingCard` — when listing is a project type, show small "Project" badge + project name + plot count if known
- `app/listing/new/page.tsx` — add a `ProjectFieldsStep` rendered only when `land_type` is project-type
- `app/listing/[id]/edit/page.tsx` — same conditional fields
- `app/listing/[id]/page.tsx` — add conditional `<FarmProjectSections />` block when applicable
- `app/explore/page.tsx` + `SearchFilters.tsx` — add new `land_type` chips (existing select picks them up if you extend the options array)
- `app/buy/page.tsx` — buyer requirement form land-type options

**New components (small, all in `app/components/farm-plots/`):**
- `FarmProjectSections.tsx` — orchestrates the conditional sections on listing detail
- `PlotInventoryTable.tsx` — simple table; columns: label, size, price, status; sortable; mobile-readable
- `PlotInventoryEditor.tsx` — inline editor in the create/edit wizard; add/remove/edit plot rows; client component
- `ProjectOverviewCard.tsx` — total acres, plot count, plot size range, project stage, possession timeline
- `DeveloperProfileCard.tsx` — placeholder with name + contact (no developer dashboard yet)
- `AmenitiesGrid.tsx` — renders the `amenities` jsonb as a clean grid with icons (reuse Tailwind tokens)
- `CorridorBadge.tsx` — small badge that links to `/farm-plots/[corridor]`
- `FarmPlotHero.tsx` — for `/farm-plots` and city/corridor pages
- `CorridorGrid.tsx` — grid of corridor cards with project counts

**New library files in `app/lib/farm-plots/`:**
- `types.ts` — TypeScript types for project fields, plot inventory, corridors, amenities
- `corridors.ts` — canonical list of corridors with display labels, slugs, parent city, state (for legal routing)
- `amenities.ts` — canonical amenity catalog with icons + labels
- `copy.ts` — page copy for hub, city, corridor pages (typed)

---

## 6. UX flow

**Buyer discovery (3 entry paths):**
1. Home → "Farm plot projects" tile (add to existing "Browse by need" row) → `/farm-plots` → corridor card → project detail
2. `/explore` → filter by `land_type=farm_plot_project` → card grid → project detail
3. Google search → corridor landing page (`/farm-plots/devanahalli`) → project detail

On the project detail page, the conditional sections appear above the existing description/contact sections:
- Hero (project name, location, corridor badge, distance, price range, plot count, verified badge if applicable)
- Map (already exists — no change)
- Project overview card (acres, plot count, plot sizes, stage, possession)
- Plot inventory table (collapsible if many plots)
- Amenities grid
- Trust + Suitability panels (existing — no change)
- Developer profile placeholder (name + contact)
- CTAs: Enquire / WhatsApp / Save / Compare / Request site visit (the last is an inquiry with `inquiry_type='site_visit'`)

**Developer / project lister flow:**
1. `/listing/new` → standard wizard
2. Choose `land_type` from the new project options (e.g., `farm_plot_project`) → conditional `ProjectFieldsStep` appears as Step 2.5: project name, developer name, project stage, corridor (autosuggest from canonical list), distance, total acres, plot count, plot size range, amenities (multi-select), layout approval status, conversion status, maintenance fee
3. Plot inventory editor inline (optional in MVP — they can skip and add plots later via edit)
4. Standard auth gate, standard pending-approval queue, standard owner edit

**Admin flow:** zero change. The pending queue already handles farm plot projects because they're regular listings.

---

## 7. SEO plan

**Per page:**
- Unique `<title>` with corridor/city name + "farm plot projects" + a unique modifier (e.g., "from ₹X lakh", "near Bangalore", or year)
- Unique meta description per page (no boilerplate)
- `LocalBusiness` + `BreadcrumbList` JSON-LD on city + corridor pages
- `FAQPage` JSON-LD on each corridor page (3–5 corridor-specific FAQs)
- Canonical tag
- ISR (`export const revalidate = 3600`)

**Content density per corridor page (target: 600–900 words of unique copy):**
- Hero with corridor name + 1-line positioning
- 1 paragraph: what the corridor is known for (proximity to airport, hills, plantations, etc.)
- 1 paragraph: typical land use, plot sizes, price band observed from your data
- Top 6–10 projects in this corridor (cards using existing ListingCard)
- A 4–6 row table: corridor stats (avg distance from Bangalore, avg ₹/acre, project count, common amenities)
- 1 paragraph: legal note for the state (KA or TN) with a deep-link to `/legal/state/karnataka` or `/legal/state/tamil_nadu`
- 3–5 FAQs (e.g., "Can NRIs buy farm plots in Hosur?", "What documents to check on Kanakapura Road?")
- Internal links: city page, related corridors, `/explore` with corridor filter pre-applied, `/legal` for state-specific checklist
- CTA: "Looking for something specific? Post a requirement" → `/buy` pre-filled

**Sitemap:**
```typescript
// in app/sitemap.ts, extend the existing array:
const farmPlotRoutes = [
  '/farm-plots',
  '/farm-plots/bangalore',
  ...CORRIDORS.map(c => `/farm-plots/${c.slug}`),
];
// add each with lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7
```

**What NOT to do for SEO:**
- Don't create thin corridor pages with no projects. Six corridors is the cap until you have real seed inventory in each.
- Don't auto-generate "X projects in Y corridor" pages from cross-product. Each page must have unique editorial content (the corridor paragraph) plus listings.
- Don't auto-translate copy to Hindi/Kannada for SEO without native review — bad translations damage SEO and trust.

---

## 8. Admin / sales integration

The existing admin dashboard handles farm plot projects with no new pages:
- New projects flow through the existing `pending → active` approval queue
- Inquiries (including site-visit requests, tagged via `inquiry_type='site_visit'`) appear in the existing inquiries list
- Buyer requirements with project-type `land_types` appear in the existing requirements list
- The Founder Intelligence dashboard at `/admin/intelligence` already groups by district + land type; new `land_type` values appear automatically

**Tiny additions to admin (optional, ~30 min each, can be deferred):**
- A "corridor" column on the pending listings table (when populated)
- A "site visit requests" badge count on the inquiries view (filter by `inquiry_type`)

Neither is required for MVP.

---

## 9. Analytics / search logging plan

**`search_logs` extension:**
- Add `corridor text` column if not already there (so corridor selections in `/explore` are captured)
- Existing logging already fires on filter changes

**New PostHog events** (only when PostHog is wired in — currently it isn't, so these are aspirational placeholders to use when the analytics layer ships):
```
farm_plots_hub_viewed          { source, utm }
farm_plot_city_viewed          { city }
farm_plot_corridor_viewed      { corridor, city, project_count }
farm_plot_filter_applied       { filter, value }
farm_plot_project_viewed       { listing_id, corridor, price_bucket }
farm_plot_plot_clicked         { listing_id, plot_label }
site_visit_requested           { listing_id, corridor }
farm_plot_calculator_used      { plot_size, plot_price }   // when calculator ships
farm_plot_lead_captured        { source_page, corridor }
```

**Founder intelligence outputs** that surface naturally without new code:
- The existing weighted demand vs. supply by `land_type` will show farm_plot demand vs. supply
- The existing `/api/wanted-areas` nudge will surface under-served corridors once searches accumulate
- The weekly digest will include farm plot demand automatically

**Skip building dedicated farm-plot analytics dashboards for MVP.** The descriptive layer is enough; predictive scoring (corridor opportunity score, developer reliability score, etc.) needs real data volume — same point as the legal navigator.

---

## 10. Phased roadmap

| Phase | When | Scope | Effort |
|---|---|---|---|
| **MVP** | Now → 1 week | Schema, conditional UI, 3 SEO surfaces (hub + city + 6 corridors), buyer requirement options | ~5 days Claude Code |
| **Phase 2** | After 5+ real projects per corridor, 50+ real inquiries | Total Cost Calculator, site visit booking flow, developer profile pages, document upload tied to project, tiered verification badges (Basic / Verified / Documents Available), WhatsApp brochure | ~3 weeks |
| **Phase 3** | After 50+ projects, real developer relationships | Developer dashboard, lead assignment, Risk Score specific to farm plots, AI buyer report, AI listing assistant, resale marketplace, drone/360, full corridor intelligence | Months |

The Phase boundaries are gated by **real activity numbers**, not by time. Resist building Phase 2 until the MVP has 5+ projects in at least 3 corridors and 20+ buyer enquiries.

---

## 11. Files likely to change (audit before editing)

**Modify:**
- `app/listing/new/page.tsx` (or wherever the wizard orchestrator lives) — add conditional project step
- `app/listing/[id]/page.tsx` — add `<FarmProjectSections />` conditional block
- `app/listing/[id]/edit/page.tsx` — mirror the create form's conditional fields
- `app/components/ListingCard.tsx` — add "Project" label + project-count line
- `app/explore/page.tsx` + `app/components/SearchFilters.tsx` — extend `land_type` options
- `app/buy/page.tsx` + buyer requirement form — extend `land_types` options
- `app/sitemap.ts` — add new farm-plot routes
- `app/lib/land.ts` (or wherever `LAND_TYPES` is defined) — add new entries with display labels
- Wherever the existing land-type label/icon registry lives — extend with the new types

**Create:**
- `app/farm-plots/page.tsx` — hub
- `app/farm-plots/bangalore/page.tsx` — city
- `app/farm-plots/[corridor]/page.tsx` — corridor pages (single dynamic route; `generateStaticParams` from `app/lib/farm-plots/corridors.ts`)
- `app/components/farm-plots/FarmProjectSections.tsx`
- `app/components/farm-plots/PlotInventoryTable.tsx`
- `app/components/farm-plots/PlotInventoryEditor.tsx`
- `app/components/farm-plots/ProjectOverviewCard.tsx`
- `app/components/farm-plots/DeveloperProfileCard.tsx`
- `app/components/farm-plots/AmenitiesGrid.tsx`
- `app/components/farm-plots/CorridorBadge.tsx`
- `app/components/farm-plots/FarmPlotHero.tsx`
- `app/components/farm-plots/CorridorGrid.tsx`
- `app/lib/farm-plots/types.ts`
- `app/lib/farm-plots/corridors.ts`
- `app/lib/farm-plots/amenities.ts`
- `app/lib/farm-plots/copy.ts`
- `supabase-farm-plots.sql` — the migration from section 4 (manual run in Supabase SQL Editor like existing SQL files)

**Don't touch:**
- Anything outside `app/farm-plots/`, `app/components/farm-plots/`, `app/lib/farm-plots/`, and the files in "Modify" above
- Legal navigator, agent dashboard, admin intelligence — they pick up new land types automatically
- The brand rename (AcreHub vs Bhumi) — that's a separate refactor (and `bhumi.vercel.app` and the repo path are infra, not brand, per CLAUDE.md)

---

## 12. Risks and assumptions

**Risks:**
1. **Scope creep into Phase 2** mid-build (calculator, site visit system, developer dashboard). *Mitigation:* the MVP scope above is the hard line; reject any addition that doesn't appear in section 2.
2. **Thin corridor pages** with no real projects — hurts SEO + trust. *Mitigation:* only the 6 named corridors get pages until you have ≥3 real projects in each. Hide the page (return 404) if it has fewer than 1 real project for the first 30 days.
3. **TN-side legal complexity** — Hosur, Denkanikottai, Krishnagiri are Tamil Nadu, but buyer demand comes from Bangalore. Legal guidance for these must route to `/legal/state/tamil_nadu`, which is currently `published=false`. *Mitigation:* surface the disclaimer prominently; flip TN published only after lawyer review; do not let the farm plot page imply legal clarity that isn't there.
4. **Schema bloat on `listings`** — adding 15 nullable columns is borderline. *Mitigation:* every column is nullable; non-project listings see no change; this is a one-time addition, not an ongoing pattern.
5. **Plot inventory editor UX** — listing wizard already does a lot; adding inline plot management could feel heavy. *Mitigation:* make the inventory editor optional in the create flow (with a "skip and add later via edit" path).
6. **Existing SQL migrations not yet applied** — this MVP adds another `.sql` file. If the prior ones haven't been run in Supabase, neither will this. *Mitigation:* document the run order in the file header; tell user to run all outstanding `.sql` files together.

**Assumptions:**
- The existing `is_admin()` Supabase function and `listings.owner_user_id` field referenced in section 4 exist (per `CLAUDE.md`).
- The `LAND_TYPES` enum/options live in a central place (`app/lib/land.ts` or similar) — verify in step 1 of the build.
- Existing tracker (`docs/project-tracker.md`) and CLAUDE.md will be updated to reflect new routes and tables at the end of the build.
- "Bangalore" stays the only fully-built city for MVP; Hyderabad/Chennai/Pune corridors are Phase 2.

---

## 13. Testing checklist (manual + smoke)

**Manual QA (do all of these in an incognito window after deploy):**

1. **`/explore` filter:**
   - Apply `land_type=farm_plot_project` — only project-type listings appear
   - Card shows the "Project" badge
2. **Listing creation as a developer:**
   - Sign up fresh, go to `/listing/new`
   - Select `land_type=farm_plot_project` — project-specific fields appear
   - Add 2 plot rows in the inventory editor
   - Submit — listing goes to `pending` status
3. **Admin approval:**
   - Sign in as admin, approve the pending listing
4. **Project detail page:**
   - Listing detail page renders the new sections: Project Overview, Plot Inventory Table, Amenities, Developer Profile
   - Corridor badge appears and links to `/farm-plots/[corridor]`
   - Standard sections still render (map, photos, contact, Trust Score, Suitability, save/share/compare)
5. **Corridor page:**
   - `/farm-plots/devanahalli` (or whichever corridor your test listing is in) — page renders, shows the test listing in the project grid
6. **Hub + city:**
   - `/farm-plots` — corridor grid renders, sample projects shown
   - `/farm-plots/bangalore` — page renders, corridor list with counts
7. **Buyer requirement:**
   - `/buy` — `farm_plot_project` is a selectable land type
   - Submit a requirement with that type; it shows up in `/requirements`
8. **Sitemap:**
   - `/sitemap.xml` — new farm-plot URLs present
9. **Mobile (360px width):**
   - All new pages and conditional sections render correctly on phone width
10. **Trust + Suitability:**
    - Existing Trust Score still computes; new fields don't break it

**Smoke tests** (add to `tests/smoke/pages.spec.ts` if the smoke layer exists):

```
GET /farm-plots                              → 200, contains "Farm plot projects"
GET /farm-plots/bangalore                    → 200, contains "Bangalore"
GET /farm-plots/kanakapura-road              → 200, contains "Kanakapura"
GET /farm-plots/devanahalli                  → 200, contains "Devanahalli"
GET /farm-plots/hosur                        → 200, contains "Hosur"
GET /sitemap.xml                             → 200, contains "/farm-plots/"
GET /explore?land_type=farm_plot_project     → 200
```

**Things to NOT test in MVP (because they're not built):**
- Total Cost Calculator
- Site visit booking
- Developer dashboard
- Tiered verification badges
- Risk Score specific to farm plots

---

## 14. Claude Code build prompts (paste into Claude Code in order)

### Prompt 1 — Inspect, plan, schema

```
Read CLAUDE.md, docs/project-tracker.md, and docs/farm-plots-spec.md.
Then inspect the codebase to confirm where LAND_TYPES is defined, where
the listing creation wizard step components live, and where ListingCard
renders. Don't write any code yet — give me a short inspection report:
1. The current location of land-type options
2. The wizard step file structure
3. Any obvious file naming conflicts with what the spec proposes
4. Then output the SQL migration from spec section 4 as
   supabase-farm-plots.sql, ready for me to paste into the Supabase
   SQL Editor.
```

### Prompt 2 — Land types + lib + schema apply confirmation

```
I've run supabase-farm-plots.sql in the Supabase SQL Editor.

Now implement:
1. app/lib/farm-plots/types.ts (per spec section 5)
2. app/lib/farm-plots/corridors.ts — the 6 corridors from the spec
   (slug, label, parent_city, state). Add a list type so future
   corridors are easy to add.
3. app/lib/farm-plots/amenities.ts — canonical list with display label
   and a Lucide icon name.
4. app/lib/farm-plots/copy.ts — typed copy module for hub, city, and
   corridor pages. Leave the actual prose as TODO/placeholders for me
   to fill in — but with the right structure (hero text, corridor
   paragraph, FAQ items).
5. Extend the existing LAND_TYPES (wherever it lives — you found it in
   Prompt 1) to include the 5 new project types from spec section 2,
   with display labels.

Don't touch the wizard or any pages yet. Show me the diff.
```

### Prompt 3 — Listing wizard, edit, and ListingCard

```
Extend the existing listing creation flow:
1. Add a ProjectFieldsStep component used conditionally when land_type
   is project-type. Fields per spec section 4 / section 5
   (project_name, developer_name, project_stage, corridor with
   autosuggest from corridors.ts, distance_from_city_km,
   travel_time_minutes, total_project_acres, plot_count,
   plot_size_min/max + unit, maintenance_fee_amount/period,
   amenities multi-select from amenities.ts, layout_approval_status,
   conversion_status, possession_timeline).
2. PlotInventoryEditor component (client) for adding/removing plot rows
   inline. Skippable in MVP — header says "(optional)".
3. Mirror these on /listing/[id]/edit.
4. Extend ListingCard: when listing is project-type, show a small
   "Project" badge + project_name + plot_count if known.
5. Extend the buyer requirement form options at /buy.
6. Extend the explore filter chips and SearchFilters.

Server-side validation in the create/edit submit handlers: validate
the new fields are sensible if present (distance > 0, plot_count > 0,
plot sizes positive, corridor slug exists in corridors.ts).

Show me a plan first.
```

### Prompt 4 — Listing detail conditional sections

```
Add the conditional farm-project sections to /listing/[id]:
1. FarmProjectSections.tsx — orchestrates the conditional block,
   rendered only when listing's land_type is project-type.
2. ProjectOverviewCard.tsx
3. PlotInventoryTable.tsx — query farm_project_plots via the existing
   anon supabase client (RLS handles visibility); sortable; mobile
   responsive.
4. AmenitiesGrid.tsx
5. DeveloperProfileCard.tsx (placeholder; no separate developer page yet)
6. CorridorBadge.tsx — links to /farm-plots/[corridor]

Position these between the existing hero/map and the existing
description/contact sections — don't replace anything.

Existing Trust Score, Suitability, save/share/compare, photos, map,
inquiry must keep working unchanged.
```

### Prompt 5 — SEO pages + sitemap + smoke tests

```
Build the SEO surfaces:
1. app/farm-plots/page.tsx — hub. Server component, ISR 60min.
   Sections: FarmPlotHero, CorridorGrid (with project counts via
   server-side query), 3-card sample projects, FAQ schema.
2. app/farm-plots/bangalore/page.tsx — city. Server, ISR.
   Sections: hero, corridor list with project counts, intro paragraph,
   price band paragraph (computed from listings), link to /legal.
3. app/farm-plots/[corridor]/page.tsx — dynamic. Use
   generateStaticParams() from corridors.ts. Server, ISR. Sections per
   spec section 7. Project grid uses existing ListingCard via a filtered
   query. State-specific legal CTA links to /legal/state/karnataka or
   /legal/state/tamil_nadu based on corridor.state.
4. Update app/sitemap.ts to enumerate the new routes.
5. If the smoke test layer exists (tests/smoke/), add the smoke tests
   from spec section 13.
6. Run npm run build and fix any TypeScript errors. Commit.
7. Update CLAUDE.md and docs/project-tracker.md to reflect what shipped.

I'll write the actual copy in copy.ts myself — leave placeholders for
the hero text, corridor paragraphs, and FAQ answers, but generate
sensible defaults so the build doesn't error.

Don't push to main. I'll review the branch and merge.
```

---

## 15. The non-code work that runs in parallel

Per CLAUDE.md's pattern: the code is the easy half. Real progress on this vertical depends on:

1. **Seed 3–5 real farm plot projects per corridor before launching the corridor pages publicly.** Pages without projects are SEO poison and trust poison. Your Bangalore network should be able to surface developers in Devanahalli, Nandi Hills, and Kanakapura Road within a week of asking.
2. **Decide on the verification standard for farm plot projects.** What does "AcreHub Verified" mean for a project? Likely: developer identity + layout approval document + EC + site visit. Write the policy before you start verifying.
3. **Lawyer review for the TN-side disclaimer.** Hosur/Denkanikottai/Krishnagiri projects need a different legal preamble than Karnataka projects. The `/legal/state/tamil_nadu` content must be reviewed and `published=true` before farm plot corridor pages in TN go live, or pull TN corridors out of MVP.
4. **Pick one developer to be your launch partner.** A relationship with one real developer (give them a featured corridor page, in exchange for 3+ verified projects + commitment to respond to leads in 24h) is worth more than 20 generic listings.

If you do those four things while Claude Code does the code, the launch lands with real content from day one. If you do only the code, you launch with empty corridor pages and nothing for Google or buyers to engage with.

---

*Last updated: June 7, 2026. Companion to CLAUDE.md and docs/project-tracker.md. See also docs/legal-navigator-spec.md for the legal-content governance pattern this borrows.*
