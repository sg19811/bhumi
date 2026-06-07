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
- [x] Eligibility info page (Karnataka + Maharashtra) — *superseded by the Land Legal Navigator (`/legal`); `/eligibility` now 301-redirects there (see Stage 3)*
- [x] Admin dashboard (stats, verify/delete actions)
- [x] Auth (sign up / sign in / sign out)
- [x] Owner edit/delete of own listings
- [x] Trust badge (verified / unverified)
- [x] Row-level security + service-role server reads
- [x] Sitemap + robots, SEO meta tags

---

## Current focus 🎯
- [x] Fix requirements page query (`supabase` → `db`)
- [x] Verify admin + service-role key working
- [x] Redeploy complete MVP to Vercel with service-role env var
- [ ] **Apply the in-repo SQL** (run `supabase-setup.sql` + `supabase-fix-*` + `supabase-ensure-funnel-policies.sql` + `supabase-legal-*.sql` in the Supabase SQL Editor) — much of Stage 3 stays inert until this is done
- [ ] **Publish legal content** — flip KA/MH/TN/AP/KL state rules + articles to `published=true` with a reviewer; lawyer-review the disclaimers
- [ ] **Real listings + real users** — the intelligence/digest/nudges/agent funnel need live data

---

## Stage 3 — Legal Navigator + Intelligence ✅ (built since last tracker update)

- [x] **Land Legal Navigator** (`/legal`): hub, eligibility wizard + rule engine (KA/MH/TN/AP/KL),
  risk meter, shareable results (`/legal/result/[id]`), state guides (`/legal/state/[state]`),
  state comparison (`/legal/compare`), NRI hub (`/legal/nri`), company/entity hub (`/legal/company`),
  document checklist, 10-step due diligence (per-listing scope), mock lawyer directory, service
  packages (incl. state-specific), articles/FAQ system with structured data, lead capture → admin triage.
  *(`/eligibility` 301-redirects here; content is draft-gated until lawyer sign-off.)*
- [x] **Founder Intelligence Layer (v1, descriptive)** — `/admin/intelligence`: weighted demand
  vs. supply by district & land type (30/90-day window), unmet-demand list, ₹/acre price benchmarks;
  public demand nudge (`/api/wanted-areas` + WantedAreas on home/sell/listing-new); weekly email digest cron.
- [x] **Programmatic SEO landing pages** — `/region/[district]`, `/region/[district]/[type]`,
  `/land/[type]` with market stats + price insight (ISR).
- [x] **Agent dashboard** (`/agent`) — leads pipeline + conversion, commission tracking (`deals`),
  territory + market analytics.
- [x] **Verification workflow** (owner doc upload → admin approve), **reports/moderation**,
  **listing moderation** (pending → admin approval queue with live update).
- [x] **Price intelligence** — `lib/price-insight.ts`, PriceInsight panel, MarketStats.
- [x] **PWA** (manifest/icons/theme-color), **per-listing OG images**, site-wide Org/WebSite
  structured data, **/sell** seller landing, mobile sticky contact bar, demand capture on empty searches.
- [x] **CSV import/export** for listings (admin).

---

## UX/UI Design Requirements (from design brief)

The goal: a portal materially better than MagicBricks, 99acres, Housing.com, LandWatch, Land.com, Farmflip, Zillow Land, Realtor.com Land. Each requirement is captured and phased.

### A. Zero-friction discovery — *find land in ≤3 clicks*
- [x] Search-first entry **[v1.x]** — home hero SearchBar
- [x] Map-first entry **[MVP]** (basic)
- [x] Explore by region (district + district×land-type + land-type landing pages) **[v2 done]** — `/region/[district]`, `/region/[district]/[type]`, `/land/[type]` with market stats, price insight, ISR
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

### F. Buyer Decision Dashboard **[v2 — partial]**
- [~] Pros / risks / estimated appreciation / suitability per listing — **price insight** (₹/acre vs. district median) + **Trust Score** breakdown shipped; pros/risks + appreciation estimate still **[v2]**
- [x] Suitability per purpose: farming, farmhouse, resort, eco-tourism, warehouse, solar, investment — `SuitabilityPanel` + `lib/suitability.ts` on listing detail

### G. Mobile-first **[MVP → ongoing]**
- [x] Responsive layout + mobile menu **[MVP]** (basic)
- [x] Thumb-friendly polish, large tap targets **[v1.x]** — redesign: pill buttons, larger targets
- [ ] WhatsApp-style communication UI **[v2]**
- [x] Low-bandwidth optimization **[v1.x]** — next/image (WebP, responsive, lazy) on all listing photos
- [~] PWA **[v1.x partial]** — installable manifest + icons + theme-color shipped; offline caching of saved properties still **[v3]**
- [x] Mobile sticky contact bar on listing detail **[v1.x]**

### H. Agent experience — *best-in-class* **[v2 — largely done]**
- [x] Lead + follow-up dashboards, commission tracking — `/agent`: leads pipeline + conversion, status filter, `deals` commission
- [x] Upload wizard, verification status — create wizard + verification workflow (owner doc upload → admin approve)
- [x] Performance + territory analytics, market trends — territory chips + ₹/acre market insights on `/agent`
- [ ] Agent rankings/badges (Top Performer, Fast Responder…) **[v2]** — *bounded; computable from existing lead/listing data*
- [ ] AI listing descriptions + property videos **[v3]**
- Maps to blueprint Section K

