@AGENTS.md

# AcreHub — Project Context for Claude Code

> Read this before making changes: the project's why, how, and what's-next.
> The line above imports `AGENTS.md` (the hard framework rule). Longer specs live in `docs/`.
>
> **Brand:** the product is **AcreHub** (renamed from "Bhūmi"). The GitHub repo
> (`sg19811/bhumi`), local path (`C:\bhumi`), and deploy URL (`bhumi.vercel.app`)
> keep the old `bhumi` name — that's infra, not brand. User-facing copy says AcreHub.

## Framework note (critical)

Next.js 16 in this repo has breaking changes vs. training data (see the imported
`AGENTS.md`). **Read the relevant guide in `node_modules/next/dist/docs/` before
writing any Next.js code**, and heed deprecation notices.

## What this is

AcreHub is a parcel-first agricultural land marketplace, India-first, built around
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

## Environment variables (three, exactly)

| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | `sb_publishable_…` — safe in browser |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel | `sb_secret_…` — **SERVER ONLY**, bypasses RLS |

Hard rule: **never** import `lib/supabase-server.ts` (the service-role client) into
any `"use client"` file. Never prefix the service-role key with `NEXT_PUBLIC_`.
Never expose it in error messages or logs.

## Repo layout

```
app/
  page.tsx                      home (search-first, discovery tiles, demand nudge, live counts)
  layout.tsx                    root layout, providers, SEO meta, Org/WebSite JSON-LD, theme-color
  globals.css                   design tokens (earthy palette via Tailwind v4 @theme)
  manifest.ts, icon.tsx, apple-icon.tsx, opengraph-image.tsx   PWA + favicons + default OG
  sitemap.ts, robots.ts         SEO (sitemap enumerates listings + region/land + legal pages)
  about, how-it-works, faq, privacy, terms                      static content pages
  auth/{signin,signup}/page.tsx Supabase Auth
  buy/page.tsx (+ layout.tsx)   buyer requirement form (metadata via layout)
  sell/page.tsx                 seller value-prop landing
  explore/page.tsx              map + filtered listings, text search, empty-state demand capture
  listings/page.tsx             simple grid
  listing/new/page.tsx          create wizard (auth-gated, photos/videos, map picker, → pending)
  listing/[id]/page.tsx         detail (map, gallery, trust, suitability, price-insight, verify, inquiry)
  listing/[id]/edit/page.tsx    owner edit
  listing/[id]/opengraph-image.tsx   dynamic per-listing social share image
  region/[district]/page.tsx, region/[district]/[type]/page.tsx, land/[type]/page.tsx
                                programmatic SEO landing pages (market stats, price insight, ISR)
  requirements/page.tsx         public requirements (server, supabaseAdmin)
  my-listings, my-requirements, saved, collections/, compare    signed-in user surfaces
  agent/page.tsx                agent dashboard (leads pipeline, commission, market insights)
  admin/page.tsx                dashboard (approval queue, reports, verification, search insights, legal leads)
  admin/import/page.tsx         CSV import; admin/intelligence/page.tsx  Founder Intelligence
  seller/[id]/page.tsx          public seller profile (noindex)
  tools/                        EMI calculator + area converter
  legal/                        Land Legal Navigator (see "What's built")
    page.tsx (hub), wizard/, result/[id], state/[state], compare, nri, company,
    checklist, due-diligence, lawyers, services, articles/ + [slug], talk-to-lawyer
  api/
    alerts/route.ts             daily saved-search email cron (Resend)
    intelligence-digest/route.ts  weekly founder digest cron (Resend)
    wanted-areas/route.ts       server-computed public demand nudge (service-role)
    legal/eligibility/route.ts  eligibility engine endpoint
  components/                   ~47 shared components (Header, Map/MapLoader, ListingCard,
                                TrustScore, PriceInsight, MarketStats, SuitabilityPanel,
                                VerificationPanel, StickyContactBar, WantedAreas, CompareTray, …)
  components/legal/             ~23 legal-module components (Wizard steps, VerdictBadge,
                                RiskMeter, LeadCaptureForm, StateGuideContent, …)
  lib/
    supabase.ts                 BROWSER client (anon key) — "use client" + public reads
    supabase-server.ts          SERVER client (service-role) — admin/requirements/api routes only
    auth.tsx                    AuthProvider + useAuth (role-aware)
    compare.tsx, saved-searches.tsx, i18n*.ts(x), format.ts, trust.ts, price-insight.ts,
    suitability.ts, land.ts, search.ts, csv.ts, guest-saves.ts
    legal/                      engine, riskScore, options, copy, analytics, stateRules,
                                dueDiligence, districts, landMap, types
```

