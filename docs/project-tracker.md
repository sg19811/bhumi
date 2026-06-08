# Bhūmi — Project Tracker

> Phase tags: **[MVP]** building now · **[v1.x]** next enhancements · **[v2]** post-validation · **[v3]** advanced · **[BP]** full-blueprint, months out.
> Design north star: match the UX quality of Airbnb, Zillow, Google Maps, Uber, Booking.com — prioritizing trust, speed, simplicity, transparency, and data-rich decisions.

---

## Completed ✅

- [x] Next.js + Supabase + Vercel setup, deployed live
- [x] Home page (live listing/buyer counts)
- [x] Create listing form (auth-gated, with photo upload)
- [x] Listings grid + map-first explore page with filters
- [x] Listing detail page (map pin, photos, WhatsApp share, inquiry)
- [x] Buyer interest form ("I want to buy")
- [x] Buyer requirements listing page
- [x] Eligibility info page (Karnataka + Maharashtra)
- [x] Admin dashboard (stats, verify/delete actions)
- [x] Auth (sign up / sign in / sign out)
- [x] Owner edit/delete of own listings
- [x] Trust badge (verified / unverified)
- [x] Row-level security + service-role server reads
- [x] Sitemap + robots, SEO meta tags

---

## Current focus 🎯
- [x] Fix requirements page query (`supabase` → `db`)
- [ ] Verify admin + service-role key working on new machine
- [ ] Redeploy complete MVP to Vercel with service-role env var

---

## Farm Plot Projects ✅ LIVE on `main` (`supabase-farm-plots.sql` applied)

Built per `docs/farm-plots-spec.md`. MVP + PAN-India expansion are live; Phase 2 is in progress.

**Shipped & live:**
- [x] 5 project `land_type` values in `app/lib/land.ts`; in explore filter, create wizard, edit, `/buy`
- [x] Migration applied (17 `listings` columns + `farm_project_plots` + `search_logs.corridor`)
- [x] **PAN-India hierarchy**: `/farm-plots` → `/farm-plots/[city]` → `/farm-plots/[city]/[corridor]`;
  data-driven city registry (`cities.ts`, Bangalore live + 9 metros coming-soon); old flat URLs 307-redirect
- [x] **City menu** (`CitySelector`) on every page + `CityGrid` hub; **Farm Plots in main nav** (header+footer)
- [x] Create/edit **city picker** (corridors filter to chosen city); submit validates city↔corridor
- [x] Listing detail: overview, **transparency/disclosure readout**, plot table, amenities,
  **Total Cost calculator**, **developer profile** (other projects by developer), corridor badge
- [x] City pages **ProjectsBrowser** (filter corridor/stage, sort price)
- [x] SEO: per-city/corridor metadata, FAQ + Breadcrumb JSON-LD, sitemap; real copy (`copy.ts`)

**Phase 2 — in progress** (`feature/farm-plots-phase2`; DB-backed parts behind `supabase-farm-plots-phase2.sql`):
- [ ] Farm-plot **Risk Score** (compute-only)
- [ ] **WhatsApp brochure** for projects (compute-only)
- [ ] **Site-visit request** (new `site_visit_requests` table + form + admin view)
- [ ] **Tiered verification badge** (`listings.verification_tier` column + display + admin set)
- [ ] **Per-project document links** (`project_documents` table + edit upload + detail display)

**Founder follow-ups:** seed real projects per corridor before publicising; define the farm-plot
verification standard; TN lawyer to review Hosur copy + TN legal guidance before Hosur goes public.

---

## UX/UI Design Requirements (from design brief)

The goal: a portal materially better than MagicBricks, 99acres, Housing.com, LandWatch, Land.com, Farmflip, Zillow Land, Realtor.com Land. Each requirement is captured and phased.

### A. Zero-friction discovery — *find land in ≤3 clicks*
- [x] Search-first entry **[v1.x]** — home hero SearchBar
- [x] Map-first entry **[MVP]** (basic)
- [ ] Explore by region (village/taluka/district landing pages) **[v2]**
- [x] Explore by budget ("under ₹25 lakh") **[v1.x]** — home budget chips → `/explore?max_price=`
- [~] Explore by purpose **[v1.x partial]** — home "Browse by need" tiles (water / highway / orchards / verified / budget / largest). Richer semantic purposes ("coffee estate in Coorg", "resort-suitable") still **[v2]**
- [x] Curated entry tiles on home for the above **[v1.x]** — budget + purpose chips

### B. Google-Maps-style interface — *map-centric primary experience*
- [x] Interactive map with listing pins **[MVP]**
- [ ] Toggleable dynamic layers **[v3 / BP]**:
  - Village + survey boundaries **[v2]** (needs PostGIS + gov layers)
  - Roads, water bodies, rivers, lakes, forests **[v2]**
  - Elevation / topography **[v3]**
  - Soil, rainfall, groundwater, crop-suitability **[v3 / BP]** (external data)
- [x] Satellite + terrain basemaps **[v1.x]** — street / satellite / terrain toggle in `Map.tsx`
- [ ] Draw-to-search polygon **[v2]**

