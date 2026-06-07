# Bhūmi — MVP Scope Definition
### Derived from the full blueprint · Sized for: solo first-time builder + expert advisor

---

## 1. What the MVP proves (the one hypothesis)

> **In one specific region, buyers and sellers of agricultural/rural land will prefer a map-based listing site with visible trust labels and eligibility guidance over WhatsApp groups and generic property portals.**

Everything in the MVP exists to test this. If a feature doesn't directly serve this test, it's deferred.

---

## 2. What's IN the MVP

### 2.1 Pages & screens (7 total)

| # | Page | What it does | Blueprint ref |
|---|---|---|---|
| 1 | **Home** | Search box, hero pitch ("trusted land listings in [Region]"), a few featured listings, "I want to buy" CTA | Section N |
| 2 | **Explore / Map search** | Map (pins for v1, polygons later) + listing cards side panel, filterable by land type, price band, area band | Sections C, N |
| 3 | **Listing detail** | Photos, map pin, key facts (area, price, land type, water, road, electricity), trust badge ("Verified by us" or "Unverified"), eligibility note, contact CTA | Sections D, N |
| 4 | **Create listing** | Simple form: photos, location (drop pin on map), area, price, land type, key facts, contact. No parcel-identity or boundary-drawing yet. | Section C |
| 5 | **"I want to buy" form** | Intent, preferred area (pick on map or select district/taluka), budget range, land type, acreage, contact. Creates a buyer interest record. | Sections C, J |
| 6 | **Eligibility info page** | Static, lawyer-reviewed content for your launch region: "Who can buy agricultural land in [State]?" with the 7-block answer format (what it means, why it matters, what to verify, docs needed, next steps, exceptions, sources). | Section F |
| 7 | **About / Trust page** | How verification works, why this is different, team credibility. Builds trust for a new, unknown site. | Section N |

### 2.2 Features (only these, nothing more)

| Feature | Scope | What's explicitly simplified |
|---|---|---|
| **Listing creation** | Simple web form, photo upload, drop-a-pin location | No parcel identity system, no boundary drawing, no document upload, no verification workflow, no AI assist |
| **Map search** | Interactive map with pins + card list, filter by land type / price / area | No polygon boundaries, no draw-to-search, no tile server — just a map library with markers |
| **Trust badge** | Two states: "Verified by us" (you manually verify) and "Unverified" (default) | No tiered verification ladder, no verification cases/tasks/SLA engine |
| **Contact flow** | "Interested" button → shows seller's WhatsApp/phone (with their consent) | No masked contact, no in-app messaging, no lead routing |
| **Buyer interest capture** | Structured form → stored in database → you review manually | No reverse matching engine, no automated alerts, no demand heatmaps |
| **Eligibility content** | One static page per launch state, lawyer-reviewed, evergreen | No AI legal assistant, no per-parcel personalized verdicts, no rules engine |
| **Auth** | Simple sign-up/sign-in (email + password or Google) for listing creation and buyer interest | No KYC, no role-based access, no agent accounts |
| **Admin** | You directly in the database (Supabase dashboard) to moderate/verify listings | No admin panel, no moderation queue, no fraud detection |

### 2.3 Data model (4 tables)

```sql
-- The entire MVP database

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),   -- Supabase auth link
  full_name text,
  phone text,
  role text DEFAULT 'user',                  -- 'user' | 'admin' (just you)
  created_at timestamptz DEFAULT now()
);

CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  land_type text NOT NULL,          -- 'agri_land','farmhouse_land','orchard','na_converted','plantation','dryland','other'
  price numeric NOT NULL,           -- total asking price in INR
  price_basis text DEFAULT 'total', -- 'total' | 'per_acre'
  area_value numeric NOT NULL,
  area_unit text DEFAULT 'acre',    -- 'acre','guntha','hectare','sqft'
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  district text,
  taluka text,
  village text,
  water_source text,                -- 'borewell','canal','river','rainfed','none'
  road_access text,                 -- 'highway','paved','dirt','none'
  electricity boolean DEFAULT false,
  fencing boolean DEFAULT false,
  contact_phone text,
  contact_whatsapp text,
  photos text[] DEFAULT '{}',       -- array of storage URLs
  is_verified boolean DEFAULT false, -- YOU flip this manually after checking
  status text DEFAULT 'active',      -- 'active','sold','withdrawn'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE buyer_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles(id),
  intent text,                      -- 'farming','farmhouse','investment','development'
  preferred_district text,
  preferred_taluka text,
  land_types text[] DEFAULT '{}',
  budget_min numeric,
  budget_max numeric,
  acreage_min numeric,
  acreage_max numeric,
  irrigation_pref text,
  contact_phone text,
  contact_whatsapp text,
  notes text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id),
  buyer_id uuid REFERENCES profiles(id),
  message text,
  created_at timestamptz DEFAULT now()
);
```

