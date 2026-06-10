@AGENTS.md

# Bhūmi — Project Context for Claude Code

> Read this before making changes: the project's why, how, and what's-next.
> The line above imports `AGENTS.md` (the hard framework rule). Longer specs live in `docs/`.

## Framework note (critical)

Next.js 16 in this repo has breaking changes vs. training data (see the imported
`AGENTS.md`). **Read the relevant guide in `node_modules/next/dist/docs/` before
writing any Next.js code**, and heed deprecation notices.

## What this is

Bhūmi is a parcel-first agricultural land marketplace, India-first, built around
**trust, legal clarity, and real maps** — the opposite of the bait-and-switch
listings on MagicBricks/99acres for land. Founder is a non-coder; assume the user
is learning. Be explicit, never assume Linux/macOS conventions.

## Stack (locked in — don't replace)

- **Next.js 16 (App Router, Turbopack)** + TypeScript + Tailwind CSS
- **Supabase** (hosted Postgres + Auth + Storage)
- **Vercel** (host, auto-deploys from `main`)
- **Leaflet + react-leaflet** with OpenStreetMap + Esri World Imagery tiles (no Mapbox/Google Maps keys)
- One GitHub repo (`sg19811/bhumi`), one Vercel project, single-branch deploys from `main`

## Operating environment

- User is on **Windows 11 / PowerShell**, project at `C:\bhumi`. Never use bash-only
  syntax (`&` backgrounding, `/tmp/`, `&&` chains in PS heredocs without testing).
  PowerShell equivalents: `Remove-Item -Recurse -Force`, here-strings `@"..."@`.
- Dev server runs on **port 3001** (3000 is occupied by an old process). Don't start
  a new dev server in the background — one is already running; tell the user to refresh.
- `.env.local` and `node_modules` are gitignored (correctly) and per-machine.

## Environment variables (three required)

| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | `sb_publishable_…` — safe in browser |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel | `sb_secret_…` — **SERVER ONLY**, bypasses RLS |

These three are required and validated at startup (`lib/env.ts`, imported in `app/layout.tsx`) —
the app throws a clear error in production if any is missing/malformed.

**Optional (analytics + email — leave unset and the feature stays off):**

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 (`G-…`) — Vercel only; `app/components/Analytics.tsx` |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog auto-pageviews (host defaults to `https://us.i.posthog.com`) |
| `RESEND_API_KEY` / `ALERT_FROM_EMAIL` / `FOUNDER_EMAIL` | email alerts + weekly intelligence digest crons |
| `CRON_SECRET` | protects the cron routes |

Set analytics keys in the Vercel project (and `.env.local` if you want them locally). With them
unset, no analytics scripts render — dev/local stays clean.

Hard rule: **never** import `lib/supabase-server.ts` (the service-role client) into
any `"use client"` file. Never prefix the service-role key with `NEXT_PUBLIC_`.
Never expose it in error messages or logs.

## Repo layout

```
app/
  page.tsx                      home (search-first, discovery tiles, live counts)
  layout.tsx                    root layout, AuthProvider, SEO meta
  globals.css                   design tokens (earthy palette via Tailwind v4 @theme)
  about/page.tsx                "Why Bhūmi"
  admin/page.tsx                dashboard — uses supabaseAdmin (server)
  auth/{signin,signup}/page.tsx Supabase Auth
  buy/page.tsx                  buyer requirement form
  eligibility/page.tsx          static KA + MH legal guidance
  explore/page.tsx              map + filtered listings, text search via ?q=
  listings/page.tsx             simple grid
  listing/new/page.tsx          create form (auth-gated, photos)
  listing/[id]/page.tsx         detail (map, photos, save, share, inquiry)
  listing/[id]/edit/page.tsx    owner edit
  listing/[id]/InquiryButton.tsx
  requirements/page.tsx         public requirements list — uses supabaseAdmin (server)
  saved/page.tsx                user watchlist (client)
  sitemap.ts, robots.ts         SEO
  components/                   Header, Map, MapLoader, SearchBar, SearchFilters,
                                SearchLogger, SaveButton, PhotoUpload, WhatsAppShare,
                                OwnerEditLink, AdminListingRow, Logo, ListingCard
  lib/
    supabase.ts                 BROWSER client (anon key) — for "use client" + public reads
    supabase-server.ts          SERVER client (service-role key) — admin + requirements only
    auth.tsx                    AuthProvider + useAuth hook
```