### C. Property visualization
- [x] Photos **[MVP]**
- [x] Videos **[v1.x]** — upload on create/edit (`listings.videos`), player on detail
- [ ] Drone videos **[v2]**
- [ ] 360 tours / panoramas **[v3]**
- [ ] Boundary overlay on satellite **[v2]** (needs parcel polygons)
- [ ] Terrain view **[v2]**
- [ ] Nearby amenities — schools, hospitals, markets, stations, airports **[v2]** (Places API)

### D. Land Health Score — *unique differentiator* **[v2 → v3]**
- [ ] 0–100 score: water, soil, road access, topography, legal status, nearby development, demand
- [ ] Clear visual gauge on listing + cards
- [ ] Explainable breakdown
- Maps to blueprint Section M

### E. Property Trust Score — *core feature* **[v1.x → v2]**
- [x] Basic verified/unverified badge **[MVP]**
- [~] Composite score **[v1.x done]** — `lib/trust.ts` from available signals (team-verified, photos, GPS, contact, description, registered owner). Document/ownership/encumbrance/agent/survey/identity verification still **[v2]**
- [x] Tiers: Excellent / Good / Moderate / Needs Verification — badge on cards + full breakdown on detail
- Maps to blueprint Section I

### F. Buyer Decision Dashboard **[v2]**
- [ ] Pros / risks / estimated appreciation / suitability per listing
- [ ] Suitability per purpose: farming, farmhouse, resort, eco-tourism, warehouse, solar, investment

### G. Mobile-first **[MVP → ongoing]**
- [x] Responsive layout + mobile menu **[MVP]** (basic)
- [x] Thumb-friendly polish, large tap targets **[v1.x]** — redesign: pill buttons, larger targets
- [ ] WhatsApp-style communication UI **[v2]**
- [x] Low-bandwidth optimization **[v1.x]** — next/image (WebP, responsive, lazy) on all listing photos
- [ ] Offline viewing of saved properties (PWA) **[v3]**

### H. Agent experience — *best-in-class* **[v2]**
- [ ] Lead + follow-up dashboards, commission tracking
- [ ] Upload wizard, verification status
- [ ] Performance + territory analytics, market trends
- [ ] AI listing descriptions + property videos **[v3]**
- Maps to blueprint Section K

### I. Internal sales CRM **[v2 → v3]**
- [ ] Lead funnel, conversion funnel, buyer-journey tracking
- [ ] Agent + territory analysis
- [ ] Hot-demand clusters, underpriced-land detection
- [ ] Follow-up scheduling, AI recommendations, performance dashboard
- Maps to blueprint Section L

### J. AI Copilot everywhere **[v3 / BP]**
- [ ] Buyer NL search · Seller listing assistant · Agent "who to call today" · Internal "rising-demand villages"
- All source-linked + labeled (blueprint Section P)

### K. WhatsApp-first **[v1.x → v2]**
- [x] WhatsApp share of listing **[MVP]**
- [ ] WhatsApp login, lead alerts, brochures **[v2]**
- [ ] WhatsApp chatbot **[v3]**

### L. Gamification **[v1.x → v3]**
- [~] Users: saved searches, watchlists, alerts, collections **[v1.x]** — watchlists, saved searches (now DB-backed), and collections done; **alerts** still need a scheduled job **[v2]**
- [ ] Agents: rankings, badges (Verified Expert, Top Performer, Fast Responder, Trusted Agent) **[v2]**

### M. Accessibility & languages **[v2 → v3]**
- [ ] Multi-language: English, Hindi, Kannada, Tamil, Telugu, Marathi, Malayalam (extensible)
- [ ] Voice search / navigation, elderly-friendly mode **[v3]**

### N. Viral / sharing **[v1.x → v2]**
- [x] Share property card (WhatsApp) **[MVP]**
- [x] Compare properties **[v1.x]** — select up to 4 (persisted), floating tray, `/compare` table with trust scores
- [ ] Share farm portfolio **[v2]**
- [ ] Calculators: investment, appreciation, ROI, farm-suitability, resort-feasibility **[v2]**
- [ ] AI Property Report PDF **[v3]**

---

## Founder Intelligence Layer 🔑 — *strategic, may outvalue the marketplace*

The acquisition/sales-machine engine. Consent-aware, audit-logged, firewalled (blueprint Sections L + M + ASSUMPTION 1). **[v3 / BP]** — but capture the raw data NOW so models have history to learn from.

- [ ] Villages where searches are rising rapidly
- [ ] Land types with rising demand
- [ ] Undervalued cluster detection
- [ ] Distressed-seller detection
- [ ] High-performing agent identification
- [ ] Future hotspot prediction
- [ ] Buyer intent scores · Seller urgency scores · Acquisition opportunity (DealScore)

> **Action now [MVP]:** log every search, listing, requirement, and inquiry with timestamp + location. Capturing data is cheap; reconstructing history is impossible.

---

## Known issues 🐛
- Node v20.13.1 on new machine; one dev package prefers ≥20.19 (harmless warning)
- `.env.local` + `node_modules` are per-machine (gitignored by design — recreate each machine)
- No listing input validation beyond HTML required fields
- Inquiries store no buyer identity (anonymous "interested")

## Tech debt 🔧
- Extract more shared components (cards, badges)
- Loading skeletons + error boundaries
- Validate env vars on startup
- Replace browser confirm() with proper modals

---

*Last updated: June 7, 2026. Full vision: land-portal-blueprint.md · build scope: mvp-scope.md · architecture: project-architecture.md.*
