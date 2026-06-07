# Overnight log — Farm Plot Projects MVP — 2026-06-07

Branch: `overnight/farm-plots-mvp` (from `main`). **Not pushed.** Spec: `docs/farm-plots-spec.md`.
Guardrails: no `.env.local`/RLS edits, **no SQL run** (migration is output as a file for the user to run),
code defensively against not-yet-applied schema, commit per phase.

---

## Phase 1 — Inspection report + migration file

**Inspection findings (codebase audit):**

1. **Land-type registry** — canonical labels live in `app/lib/land.ts` (`LAND_TYPE_LABELS`, slug→label,
   + `landLabel()`). This is what the spec means by `LAND_TYPES`. **Note:** option *lists* are
   duplicated/hardcoded in three more places that also need the new types:
   - the create wizard `<select name="land_type">` in `app/listing/new/page.tsx`
   - `app/components/SearchFilters.tsx` land-type `<select>` (labels via i18n `t("f.t.*")`)
   - the `/buy` requirement form land-type checkbox group in `app/buy/page.tsx`
   (A separate `app/lib/legal/options.ts` `LAND_TYPE_OPTIONS` exists for the **legal** module — a
   different enum; left untouched.)
2. **Wizard structure** — the create flow is a **single client component** (`app/listing/new/page.tsx`)
   with step `div`s gated by `step` state + `stepRefs` for per-step validation, **not** separate step
   files. Plan: add `ProjectFieldsStep` as a new component rendered conditionally inside that file (and
   mirrored in `app/listing/[id]/edit/page.tsx`).
3. **ListingCard** — `app/components/ListingCard.tsx` (presentational; image overlay badges + body).
4. **Naming conflicts** — none. `app/components/farm-plots/` and `app/lib/farm-plots/` do not exist;
   no component name collisions (CorridorBadge, FarmPlotHero, etc. are all new).

**Defensive-coding note:** the migration won't be applied until the user runs it, so all new
columns/tables may be absent at build/run time. New fields read via optional chaining; `amenities`
defaults to `[]`; `farm_project_plots` reads wrapped in try/catch with a graceful empty state.

**Migration:** wrote `supabase-farm-plots.sql` (spec §4 verbatim + run-order header). 17 nullable
columns on `listings`, `farm_project_plots` child table with RLS (public-read-active / owner / admin),
and `search_logs.corridor`. **No DB changes made — file only.**

**Open questions:** none blocking. (SearchFilters labels use i18n; new project types will use plain
English options there to avoid adding keys across en/hi/kn tonight — flagged for later i18n.)

---

## Phase 2 — Lib files + land-type extension

**Changed:** created `app/lib/farm-plots/{types,corridors,amenities,copy}.ts`; extended
`app/lib/land.ts` `LAND_TYPE_LABELS` with the 5 project types; added a "Farm plot projects" optgroup
to `app/components/SearchFilters.tsx`.
- `types.ts` — `ProjectLandType` + `PROJECT_LAND_TYPES` + null-safe `isProjectType()`, all field enums,
  `ProjectFields` (optional), `FarmProjectPlot`, `Corridor`, `Amenity`.
- `corridors.ts` — the 6 corridors (slug/label/parent_city/state); `getCorridor`, `corridorExists`,
  `corridorLabel`. Hosur is `state: "tamil_nadu"`; the rest `"karnataka"`.
- `amenities.ts` — 12-amenity catalog with Lucide icon **names** (data) + an `emoji` fallback used now
  (no icon lib installed — flagged; AmenitiesGrid renders emoji + label).
- `copy.ts` — typed `HubCopy`/`CityCopy`/`CorridorCopy` with **placeholder prose marked TODO** and a
  prominent TODO + lawyer-review note on the Hosur (TN) legal paragraph. Structure final.
**Assumed:** new SearchFilters options use plain English (i18n keys deferred). Land-type extension is
app-level only (no DB enum), matching the migration.
**Verified:** tsc clean for the new/changed files.
**Open questions:** none.

---

## Phase 3 — Wizard, edit, ListingCard, buyer requirement, validation

**Changed:** create wizard (`app/listing/new/page.tsx`), edit (`app/listing/[id]/edit/page.tsx`),
`ListingCard`, `/buy` form. **New:** `app/components/farm-plots/ProjectFieldsStep.tsx`,
`PlotInventoryEditor.tsx`, and `app/lib/farm-plots/submit.ts` (shared `collectProjectFields`,
`validateProjectFields`, `plotRowsForInsert`).
- Create + edit: land-type select gains the project optgroup and is now controlled (tracks `landType`);
  when project-type, `ProjectFieldsStep` (all spec fields) + `PlotInventoryEditor` render. Submit
  collects project columns **only for project types** and runs defensive validation
  (distance>0, plot_count>0, plot sizes>0, max≥min, corridor must exist in corridors.ts, plot rows).
