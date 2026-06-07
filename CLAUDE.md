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