That's it. Four tables. No parcels-vs-listings separation, no signals, no scores, no verification cases, no documents table. All of that comes later when the foundation works.

---

## 3. What's explicitly OUT (deferred to post-MVP)

Saying "no" clearly is the most important part of an MVP scope. None of these are built, designed, or even thought about further until the MVP is live and has real users.

| Category | Deferred items |
|---|---|
| **Parcel system** | Canonical parcel entity, parcel identifiers (ULPIN/survey no), versioned geometry, parcel-vs-listing separation |
| **Boundary/geo** | Polygon drawing/upload, area reconciliation, overlap detection, vector tiles, tile server, geofenced alerts |
| **Verification engine** | Tiered verification ladder, verification cases/tasks, SLA engine, field verifier app, reviewer tooling |
| **Document system** | Document upload, OCR, structured extraction, evidence chain, due-diligence room, DD pack PDF |
| **Legal engine** | Jurisdiction packs, JSON-logic rules engine, per-parcel eligibility verdicts, legal rules database |
| **AI assistants** | All 10 of them — legal, buyer, seller, listing, document, parcel, agent, sales, acquisition, support |
| **Agent/broker system** | Agent onboarding, KYC, CRM, lead inbox, pipeline, reputation, co-brokerage, commission tracking |
| **Demand matching** | Reverse matching engine, automated alerts, demand heatmaps, scarcity reports |
| **Internal tools** | Sales CRM, acquisition dashboard, scoring engines, deal rooms, opportunity board, leaderboards |
| **Market intelligence** | Price/acre normalization, DealScore, undervaluation scoring, market comps, trend dashboards |
| **SEO engine** | Programmatic pages, village/taluka/district pages, content hubs, schema markup (beyond basics) |
| **Integrations** | WhatsApp Business API, KYC provider, OCR provider, gov land records, payment/escrow |
| **Advanced infra** | OpenSearch, pgvector, ClickHouse, Cerbos, BullMQ workers, event pipeline, RBAC/ABAC |
| **Multi-region** | Multiple states, jurisdiction packs, multilingual, international |

---

## 4. Tech stack (beginner-appropriate subset of the blueprint)

| Layer | MVP choice | Why | Blueprint target (later) |
|---|---|---|---|
| **Framework** | Next.js (App Router) | Same as blueprint; you learn the real thing from day 1 | Same |
| **Database** | Supabase (hosted Postgres) | Free tier, built-in auth + storage + dashboard, beginner-friendly, PostGIS available when needed | PostgreSQL + PostGIS |
| **Auth** | Supabase Auth | Comes free with Supabase; email/password + Google; zero extra setup | Same base, plus KYC step-up |
| **File storage** | Supabase Storage | Photo uploads; comes with Supabase | S3/R2 |
| **Maps** | Leaflet + OpenStreetMap tiles | Free, no API key needed, simple to learn, good enough for pins | MapLibre + own vector tiles |
| **Styling** | Tailwind CSS | Comes with Next.js defaults; utility-first; fast for beginners | Same + design token system |
| **Deployment** | Vercel | Free tier, auto-deploys from GitHub, zero config for Next.js | Same + CDN |
| **Admin** | Supabase dashboard (direct DB) | You moderate listings by flipping `is_verified` in the table view | Custom admin panel |

No additional services. No Redis, no OpenSearch, no ClickHouse, no queue workers. The entire MVP runs on two free services (Vercel + Supabase) and a free map library.

---

## 5. Build sequence (what you code, in what order)

Each step is a working increment — the site gets better with each one, and it's usable after step 3.

| Step | What you build | Milestone |
|---|---|---|
| **1** | Next.js project + Supabase project + connect them + deploy blank site | "My site is on the internet" |
| **2** | Database tables (the 4 above) + Supabase Auth (sign up / sign in) | "People can create accounts" |
| **3** | Create Listing form + display listings on a list page | "Real listings appear on my site" |
| **4** | Listing detail page with a map (single pin on Leaflet) | "Each listing has its own page with a map" |
| **5** | Explore page: map with all listing pins + card list + basic filters | "Buyers can search by map" |
| **6** | "I want to buy" form → buyer_interests table | "Demand capture works" |
| **7** | Inquiries: "I'm interested" button on listing → logs inquiry + shows contact | "Buyers and sellers can connect" |
| **8** | Trust badge: show "Verified ✓" on verified listings; you verify via Supabase dashboard | "Trust is visible" |
| **9** | Eligibility info page (static content, lawyer-reviewed) | "The site has unique, valuable legal content" |
| **10** | Home page: hero + search + featured verified listings + CTAs | "The site looks credible and complete" |
| **11** | Polish: mobile responsiveness, empty states, loading states, basic SEO meta tags | "Ready for real users" |