## Data model (Supabase)

Core tables:
- `profiles` — `user_id` → `auth.users`, `role` ('user' | 'admin'), name, phone
- `listings` — title, description, land_type, price, price_basis, area_value/area_unit,
  lat/lon, district/taluka/village, water_source, road_access, electricity,
  photos (text[]), contact_phone/whatsapp, status ('active'|'sold'|'withdrawn'),
  is_verified, **owner_user_id** (→ auth.users), created_at, updated_at
- `buyer_interests` — buyer requirements (anonymous-friendly), intent, budget_min/max,
  preferred_district, land_types, notes, contact_phone, status, owner_user_id
- `inquiries` — `listing_id`, message, contact_phone, created_at
- `search_logs` — query, land_type, max_price, max_area, district, created_at
  *(founder intelligence raw data)*
- `saved_listings` — user_id, listing_id (unique together)

RLS is on. Policies use `auth.uid() = owner_user_id` for owner ops, and an
`is_admin()` SECURITY DEFINER function (checks `profiles.role = 'admin'`) for admin
overrides. To make a user admin: set their `profiles.role` to 'admin' in the
Supabase dashboard. Storage bucket `listings` (public) holds listing photos.

## What's built (don't redo)

MVP + Stage 2 are live in production:
- Auth-gated listing creation with photo upload
- Map-first explore with text search, satellite/street toggle, filters
- Listing detail with photos, save, WhatsApp share, inquiry, owner edit
- Buyer requirements (post + browse)
- Admin dashboard with verify/delete
- Search logging (data foundation for Founder Intelligence Layer)
- Saved listings / watchlist
- Sitemap, robots, SEO meta
- Earthy visual redesign — shared Logo + ListingCard, Tailwind v4 @theme tokens

**Farm Plot Projects — LIVE on `main`** (`supabase-farm-plots.sql` has been applied to Supabase):
- New `land_type` values (in `app/lib/land.ts`): `farm_plot_project`, `managed_farmland`,
  `farmhouse_plot`, `gated_farm_plot`, `plantation_project` — surfaced in explore filter, create
  wizard, edit, and the `/buy` form.
- Schema (applied): 17 nullable project columns on `listings` + child table `farm_project_plots`
  (plot inventory, RLS: public-read-active / owner / admin) + `search_logs.corridor`.
- **PAN-India location hierarchy** (data-driven; adding a city/corridor is a one-line edit):
  - `app/lib/farm-plots/cities.ts` — city registry. Bangalore `live`; 9 metros `coming_soon`.
  - Routes: `/farm-plots` (hub) → `/farm-plots/[city]` → `/farm-plots/[city]/[corridor]`. Old flat
    `/farm-plots/[corridor]` URLs 307-redirect to the nested path.
  - `CitySelector` (region-grouped menu) on every page; `CityGrid` on the hub; coming-soon cities get
    an honest placeholder page. **Farm Plots is a top-level item in the main nav** (Header + Footer).
- **Create/edit**: conditional `ProjectFieldsStep` (with a **city picker** that filters corridors to the
  chosen city) + optional `PlotInventoryEditor`. `submit.ts` validates city + corridor-belongs-to-city.
