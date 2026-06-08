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

---

# Overnight foundation-hardening log — 2026-06-07

Branch: `overnight/foundation-hardening` (from `main`). Not pushed.
Guardrails honored: no `.env.local` edits, no RLS/schema changes (no drops/renames), commit per phase.

Goal: harden the foundation (tests, analytics, validation, error handling, calculators) — no new product features.

---

## Phase 1 — Smoke-test layer ✅

- Added `@playwright/test` dev dependency.
- `playwright.config.ts` — request-based (HTTP only, **no browser binaries**), `webServer`
  builds + starts the app on port 3100; `baseURL` set.
- `tests/smoke/pages.spec.ts` — 13 tests: 200 + unique per-page string for `/`, `/explore`,
  `/legal`, `/legal/wizard`, `/listing/new`, `/buy`, `/requirements`, `/about`, `/region/Mysuru`,
  `/land/orchard`, `/tools`; `/agent` resolves; `/eligibility` permanent redirect → `/legal`.
- npm scripts: `test:typecheck`, `test:lint`, `test:smoke`.
- `.github/workflows/checks.yml` — typecheck + lint on every push/PR (no env); `smoke` job uses
  Supabase secrets.
- Documented in CLAUDE.md (Testing & CI section). `.gitignore` updated for Playwright artifacts.

**Verified:** `tsc --noEmit` clean; `eslint` clean for new files; `playwright test --list` shows all 13.
**Not run here:** full smoke execution (needs `next build && next start` + Supabase env). Runs via CI/locally.

**Deviations / notes (not guesses — flagged for review):**
- Next.js `permanent: true` emits **308**, not 301 — test accepts 301 *or* 308.
- `/agent` does **not** HTTP-redirect to signin; it gates **client-side** (in-page "Agents only"
  gate; SSR shows a loading state). The smoke test asserts the route resolves (200); verifying the
  logged-out gate UI needs a browser-based test → **follow-up**, or change `/agent` to a real redirect.