**Estimated timeline (realistic for a never-coded-before builder):** Steps 1–3 in the first 2 weeks with regular effort. Steps 4–8 in weeks 3–4. Steps 9–11 in week 5–6. Total: **~6 weeks to a shippable MVP**, assuming a few hours most days and your friend available for the sticky moments.

---

## 6. Cold-start plan (how to get the first listings)

Code alone is worthless without supply. Since you have a region and contacts, this runs in parallel with building:

- **Weeks 1–2** (while building steps 1–3): visit or call 10–15 sellers/agents in your region. Collect their listing info manually (photos, location, area, price, facts). You'll enter these yourself.
- **Week 3** (when the listing form works): invite 3–5 trusted agents/sellers to create their own listings. Watch them struggle — what confuses them is what you fix next.
- **Weeks 4–6**: aim for **30–50 real, verified listings** in your region. That's enough density for a buyer to find the site useful.
- **Simultaneously**: share the eligibility page and a few compelling listings on relevant WhatsApp groups. The eligibility content is the hook — it answers a question nobody else answers well.

---

## 7. Success criteria (how you know MVP works)

Set these BEFORE you launch so you have a clear bar, not a moving goalpost:

| Signal | Target | Timeframe |
|---|---|---|
| Real listings (not test data) | ≥ 30 | By launch + 4 weeks |
| Of which verified by you | ≥ 15 | By launch + 4 weeks |
| Buyer interest submissions | ≥ 10 | First 4 weeks post-launch |
| Listing inquiries | ≥ 15 | First 4 weeks post-launch |
| Repeat visitors | Any measurable | First 4 weeks |
| Seller/agent says "this is better than WhatsApp" | ≥ 3 people | Anytime |

**If you hit these:** the idea has legs → move to Phase 2 (add polygon boundaries, real verification tiers, automated buyer-listing matching).

**If you badly miss:** you learned cheaply. Adjust the region, the value prop, or the approach — not the code.

---

## 8. The one non-negotiable before launch

The eligibility content for your launch state **must be reviewed by a local lawyer**. Even one page. If you publish wrong eligibility info, you damage the exact trust that the whole product is built on. Everything else can be rough; this can't.

---

## 9. What comes after MVP (the growth path back to the blueprint)

Once the MVP is validated, you layer features back in from the blueprint in this order:

| Phase | Add | Blueprint sections |
|---|---|---|
| **v1.1** | Draw/upload parcel boundaries, area display on map, boundary vs stated area comparison | E.2, H.2, N.4 |
| **v1.2** | Photo verification, richer trust tiers (phone-verified, document-uploaded), basic moderation panel | I.1, I.3 |
| **v1.3** | Buyer-listing matching (automated alerts when a new listing fits a buyer's interest) | J.3, E.8 |
| **v2** | Agent accounts, lead inbox, basic CRM | K.1–K.3 |
| **v2.1** | Document upload + basic extraction, due-diligence checklist | G.1–G.3 |
| **v3** | Legal rules engine, per-parcel eligibility, AI legal assistant | F.1–F.7, P.4 |
| **v3+** | Internal sales tools, scoring, market intelligence, SEO engine, multi-region | L, M, O, S |

Each phase is a separate conversation. Don't think about them until you've earned them with real users.

---

## 10. Key risks to watch

| Risk | Mitigation |
|---|---|
| **No listings** (cold start) | Your contacts are the answer; source manually first; don't wait for organic supply |
| **Wrong eligibility info** | Lawyer review before publish; date it; add "confirm with local authority" disclaimer |
| **Nobody visits** | Share eligibility page on WhatsApp/social; it's the viral hook |
| **Seller phone numbers exposed to spam** | Only show contact after sign-in + inquiry logged; add a simple abuse report |
| **You get stuck on code** | Paste the error to me or your friend; don't spend more than 30 min stuck alone |
| **Scope creep** | This document is the contract; if a feature isn't listed in section 2, it doesn't exist yet |

---

*This MVP scope is the build contract. The full blueprint (land-portal-blueprint.md) is the north star for where this goes after validation. Don't confuse the two — build this, not that, until real users tell you what's next.*
