# Bhūmi MVP — Project Architecture

## Overview

The MVP runs on **three free services** and **one repository**. No servers to manage, no infrastructure to configure.

| Service | Role | Cost |
|---|---|---|
| **Vercel** | Hosts the Next.js app (pages + API routes) | Free tier |
| **Supabase** | PostgreSQL database + auth + file storage | Free tier |
| **OpenStreetMap** | Map tiles via Leaflet (client-side) | Free, no API key |
| **GitHub** | Code repository (1 repo: `land-portal`) | Free |

---

## Architecture diagram

How the pieces connect at runtime:

```
                ┌─────────────────────┐
                │   User's browser    │
                │ React + Leaflet map │
                └────────┬──────┬─────┘
                         │      │
              Pages +    │      │  Map tiles
              API calls  │      │  (client-side)
                         │      │
                         ▼      ▼
              ┌──────────────┐  ┌─────────────────┐
              │    Vercel    │  │  OpenStreetMap   │
              │  Next.js app │  │  Free map tiles  │
              └──────┬───────┘  └─────────────────┘
                     │
           Data, auth, files
                     │
                     ▼
              ┌──────────────┐
              │   Supabase   │
              │ Postgres DB  │
              │ + Auth       │
              │ + Storage    │
              └──────────────┘
```

### Data flow

1. **User opens the site** → Vercel serves the Next.js pages (server-rendered HTML for SEO)
2. **Map loads** → Leaflet in the browser fetches tiles directly from OpenStreetMap (no server involved)
3. **User creates a listing / submits a form** → browser calls Next.js API route on Vercel → API route reads/writes Supabase
4. **User signs in** → Supabase Auth handles it directly (email/password or Google OAuth)
5. **User uploads photos** → stored in Supabase Storage, URLs saved in the database

---

## Deployment flow

How code goes from your computer to a live website:

```
┌──────────┐     git push     ┌──────────┐    auto-deploy    ┌──────────┐     serves     ┌──────────┐
│ VS Code  │ ───────────────► │  GitHub  │ ────────────────► │  Vercel  │ ─────────────► │ Live site│
│Write code│                  │ 1 repo   │                   │Auto-build│                │Users visit│
└──────────┘                  └──────────┘                   └──────────┘                └──────────┘
```

### How deployment works

1. You write code in **VS Code** on your machine
2. You run `git push` to send your changes to **GitHub**
3. **Vercel** detects the push automatically and rebuilds your site (~30–60 seconds)
4. The new version goes live at your Vercel URL (e.g., `land-portal.vercel.app`)
5. If the build fails, Vercel keeps the previous working version live and tells you what broke

**You never touch a server.** No SSH, no terminal on a remote machine, no Docker, no DevOps.

---

## Tech stack

| Layer | Choice | Why this, not something else |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SEO requires server-rendering; API routes eliminate a separate backend; same framework as the full blueprint — zero migration cost later |
| **Language** | TypeScript | Comes with Next.js defaults; catches errors before they reach users; industry standard |
| **Database** | Supabase (hosted PostgreSQL) | Free, beginner-friendly dashboard, built-in auth + storage, supports PostGIS when we need map polygons later |
| **Auth** | Supabase Auth | Included with Supabase; email/password + Google; no extra setup |
| **File storage** | Supabase Storage | Included; handles photo uploads with signed URLs |
| **Maps** | Leaflet + OpenStreetMap | Free, no API key, simple API, good enough for map pins; upgradable to MapLibre + own tiles later |
| **Styling** | Tailwind CSS | Comes with Next.js defaults; utility classes; fast for beginners |
| **Hosting** | Vercel | Free, auto-deploys from GitHub, zero config for Next.js, CDN included |

### Why Next.js and not plain React?

Next.js IS React — it's React with server-rendering, routing, and API routes added. The decisive reasons:

1. **SEO is existential.** Google needs to index the eligibility pages, listing pages, and market pages. Plain React renders blank HTML that Google can't read. Next.js serves complete, indexable pages.
2. **One codebase.** API routes live alongside pages — no separate backend to build and deploy.
3. **Faster loads.** Server-rendered pages arrive complete, critical for low-bandwidth rural users.
4. **No migration.** The full blueprint uses Next.js; starting here means zero rewrite later.

---

## Repository structure (MVP)

One repo: `land-portal`

```
land-portal/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (shared header/footer)
│   ├── page.tsx            # Home page
│   ├── explore/
│   │   └── page.tsx        # Map search page
│   ├── listing/
│   │   ├── [id]/
│   │   │   └── page.tsx    # Individual listing page
│   │   └── new/
│   │       └── page.tsx    # Create listing form
│   ├── buy/
│   │   └── page.tsx        # "I want to buy" form
│   ├── eligibility/
│   │   └── page.tsx        # Eligibility info page
│   └── api/                # Server-side API routes
│       ├── listings/
│       │   └── route.ts    # CRUD for listings
│       └── buyer-interests/
│           └── route.ts    # CRUD for buyer interests
├── components/             # Reusable React components
│   ├── Map.tsx             # Leaflet map component
│   ├── ListingCard.tsx     # Listing preview card
│   ├── TrustBadge.tsx      # Verified / Unverified badge
│   └── Header.tsx          # Site header + navigation
├── lib/                    # Shared utilities
│   ├── supabase.ts         # Supabase client setup
│   └── types.ts            # TypeScript type definitions
├── public/                 # Static assets (logo, icons)
├── .env.local              # Environment variables (DB URL, keys) — never committed
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.ts          # Next.js configuration
```

---

## Database (4 tables)

```sql
profiles          — user accounts (linked to Supabase Auth)
listings          — land listings with location, price, photos, verified flag
buyer_interests   — structured buyer requirements (intent, area, budget)
inquiries         — logs of buyer interest in specific listings
```

Full schema is in the MVP Scope document (`mvp-scope.md`, Section 2.3).

---

## Accounts needed

| Account | URL | Sign-up method |
|---|---|---|
| GitHub | github.com | Email |
| Vercel | vercel.com | Sign in with GitHub |
| Supabase | supabase.com | Sign in with GitHub |

Create GitHub first, then use it to sign into the other two.

---

## Environment variables

These connect your Next.js app to Supabase. Stored in `.env.local` (never committed to GitHub):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You'll get these values from the Supabase dashboard when you create your project.

---

## Growth path

When the MVP is validated, the architecture grows into the full blueprint:

```
MVP                          →  Full blueprint
─────────────────────────────────────────────────
Supabase Postgres            →  PostgreSQL + PostGIS (boundaries)
Leaflet + OSM                →  MapLibre + own vector tiles
Supabase Auth                →  + KYC step-up
Supabase Storage             →  S3/R2 + document pipeline
Next.js API routes           →  + NestJS services (when needed)
Manual verification          →  Verification engine + field app
Static eligibility page      →  Legal rules engine + AI assistant
No search engine             →  OpenSearch (full-text + facets)
No analytics pipeline        →  ClickHouse event warehouse
Free tier everything         →  Scaled infrastructure
```

Each upgrade is additive — nothing gets thrown away.

---

*This document is the architectural reference for the MVP phase. The full vision is in `land-portal-blueprint.md`. The build scope is in `mvp-scope.md`.*