- `ListingCard`: "Project" badge + project_name + plot_count line when `isProjectType`.
- `/buy`: 5 new land-type checkboxes.
**Verified:** tsc + `next build` clean.

**Deviations (flagged, not guesses):**
1. **Project fields render inside the existing Basics step**, not a literal new "Step 2.5" — kept the
   fixed 4-step structure to avoid reindexing the wizard's step/validation arrays (lower risk; same UX).
2. **Corridor is a `<select>`** of the 6 corridors, not a free-text autosuggest — safer and it makes the
   "corridor must exist" validation inherent.
3. **Create-time plot inventory save is best-effort.** Pending listings aren't owner-readable under
   current RLS, so `.select("id")` after insert usually returns null → plots can't be attached at create.
   The editor is shown (spec says optional), but plots are **reliably saved via edit** (where the id is
   known and the migration's `owner manages plots` policy applies). Matches the spec's
   "skip and add later via edit."
4. **Defensive vs unapplied migration:** project columns are only sent for project-type listings; plot
   reads/writes are wrapped (table-missing tolerated); the build never touches the DB.
**Open questions:** validation runs client-side in the submit handlers (this branch's create/edit are
client components, as on `main`); enforcing at a server boundary is the same architecture question
flagged for listings generally — not changed here.

---

## Phase 4 — Listing detail conditional sections

**New:** `app/components/farm-plots/{FarmProjectSections,ProjectOverviewCard,PlotInventoryTable,
AmenitiesGrid,DeveloperProfileCard,CorridorBadge}.tsx`. **Changed:** `app/listing/[id]/page.tsx`
mounts `<FarmProjectSections listing={listing} />` between the stat tiles/legal-links and the
PriceInsight/Trust block.
- `FarmProjectSections` self-gates via `isProjectType` (renders null for non-projects → safe to mount
  unconditionally). Composes overview → plot table → amenities → developer card.
- `ProjectOverviewCard` — null-safe stat grid (acres, plots, plot-size range, stage, possession,
  distance/time, maintenance, layout/conversion) + `CorridorBadge`.
- `PlotInventoryTable` (client) — fetches `farm_project_plots` via the anon client (RLS-scoped),
  sortable columns, `overflow-x-auto` for mobile, and **graceful empty/missing-table state**
  ("Plot inventory will appear here…") — pre-migration the query errors and we just show that.
- `AmenitiesGrid` (empty-safe), `DeveloperProfileCard` (placeholder name + contact), `CorridorBadge`
  (links to `/farm-plots/[corridor]`, hidden for unknown slug).
**Untouched:** Trust Score, Suitability, photos, map, save/share/compare, inquiry — all still render.
**Verified:** tsc + `next build` clean.
**Open questions:** none.

---

## Phase 5 — SEO surfaces

**New pages (server, `revalidate=3600`):** `app/farm-plots/page.tsx` (hub), `.../bangalore/page.tsx`
(city), `.../[corridor]/page.tsx` (dynamic, `generateStaticParams` from corridors.ts),
`.../legal-checklist/page.tsx` (redirect → `/legal/checklist`). **New components:** `FarmPlotHero`,
`CorridorGrid`. **New helper:** `app/lib/farm-plots/queries.ts` (`getCorridorCounts`,
`getProjectListings` — both defensive, return zero/empty if the corridor column/table isn't there yet).
- Hub: hero + intro + CorridorGrid (counts) + 3 sample projects (ListingCard) + FAQPage JSON-LD + legal CTAs.
- City: hero + breadcrumb JSON-LD + intro + **computed price band** + corridor grid + FAQs + KA legal link.
- Corridor: `generateStaticParams` for the 6; FAQPage + BreadcrumbList JSON-LD; stats tiles
  (projects, avg distance, state, near); ListingCard project grid (or empty CTA); **state-routed legal
  link** (`/legal/state/karnataka` or `/legal/state/tamil_nadu`); unknown slug → `notFound()`.
- **All copy from `copy.ts` placeholders** — founder edits the prose.
**Deviations:** (a) corridor pages render a graceful empty state rather than `notFound()` when they have
zero projects — the spec's "404 if <1 project for 30 days" is a publishing/SEO decision left to the
founder (flagged). (b) The "Browse all farm plot projects" link filters `/explore` by `land_type` only;
an explore *corridor* filter isn't built (search_logs.corridor is for logging) — deferred.
- **TN risk handled:** Hosur corridor shows a prominent amber disclaimer that TN legal content is under
  review (spec risk #3).
**Verified:** tsc + `next build` clean; all 4 routes present.
**Open questions:** none.

---

## Phase 6 — Sitemap + smoke tests + build

- **Sitemap:** `app/sitemap.ts` now enumerates `/farm-plots`, `/farm-plots/bangalore`, and the 6
  corridor routes (dynamic from `CORRIDORS`) with `changeFrequency: weekly`, `priority: 0.7`.
- **Smoke tests: skipped (conditional).** `tests/smoke/` does **not** exist on this branch — the
  Playwright smoke layer lives on the unmerged `overnight/foundation-hardening` branch, not `main`.
  Per the brief ("if the smoke layer exists"), I did not add Playwright here. **Morning action:** once
  the hardening branch is merged, add the spec §13 farm-plot cases to `tests/smoke/pages.spec.ts`.
- **Build:** `npm run build` clean.
**Open questions:** none (smoke deferred by design, logged above).

---

## Phase 7 — Docs

- CLAUDE.md "What's built" gains a Farm Plot Projects MVP block (land types, schema/tables,
  components, routes, lib). (Did **not** do the broader Bhūmi→AcreHub/Stage-3 resync — that's the
  separate `chore/tracker-resync` branch's job; kept this change scoped to farm plots.)
- `docs/project-tracker.md` gains a "Farm Plot Projects MVP ✅" section with what shipped, Phase-2
  deferrals, and founder follow-ups.

---

## FINAL SUMMARY

**Branch:** `overnight/farm-plots-mvp` (from `main`). **Not pushed. No SQL run. No RLS/.env edits.**
All 7 phases complete, one commit each (eaec894 → final). Every phase: `tsc` + `next build` clean.

**What shipped:**
- Migration FILE `supabase-farm-plots.sql` (output only — additive columns + `farm_project_plots` + RLS + `search_logs.corridor`).
- 5 new project `land_type`s wired through land registry, explore filter, create wizard, edit, `/buy`.
- `app/lib/farm-plots/` (types, corridors×6, amenities, copy placeholders, submit, queries).
- Create/edit: conditional `ProjectFieldsStep` + optional `PlotInventoryEditor` + defensive validation.
- Listing detail: `FarmProjectSections` (overview, plot table, amenities, developer, corridor badge) — self-gating, existing sections untouched.
- ListingCard project badge. SEO: `/farm-plots` hub + `/farm-plots/bangalore` + 6 `/farm-plots/[corridor]` + legal-checklist redirect; sitemap + JSON-LD.
- Docs updated (CLAUDE.md + tracker).

**What's blocked / deferred:** nothing blocked (no `overnight-blocked.md` needed). Deliberately deferred:
Playwright smoke tests (the smoke layer isn't on this branch — it's on `overnight/foundation-hardening`);
all spec Phase-2 items (calculator, site-visit, developer dashboard, etc.).

**Defensive design (because the migration isn't applied yet):** project columns are sent only for
project-type listings; `farm_project_plots` reads/writes are wrapped (table-missing tolerated → empty
states); corridor counts/listings default to zero/empty on query error; all detail-page field reads are
null-safe. **The build does not touch the DB, so it is safe before the migration runs.**

**MORNING TO-DO (in order):**
1. **Run `supabase-farm-plots.sql`** in the Supabase SQL Editor (after any other outstanding
   `supabase-*.sql`). This adds the columns + `farm_project_plots` table + RLS. Nothing works end-to-end until this is done.
2. On the `overnight/farm-plots-mvp` branch, test per spec §13: create a `farm_plot_project` listing
   (add 2 plots via **edit** after approval — see note below), approve it in `/admin`, view the detail
   page sections, the corridor page, the hub/city, the `/buy` option, and `/sitemap.xml`.
3. **Edit the placeholder copy** in `app/lib/farm-plots/copy.ts` (hero/corridor/FAQ prose) before going public.
4. Then merge to `main` (Vercel auto-deploys).

**Known nuance to verify in the morning:** create-time plot inventory may not persist (pending listings
aren't owner-readable under current RLS, so the new listing's id isn't retrievable client-side) — add
plots via **edit** after the listing exists. This matches the spec's "optional — add later via edit."
If you want create-time plot save, that needs an owner-read RLS policy or a server write path (logged as
an architecture decision, not done).