- **Project detail (`FarmProjectSections`, conditional, async)**: overview → **transparency/disclosure
  readout** (`ProjectTransparency` + `lib/farm-plots/transparency.ts`) → plot table → amenities →
  **Total Cost of Ownership calculator** (`TotalCostCalculator`) → **developer profile** (lists the
  developer's other active projects via `getProjectsByDeveloper`) → corridor badge.
- **City pages**: `ProjectsBrowser` (client filter by corridor/stage, sort by price).
- SEO: per-city/corridor metadata, FAQ + Breadcrumb JSON-LD, sitemap covers hub + cities + corridors.
  Real per-corridor + Bangalore copy in `copy.ts` (Hosur flags TN jurisdiction pending lawyer review).
- Lib: `app/lib/farm-plots/{types,cities,corridors,amenities,copy,submit,queries,transparency}.ts`.
  All listing-field reads are null-safe.

**Farm Plots — Phase 2 & 3 SHIPPED** (see `docs/project-tracker.md` for the itemised list):
- Phase 2: Total Cost calculator, transparency readout, site-visit requests, tiered verification,
  per-project document links, WhatsApp brochure, developer profile pages. Needs `supabase-farm-plots-phase2.sql`.
- Phase 3: developer dashboard (`/farm-plots/dashboard`), farm-plot Risk Score, printable buyer report
  (`/farm-plots/report/[id]`), **AI buyer report + AI listing assistant** (Claude API via server routes),
  resale marketplace (`/farm-plots/resale`), corridor intelligence (admin), lead assignment,
  virtual-tour/360 link. Needs `supabase-farm-plots-phase3.sql`.
- **Two manual steps to fully activate**: (1) run `supabase-farm-plots-phase2.sql` ✅ and
  `supabase-farm-plots-phase3.sql` ⏳ in the Supabase SQL Editor; (2) set **`ANTHROPIC_API_KEY`**
  (server-only, no `NEXT_PUBLIC_`) in `.env.local` + Vercel to enable the AI features.
- AI: `app/lib/ai/{anthropic,require-user}.ts` (server-only; calls Claude via fetch, no SDK; signed-in
  users only). Routes: `app/api/farm-plots/{ai-report,ai-listing-assist}/route.ts`.

**Buying Circles — Phase 1 LIVE** (joint land purchase; spec in `docs/buying-circles-spec.md`):
- Public: `/co-buy` hub, `/co-buy/[slug]` opportunity, `/co-buy/[slug]/express-interest` (8-ack form,
  client+server validated, NRI → `nri_legal_review`), `/co-buy/[slug]/thanks`. Conditional
  `CoBuyListingCTA` on listing detail; "Co-Buy Eligible" pill + `/explore?co_buy=1` filter.
- Admin: `/admin/co-buy` (overview + opportunity CRUD + leads), lead drawer with status/WhatsApp/call.
  Admin toggles `listings.is_co_buy_eligible` on the listing edit page.
- Server-only insert route `app/api/co-buy/interest` (`supabaseAdmin`, validates the 8 acknowledgements).
  Lib in `app/lib/co-buy/`; components in `app/components/co-buy/`. Compliance copy verbatim in `disclaimers.ts`.
- **Manual step**: run `supabase-co-buy.sql` in the Supabase SQL Editor (2 tables + `is_co_buy_eligible`).
- **Deliberately deferred** to Phase 3+: service/vendor workflow, voting, lead scoring (spec §10/§15: lawyer review + SLA).

**Buying Circles — Phase 2 BUILT** (private circle rooms; spec `docs/buying-circles-phase-2-spec.md`):
- 8 tables (`co_buy_circles`, `_circle_members`, `_documents`, `_milestones`, `_site_visits`, `_site_visit_rsvps`,
  `_events`, `_tasks`) + `is_circle_member()` RLS helper. Migration: **run `supabase-co-buy-phase-2.sql`**.
- Member: `/co-buy/circles` (your circles), `/co-buy/circles/[id]` (dashboard — milestones, site-visit RSVP,
  documents, privacy-masked members, costs, activity). "Circles" in header nav for signed-in users.
- Admin: `/admin/co-buy/circles` (list), `/circles/new` (auto-seeds milestones + state doc checklist + first member),
  `/circles/[id]` (manage members/docs/milestones/site-visits/tasks inline). "Add to circle" on the lead drawer.
- Lib in `app/lib/co-buy/circles/` (types, state-document-templates, milestone-templates, privacy, circle-actions).
  Cross-circle isolation via `is_circle_member()`. Note: many spec sub-routes are consolidated into the two dashboards.
**Buying Circles — Phase 3 BUILT** (services + vendor CRM; spec `docs/buying-circles-phase-3-spec.md`):
- 5 tables (`acrehub_vendors`, `co_buy_service_requests`, `_vendor_quotes`, `_service_tasks`, `_service_updates`).
  Migration: **run `supabase-co-buy-phase-3.sql`**. Service requests carry **three separate cost columns**
  (official / vendor / AcrehubIndia) — never shown as a lone total (regulatory positioning made structural).
- Admin: vendor CRM (`/admin/vendors`), service requests (`/admin/co-buy/services` list + create + detail with
  cost editor, quotes, tasks, updates poster, buyer-approval entry). "Add service" on the admin circle page.
- Member: `/co-buy/circles/[id]/services` + `[reqId]` (three-column cost, approval state, buyer-visible quotes,
  visibility-filtered updates, compliance disclaimers). "View services" on the circle dashboard.
- Lib `app/lib/co-buy/services/` (catalog with 13 service + 22 vendor categories + compliance copy, service-actions).
  No money flows through the platform; "approved" = circle agreed to pay offline. **Lawyer-review the copy before public use.**
**Buying Circles — Phase 4 BUILT** (scoring, team, templates, intelligence, audit; spec `docs/buying-circles-phase-4-spec.md`):
- Migration **`supabase-co-buy-phase-4.sql`**: `acrehub_team_roles`, `acrehub_message_templates`, `acrehub_audit_log`,
  lead-score columns on `co_buy_interests`, multi-owner columns on circles/service-requests, 4 reporting views
  (corridor demand, funnel, service revenue, vendor performance), `is_team_member()`/`has_team_role()` helpers.
  (Also adds nullable `corridor`/`state` to `co_buy_opportunities` so the corridor view is valid.)
- **Lead scoring** (`app/lib/co-buy/lead-scoring.ts`, pure) computed + stored on interest submit (`/api/co-buy/interest`);
  shown as a sorted badge on `/admin/co-buy/leads`. **Intelligence** dashboard `/admin/co-buy/intelligence`.
  **Templates** `/admin/templates`, **Team roles** `/admin/team`, **Audit** `/admin/audit`. Members can propose a
  service (`/co-buy/circles/[id]/services/request`, `initiator_type='member'`). Audit helper `app/lib/co-buy/audit.ts`.
**Buying Circles — Phase 5 BUILT** (post-purchase governance; spec `docs/buying-circles-phase-5-spec.md`):
- Migration **`supabase-co-buy-phase-5.sql`**: post-purchase columns on circles + 7 tables (`co_buy_expenses`,
  `_member_dues`, `_proposals`, `_votes`, `_exit_interests`, `_annual_reviews`, `_usage_zones`).
- Admin: post-purchase transition + exit queue on the circle page; `/admin/co-buy/circles/[id]/expenses`
  (entry + allocation: equal/by-share/specific → rolls up member dues), `/proposals` (create + close + decision),
  `/admin/co-buy/maintenance` (subscriptions + dormant-circle detection).
- Member: `/co-buy/circles/[id]/expenses` (ledger + my dues), `/proposals` + `[pid]` (advisory voting),
  `/exit` (register exit intent). Post-purchase links appear on the circle dashboard once `post_purchase_at` is set.
- Lib `app/lib/co-buy/post-purchase/` (pure allocation + voting tally, actions, constants). **Advisory only** —
  votes don't enforce, expenses move no money, exits record intent; legal authority is the co-ownership agreement.
- **All 5 phases now built.** Anything beyond (public vendor directory, resale marketplace) is a fresh product decision.

## What's next (high level — see `docs/project-tracker.md` for full backlog)

1. **v1.x — refine current**: composite Trust Score, compare properties, more
   discovery tiles, listing card polish, low-bandwidth optimization
2. **v2 — depth**: region landing pages, nearby amenities, agent dashboards,
   calculators (ROI, appreciation), multi-language (start with Hindi + Kannada)
3. **v3 — moat**: Land Health Score, Buyer Decision Dashboard, AI Copilot, internal
   CRM, **Founder Intelligence Layer** (strategic differentiator — uses `search_logs`)
4. **Blueprint-only**: PostGIS parcel boundaries, document OCR, dynamic GIS layers
   (soil/rainfall/groundwater) — heavy infrastructure, defer

**Strategic note for the user (worth repeating gently):** the highest-value next
move is real listings + real users on the live site, not more features. Features
without users teach you nothing.

## Conventions

- **Server vs client components**: server components for SEO-heavy / data-on-load
  pages (home, explore, listing detail, requirements, admin). Client components
  (`"use client"`) for anything interactive or that needs auth context.
- **Imports**: always `@/app/...` absolute paths.
- **Tailwind only** — no separate CSS modules. Design tokens in `globals.css`.
- **Forms**: inline `handleSubmit` with FormData, errors in local state. No form library.
- **Money**: prices stored as integer rupees. Display with `Number(price).toLocaleString("en-IN")`.
- **No new npm packages without checking with the user.** This project runs lean.

## Hard rules

1. **Never** put `SUPABASE_SERVICE_ROLE_KEY` in any file imported by a `"use client"`
   component, or in any browser-visible env var (no `NEXT_PUBLIC_` prefix).
2. **Never** disable RLS without replacing it with stricter app-level checks.
3. **Never** add Google Maps / Mapbox / any paid third-party API without asking —
   this project runs on free tiers.
4. **Never** reproduce copyrighted content (article text, song lyrics, etc.) in
   listings, eligibility content, or any output.
5. Legal/eligibility content is **not lawyer-reviewed**. Don't claim authority.
   Always say "consult a lawyer."
6. When in doubt about Windows vs Linux command syntax, ask the user or default to
   cross-platform Node scripts.

## Testing & CI

- **Smoke tests** (Playwright, request-based — no browser binaries): `tests/smoke/pages.spec.ts`
  GETs the key public routes and asserts `200` + a unique per-page string, plus the
  `/eligibility → /legal` permanent redirect. They need the app running with Supabase env
  vars (the Playwright `webServer` builds + starts it), so CI provides them via secrets.
- **Scripts:** `npm run test:typecheck` (tsc), `npm run test:lint` (eslint), `npm run test:smoke` (playwright).
- **CI:** `.github/workflows/checks.yml` runs typecheck + lint on every push/PR (no env needed);
  the `smoke` job needs repo secrets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` to go green.
- Note: `/agent` gates **client-side** (no HTTP redirect to signin); a browser-based test to
  assert its logged-out gate UI is a documented follow-up.

## Where to look for more

- `docs/land-portal-blueprint.md` — full product vision (long; reference only when asked)
- `docs/mvp-scope.md` — what counts as "done for MVP"
- `docs/project-architecture.md` — runtime + deployment architecture
- `docs/project-tracker.md` — phased backlog with priorities and full UX/UI requirements

## Working with the user

- Be specific and beginner-friendly. Show what you're about to do, then do it.
- Prefer small, reviewable diffs over big rewrites.
- After meaningful changes, run lint/typecheck if available, but don't auto-push —
  let the user say "commit and push."
- If something feels risky (deleting data, force-pushing, changing security
  policies), pause and confirm.