## Data model (Supabase)

Core tables:
- `profiles` — `user_id` → `auth.users`, `role` ('user' | 'agent' | 'admin'), name, phone
- `listings` — title, description, land_type, price, price_basis, area_value/area_unit,
  lat/lon, district/taluka/village, water_source, road_access, electricity, fencing,
  photos (text[]), videos (text[]), contact_phone/whatsapp/email, previous_price,
  price_changed_at, views, status ('active'|'pending'|'sold'|'withdrawn'),
  is_verified, **owner_user_id** (→ auth.users), created_at, updated_at.
  *New listings are created as `pending` and stay hidden until an admin approves them.*
- `buyer_interests` — buyer requirements (anonymous-friendly), intent, budget_min/max,
  acreage_min/max, preferred_district/taluka, land_types, notes, contact_phone/whatsapp, status, owner_user_id
- `inquiries` — `listing_id`, message, contact_phone, lead_status, created_at
- `search_logs` — query, land_type, max_price, max_area, district, created_at *(intelligence raw data)*
- `saved_listings` — user_id, listing_id · `saved_searches` — user_id, label, query, last_notified_at
- `collections` + `collection_listings` — user watchlists/folders
- `deals` — agent_user_id, listing_id, sale_price, commission_amount *(agent commission)*
- `verification_requests` — listing_id, documents (private bucket), status *(verification workflow)*
- `reports` — listing_id, reason, resolved *(moderation)* · `demand_signals` — district, land_type, contact *(notify-me)*
- **Legal Navigator tables**: `legal_state_rules`, `legal_articles`, `lawyers`, `legal_services`,
  `legal_inquiries` (leads, admin-read only), `legal_eligibility_results`, `legal_dd_progress`

RLS is on across the app. Policies use `auth.uid() = owner_user_id` for owner ops and an
`is_admin()` SECURITY DEFINER function (checks `profiles.role = 'admin'`) for admin overrides;
owners can also read/update their own listings (a trigger blocks self-publishing pending→active).
To make a user admin/agent: set their `profiles.role` in the Supabase dashboard.
Storage buckets: **`Listings`** (public, photos + videos — note the capital L) and
**`verification`** (private, listing documents; admin reads via signed URLs).

> **SQL is in repo, not auto-applied.** Schema/policies live in `supabase-setup.sql` plus
> focused files (`supabase-fix-*`, `supabase-ensure-funnel-policies.sql`, `supabase-legal-*.sql`).
> They must be pasted into the Supabase SQL Editor to take effect — run order and purpose are
> in each file's header. Legal content seeds are **drafts** until published with a reviewer.

## What's built (don't redo)

MVP + Stage 2 + Stage 3 are live in production.

**MVP / Stage 2 (foundation):**
- Auth-gated listing creation (wizard) with photo + video upload and a map-pin location picker
- Map-first explore (text search, satellite/street/terrain toggle, filters), listings grid
- Listing detail: gallery, map, save, WhatsApp/native share, inquiry, owner edit
- Buyer requirements (post + browse), admin dashboard, search logging
- Saved listings, **saved searches (DB) + daily email alerts cron**, **collections**, **compare (up to 4)**
- Composite **Trust Score** (`lib/trust.ts`), **Suitability panel**, sitemap/robots/SEO
- Earthy redesign — shared Logo + ListingCard, Tailwind v4 @theme tokens, i18n (en/hi/kn, partial)

