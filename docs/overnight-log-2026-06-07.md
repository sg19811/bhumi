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

---