- CI `smoke` job needs repo secrets (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`); typecheck + lint run without env.
- (Housekeeping) `.claude/settings.json` (local Claude Code config) was accidentally swept into the
  first commit by `git add -A`; untracked it and added `.claude/` to `.gitignore`, amended the commit.

---

## Phase 2 — External analytics scripts ✅

- `app/components/Analytics.tsx` (client) renders, via `next/script` (`afterInteractive`):
  - **GA4** when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (loader + `gtag('config', …)` — auto pageview).
  - **PostHog** when `NEXT_PUBLIC_POSTHOG_KEY` is set (official snippet; `NEXT_PUBLIC_POSTHOG_HOST`
    defaults to `https://us.i.posthog.com`; auto-pageviews on by default). The snippet also defines
    `window.posthog`, so the existing `lib/legal/analytics.ts` `capture()` calls activate too.
- **Env-gated:** nothing renders when the vars are unset → dev/local stays clean.
- Rendered in `app/layout.tsx`. Documented in CLAUDE.md (env-vars section, with where to set keys).
- **Verified:** tsc clean; eslint clean for `Analytics.tsx`.

**Notes:** GA4's `gtag config` sends the initial pageview; SPA route-change pageviews would need a
small route-change listener (PostHog auto-captures SPA pageviews already). Per the brief
("auto-pageviews only — no custom events tonight") I did **not** add a GA SPA listener — flagged as
an optional follow-up.

---

## Phase 3 — Server-side listing input validation ✅ (with a documented architecture caveat)

- Added `zod` (v4). `app/lib/validation/listing.ts` — shared schema: title (3–120), description (≤4000),
  land_type required, price > 0, area_value > 0, area_unit required, latitude ∈ [−90,90],
  longitude ∈ [−180,180], district/taluka/village length-capped, contact_phone/whatsapp digits-only
  (7–15), contact_email format, photos/videos must start with the Supabase Storage public prefix.
- `app/api/listings/validate/route.ts` — POST runs the schema **server-side**, returns per-field
  messages (422) or `{ ok: true }`.
- `app/lib/validation/client.ts` — `validateListingPayload()` calls the gate; create + edit forms
  validate before writing and surface the combined message (added an error banner to the edit form).
- **Verified:** tsc clean, `next build` clean, `/api/listings/validate` route present.

**Architecture caveat (NOT a guess — flagged for your decision):** the create/edit flows write to
Supabase **directly from the client** (with RLS + the user's session). I added a server-side
validation *gate* the forms call before writing, rather than moving the write itself behind an
authenticated server action/route — that move (token-passing for `auth.uid()`/`owner_user_id`, photos
already uploaded client-side) is a real architecture change I won't make unilaterally on an unattended
run. **Consequence:** validation runs server-side and is surfaced to the form, but a crafted client
could still bypass it at the write boundary. The gate **fails open** if the validation route is
unreachable, so a gate outage can't block listing creation. **Recommended follow-up:** route the
write through an authenticated server action/route handler to enforce validation at the boundary.

---

## Phase 4 — Validate env vars on startup ✅

- `app/lib/env.ts` validates the three required vars: URL must parse; anon key must be
  `sb_publishable_…` **or** a JWT (`eyJ…`); service-role key must be `sb_secret_…` **or** a JWT;
  and flags the service-role key if ever exposed via `NEXT_PUBLIC_`. **Throws in production**,
  **warns in dev**. Never logs secret values — only the var name + expected shape.
- Imported as a side-effect in `app/layout.tsx`, so it runs on the server at build + request time.
- **Verified:** tsc clean; `next build` clean (local `.env.local` present → no false positive).

**Note:** key checks accept both the new `sb_*` format and legacy JWT keys, so a valid legacy
project won't trip the guard. The CI `smoke` job (which builds) has the Supabase secrets, so its
build won't throw; the typecheck/lint jobs don't build.

---

## Phase 5 — Replace `window.confirm()` with a modal ✅

- `app/components/ConfirmModal.tsx` — `ConfirmProvider` + `useConfirm()` promise-based hook
  (`if (!(await confirm({title, message, confirmLabel, tone}))) return;`). Earthy tokens; **Esc and
  backdrop-click both cancel**; confirm button autofocused; `role="dialog"` + `aria-modal`.
- Provider mounted in `app/layout.tsx` (inside the existing providers).
- Replaced all 3 `window.confirm()` call sites: `AdminListingRow` (delete listing — danger),
  `my-requirements` (delete requirement — danger), `collections` (delete collection — danger).
- **Verified:** `grep` shows no `confirm(` left; tsc clean; `next build` clean.

---

## Phase 6 — Route-level error boundaries ✅

- `app/components/RouteError.tsx` — shared, on-brand error UI: calm message, **Try again** (calls
  `reset()`), **Go home**, shows `error.digest` ref, and `console.error(error)` (surfaces in Vercel logs).
- `error.tsx` added to 6 segments: `app/legal`, `app/listing`, `app/admin`, `app/agent`,
  `app/region`, `app/land` — each a `"use client"` boundary rendering `RouteError`.
- **Verified:** tsc clean; `next build` clean.

---

## Phase 7 — ROI + appreciation calculators ✅

- `app/components/RoiCalculator.tsx` — purchase price, holding period, expected annual growth %,
  optional yearly income → projected value, total return (₹ and %), and **annualised IRR**
  (bisection over the cashflow series; income=0 reduces to CAGR).
- `app/components/AppreciationCalculator.tsx` — price, annual growth %, years → projected value,
  total appreciation (₹ and %), and a year-by-year schedule (capped at 30 rows).
- Pages `app/tools/roi-calculator` + `app/tools/appreciation-calculator` (accept `?amount=` to
  pre-fill, matching the EMI page), added to the `/tools` index and the sitemap. Same earthy design.
- **Note:** no verified per-district historical growth time-series exists (price-insight is
  point-in-time medians), so growth is a user input — labelled as a planning estimate, not a forecast.
- **Verified:** tsc clean; `next build` clean; both routes present.

---

## Final summary

All 7 phases completed on `overnight/foundation-hardening` (from `main`), one commit each, **not pushed**.

| Phase | Result | Commit |
|---|---|---|
| 1 Smoke tests + CI | ✅ | Playwright (request-based) + checks.yml + scripts |
| 2 Analytics scripts | ✅ | GA4 + PostHog, env-gated |
| 3 Server-side validation | ✅ (with caveat) | zod gate; write still client-side under RLS (follow-up logged) |
| 4 Env validation | ✅ | `lib/env.ts`, throws in prod |
| 5 ConfirmModal | ✅ | replaced all 3 `confirm()` |
| 6 Error boundaries | ✅ | 6 segments |
| 7 ROI + appreciation calculators | ✅ | 2 new `/tools` |

**Final `npm run build`: clean.** Guardrails honored: no `.env.local`, no RLS/schema changes, no push to main.

**Needs your attention (not blockers):**
1. **Phase 3 caveat** — server validation is a *gate* the client calls; to *enforce* at the write
   boundary, route the listing write through an authenticated server action (architecture decision — left to you).
2. **`/agent`** gates client-side, not via an HTTP redirect — the smoke test asserts the route
   resolves; decide whether to add a real redirect (then tighten the test) or keep the gate.
3. **CI secrets** — add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` as repo secrets for the `smoke` job to go green (typecheck + lint need none).
4. **Analytics keys** — set `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_POSTHOG_KEY` in Vercel when ready.
5. New dev deps added (per the brief): `@playwright/test`, `zod`.

No phases were blocked; `docs/overnight-blocked.md` was not needed.