**Stage 3 (this is the big delta vs. the old tracker):**
- **Land Legal Navigator** (`/legal`) — eligibility wizard + rule engine (KA/MH/TN/AP/KL),
  risk meter, shareable results, state guides, state comparison, NRI & company hubs,
  document checklist, 10-step due diligence (per-listing scope), mock lawyer directory,
  service packages, articles/FAQ system, lead capture (`legal_inquiries`) → admin triage.
  *Content is published-gated: state rules/articles are seeded as drafts until a reviewer signs off.*
- **Founder Intelligence Layer (v1)** — `/admin/intelligence`: weighted demand vs. supply by
  district & land type (30/90-day window), unmet-demand list, ₹/acre price benchmarks; a public
  **"buyers are looking here" nudge** (`/api/wanted-areas`) steering sellers to demand; a **weekly
  email digest** cron.
- **Programmatic SEO landing pages** — `/region/[district]`, `/region/[district]/[type]`,
  `/land/[type]` with market stats + price insight (ISR).
- **Price intelligence** — `lib/price-insight.ts`, PriceInsight panel on listings, MarketStats on landing pages.
- **Agent dashboard** (`/agent`) — leads pipeline + conversion, commission tracking (`deals`),
  territory + market analytics.
- **Verification workflow** (owner doc upload → admin approve), **reports/moderation**,
  **demand signals** (notify-me), **listing moderation** (pending → admin approval queue).
- **CSV import/export** (admin), **PWA** (manifest/icons/theme-color), **per-listing OG images**,
  site-wide Organization/WebSite structured data, **/sell** seller landing, mobile sticky contact bar.
- `/eligibility` now 301-redirects to `/legal`; nav renamed "Legal".

## What's next (high level — see `docs/project-tracker.md` for full backlog)

Most of the old v1.x/v2 backlog is now built (see `docs/project-tracker.md` for the full
checked-off list). What genuinely remains, by dependency:

1. **Bounded, no external dependency (good next code work):** server-side listing validation;
   replace `confirm()` with proper modals; validate env vars on startup; ROI/appreciation/
   farm-suitability calculators (EMI + area converter already exist); finish i18n string
   coverage across newer pages (Hindi/Kannada need native review); agent badges/rankings
   computed from existing listing/lead data; route-level error boundaries.
2. **Needs real users / data volume:** undervalued-cluster & DealScore detection, distressed-
   seller/urgency scores, hotspot prediction, high-performing-agent ID (the predictive half of
   the Founder Intelligence Layer — the descriptive half is built).
3. **Needs lawyer-reviewed content:** publishing the legal state rules + articles (drafts are
   seeded; flip `published=true` with `reviewed_by`); disclaimer wording sign-off.
4. **Needs paid/external APIs or heavy infra (deferred):** nearby amenities (Places), AI Copilot
   (LLM keys), Land Health Score & dynamic GIS layers (soil/rainfall/groundwater), PostGIS
   parcel boundaries + draw-to-search, document OCR, full PWA offline.

**Strategic note (worth repeating gently):** the codebase is now feature-rich; the highest-value
next move is **real listings + real users + running the SQL**, not more features. The intelligence,
digest, nudges, agent funnel, and legal results all stay empty until there's live data and the
schema/policy SQL files have been applied. Features without users teach you nothing.

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
5. Legal content (the Land Legal Navigator) must **never be published without a recorded
   reviewer**. State rules + articles are seeded as drafts (`published=false`); only flip to
   `published=true` with `reviewed_by`/`reviewed_at` set. Every result/article/state page carries
   a visible "not legal advice — consult a lawyer" disclaimer. Don't claim authority.
6. When in doubt about Windows vs Linux command syntax, ask the user or default to
   cross-platform Node scripts.

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