### I. Internal sales CRM **[v2 → v3 — partial]**
- [~] Lead funnel / buyer-journey — admin sees inquiries + legal leads (triage); search→demand→supply captured. Full multi-stage funnel still **[v2]**
- [x] Agent + territory analysis — `/agent` territory + market insights
- [~] Hot-demand clusters, underpriced-land detection — **hot-demand clusters done** (`/admin/intelligence` sourcing priorities); underpriced/undervalued detection needs data volume **[v3]**
- [ ] Follow-up scheduling, AI recommendations **[v3]**
- Maps to blueprint Section L

### J. AI Copilot everywhere **[v3 / BP]**
- [ ] Buyer NL search · Seller listing assistant · Agent "who to call today" · Internal "rising-demand villages"
- All source-linked + labeled (blueprint Section P)

### K. WhatsApp-first **[v1.x → v2]**
- [x] WhatsApp share of listing **[MVP]** — plus per-listing OG image so shared links preview richly
- [ ] WhatsApp login, lead alerts, brochures **[v2]** (email alerts shipped; WhatsApp channel still pending)
- [ ] WhatsApp chatbot **[v3]**

### L. Gamification **[v1.x → v3]**
- [x] Users: saved searches, watchlists, alerts, collections **[v1.x done]** — watchlists, DB-backed saved searches, collections, and **email alerts via daily Vercel cron** (`/api/alerts`, Resend) all shipped
- [ ] Agents: rankings, badges (Verified Expert, Top Performer, Fast Responder, Trusted Agent) **[v2]**

### M. Accessibility & languages **[v2 → v3 — partial]**
- [~] Multi-language **[v1.x partial]** — i18n scaffolding live with **English / Hindi / Kannada** (cookie locale, server+client). Coverage is partial (newer pages incl. the legal module are English-only); Tamil/Telugu/Marathi/Malayalam not added. Hindi/Kannada strings need native review.
- [x] Accessibility baseline — skip link, focus rings, `<html lang>`, labelled search/filters/icon buttons
- [ ] Voice search / navigation, elderly-friendly mode **[v3]**

### N. Viral / sharing **[v1.x → v2]**
- [x] Share property card (WhatsApp) **[MVP]**
- [x] Compare properties **[v1.x]** — select up to 4 (persisted), floating tray, `/compare` table with trust scores
- [ ] Share farm portfolio **[v2]**
- [~] Calculators **[v1.x partial]** — **EMI calculator** + **area converter** shipped (`/tools`); investment/appreciation/ROI/farm-suitability/resort-feasibility still **[v2]** *(bounded: pure math, no data deps)*
- [ ] AI Property Report PDF **[v3]**

---

## Founder Intelligence Layer 🔑 — *strategic, may outvalue the marketplace*

The acquisition/sales-machine engine. **A descriptive v1 is now built** (`/admin/intelligence`
+ `/api/wanted-areas` + weekly digest cron); the predictive/scoring half waits on real data volume.

- [x] **Villages/districts where demand is concentrated** — weighted demand (requirement ×3, notify-me ×2, search ×1) vs. supply, 30/90-day window
- [x] **Land types with rising/strong demand** — demand-vs-supply by land type
- [x] **Unmet-demand surfacing + public seller nudge** — under-served districts shown to sellers; weekly founder email digest
- [ ] Undervalued / under-priced cluster detection **[v3 — needs data volume]**
- [ ] Distressed-seller / seller-urgency detection **[v3 — needs data]**
- [ ] High-performing agent identification **[v3 — needs agent activity history]**
- [ ] Future hotspot prediction (time-series/ML) **[v3 / BP]**
- [ ] Buyer intent scores · Seller urgency scores · Acquisition opportunity (DealScore) **[v3 / BP]**

> **Action now [done]:** every search, listing, requirement, inquiry, and notify-me is logged
> with timestamp + location. That raw history now powers the descriptive layer above; richer
> scoring becomes possible as volume grows.

---

## Known issues 🐛
- `.env.local` + `node_modules` are per-machine (gitignored by design — recreate each machine)
- **Repo SQL must be applied manually** — schema/policy/seed `.sql` files are run by pasting into the Supabase SQL Editor; nothing auto-migrates. Several Stage-3 features stay inert until run.
- No server-side listing input validation beyond HTML required fields *(bounded backlog item)*
- Inquiries capture `contact_phone` + `lead_status` but no account identity (still anonymous-friendly)

## Tech debt 🔧
- [x] Extract shared components (ListingCard, TrustScore, badges, etc.)
- [x] Loading skeletons (explore/listing/region/land/listings/requirements)
- [ ] Route-level error boundaries (global `error.tsx` exists; per-route still thin)
- [ ] Validate env vars on startup *(bounded)*
- [ ] Replace browser `confirm()` with proper modals (still used in a few delete actions) *(bounded)*
- [ ] Server-side form validation layer *(bounded)*

---

*Last updated: June 7, 2026 (resync after Stage 3 — Legal Navigator + Founder Intelligence + region pages + agent dashboard + verification/moderation + PWA/SEO). Full vision: land-portal-blueprint.md · build scope: mvp-scope.md · architecture: project-architecture.md.*
