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
