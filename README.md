# Bhūmi — trusted agricultural land marketplace

India-first marketplace for buying and selling agricultural land, built around
**trust, legal clarity, and real maps**. Verified listings, trust scores, satellite
boundaries, and a two-sided buyer/seller loop.

## Stack

- **Next.js 16** (App Router) + TypeScript + **Tailwind CSS v4**
- **Supabase** — Postgres, Auth, Storage (with Row-Level Security)
- **Leaflet / react-leaflet** — OpenStreetMap, Esri satellite, OpenTopoMap terrain
- **Vercel** — hosting + auto-deploy from `main`, plus a daily Cron for alerts
- Email via **Resend** (REST, no SDK dependency)

> Note: this repo targets Next.js 16 — see `AGENTS.md`. Read the bundled docs in
> `node_modules/next/dist/docs/` before changing framework-level code.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

Create `.env.local` (these are per-machine, gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...      # safe in the browser
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...               # SERVER ONLY — never NEXT_PUBLIC_

# Search alerts (optional until you enable them)
RESEND_API_KEY=re_...
CRON_SECRET=<any-long-random-string>
ALERT_FROM_EMAIL=Bhūmi <onboarding@resend.dev>
```

## Database setup (Supabase)

1. Open your project → **SQL Editor** → run **[`supabase-setup.sql`](./supabase-setup.sql)**.
   It is idempotent (safe to re-run) and creates: the `is_admin()` helper, a
   profile-on-signup trigger, listings columns/policies, storage upload policies,
   admin/owner read policies, and the `saved_searches` / `collections` tables.
2. **Storage:** ensure a **Public** bucket named exactly **`Listings`** exists
   (photos and videos upload here).
3. **Make yourself admin:** Table Editor → `profiles` → set your row's `role` to
   `admin` (or run the snippet at the bottom of `supabase-setup.sql`). Sign out/in.

## Search alerts (optional)

Buyers get a daily email when new listings match a saved search.

1. Create a free **Resend** account → API key.
2. Set `RESEND_API_KEY`, `CRON_SECRET`, `ALERT_FROM_EMAIL` in Vercel (and `.env.local`).
3. `vercel.json` already schedules `GET /api/alerts` daily at 07:00 UTC.
4. Test: `https://<your-site>/api/alerts?key=<CRON_SECRET>` → `{ ok, checked, emailed }`.

> Resend's test domain (`onboarding@resend.dev`) only delivers to your own Resend
> account email. Verify a domain in Resend to email real buyers.

## Deploy

Push to `main` → Vercel builds and deploys. Set the same env vars in the Vercel
project settings (Production).

## Project layout

```
app/
  page.tsx                home (search, discovery, regions, latest)
  explore/                map + filters + saved searches (split view)
  listing/new, [id], [id]/edit   create / detail / edit
  region/[district]/[type]       SEO landing pages
  land/[type]                    SEO landing pages
  buy, requirements              buyer side (post + browse + contact)
  my-listings, saved, collections, compare   user areas
  admin/                  moderation, search insights, demand matching, CSV export
  api/alerts/route.ts     daily search-alert emailer (Vercel Cron)
  components/  lib/        shared UI + supabase/auth/format/trust helpers
supabase-setup.sql        one-shot database setup
```

## Conventions

- Browser reads use `lib/supabase.ts` (anon key); protected server reads use
  `lib/supabase-server.ts` (service role) — **never import the latter in a
  `"use client"` file**.
- Tailwind only; design tokens live in `app/globals.css`.
- Prices are integer rupees; display via `lib/format.ts`.
- New listings are created as `pending` and go live only after admin approval.

Legal/eligibility content is informational, not legal advice.
