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
