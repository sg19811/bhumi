# Acrehub Buying Circles — Phase 1 Spec

> **Honest framing.** This document is **Phase 1 only — about 1 week of Claude Code work** — built around a single discipline: *don't build operational software for an operation you haven't run yet*. The strategic concept is strong and the compliance posture is right. What's cut from MVP is anything that requires real buyers, real vendors, or operational delivery experience that AcrehubIndia hasn't accumulated yet. Phases 2–5 are listed at the end so nothing is forgotten — but they're not what we build now.
>
> **The hard truth this module is gated on:** code can be shipped in a week. The operation it implies — calling buyers within hours of their interest, forming groups, doing site visits, coordinating lawyers and revenue offices, coordinating vendors, managing post-purchase governance — takes years to build into a real organisation. If the software is built but nobody picks up the phone when a buyer expresses interest, the brand damage is permanent. Section 15 covers what to do operationally *before* this module is worth shipping publicly.

---

## 1. Deliberation: what stays, what's cut, what's deferred

### KEEP (core MVP)
- **Buyer interest capture** with all acknowledgements — this IS the MVP.
- **`/co-buy`** public landing page (single page, not four).
- **`/co-buy/[slug]`** opportunity detail page.
- **Co-buy eligible badge + CTA on listing detail** — the most important integration.
- **Express Interest form** — the legal acknowledgement checkboxes are non-negotiable.
- **`co_buy_opportunities` + `co_buy_interests` tables** — two tables only.
- **Admin: create opportunity from listing, view leads, basic status workflow.**
- **One calculator: Contribution Calculator.**
- **All disclaimers, NRI warnings, "expression of interest only" copy.**
- **Soft-commitment field** (single number, not a system).
- **Sitemap entry + minimal SEO metadata.**

### CUT FROM MVP (defer to Phase 2)
- Private buying circle rooms (`/co-buy/circles/*`).
- `co_buy_circles`, `co_buy_circle_members`, `co_buy_documents`, `co_buy_milestones`, `co_buy_site_visits`, `co_buy_site_visit_rsvps`, `co_buy_events`, `co_buy_tasks` tables.
- Lead scoring algorithm.
- Voting / decisions UI.
- Discussion / updates section in private rooms.
- Multiple SEO landing pages (`/co-buy/how-it-works`, `/co-buy/legal-and-risks`, `/co-buy/faq`) — fold into `/co-buy`.
- Buyer requirement flow integration (keep `/buy` separate).
- Multiple internal team roles.
- NRI legal-gate as separate route — inline warning + link to `/legal/nri`.

### CUT FROM MVP (defer to Phase 3+)
- Vendor CRM (`acrehub_vendors`, `/admin/vendors/*`).
- Service request workflow (`co_buy_service_requests`, `co_buy_service_tasks`, `co_buy_service_vendor_quotes`, `co_buy_service_updates`).
- Buyer approval workflow for service estimates.
- State-by-state document checklists inside Buying Circles (link to Legal Navigator instead).
- Founder Intelligence views specific to co-buy.
- Two extra calculators (Farm Plot Comparison, Post-Purchase Cost) — keep only Contribution Calculator.

### KEEP-AS-COPY (preserve exact compliance language — do NOT paraphrase)
- "This is only an expression of interest. It is not a legal offer, securities product, investment advice, or final legal opinion."
- "AcrehubIndia can coordinate lawful administrative, legal, professional, and infrastructure services for a fee. We do not guarantee approvals, legal outcomes, government decisions..."
- The NRI/OCI warning.
- The "no unofficial payments" language.
- "Co-buying land is legally complex. Do not pay money or sign documents without lawyer review."
- All seven acknowledgement checkboxes on the interest form.

---

## 2. Phase 1 scope
1. Database migration — two tables + one boolean on `listings` (defensive).
2. Listings extension — `is_co_buy_eligible boolean default false`; admin toggle.
3. `/co-buy` — single hub landing page (server, ISR).
4. `/co-buy/[slug]` — opportunity detail (server, ISR).
5. `/co-buy/[slug]/express-interest` — interest form (client + server validation). Hard-blocks without all acknowledgements.
6. Listing detail integration — conditional `CoBuyListingCTA` when `is_co_buy_eligible`.
7. Explore filter chip — "Co-Buy Eligible".
8. Admin — `/admin/co-buy` overview, opportunity create/edit, leads list with status workflow.
9. Sitemap entry — `/co-buy` + dynamic `/co-buy/[slug]`.

Nothing more.

---

## 3. Data model
See `supabase-co-buy.sql` (generated from this section). Two tables: `co_buy_opportunities`, `co_buy_interests`, plus `listings.is_co_buy_eligible`. RLS: public reads only `open_for_interest`/`forming_circle` opportunities; admin (`is_admin()`) reads/writes all; **no public-insert on `co_buy_interests`** — inserts go through a server route using the service-role client that validates the 8 acknowledgement booleans server-side.

---

## 4. Route structure
```
EXTEND (conditional rendering):
  /listing/[id]            → conditional <CoBuyListingCTA /> when is_co_buy_eligible
  /listing/[id]/edit       → toggle is_co_buy_eligible
  /explore                 → "Co-Buy Eligible" filter chip
  /admin                   → "Buying Circles" card → /admin/co-buy

NEW (Phase 1 — 8 routes):
  /co-buy                                 hub (server, ISR)
  /co-buy/[slug]                          opportunity detail (server, ISR)
  /co-buy/[slug]/express-interest         interest form (client + server action/route)
  /co-buy/[slug]/thanks                   confirmation
  /admin/co-buy                           admin overview
  /admin/co-buy/leads                     leads list + status workflow
  /admin/co-buy/opportunities/new         create
  /admin/co-buy/opportunities/[id]        edit

DEFERRED (do not build): /co-buy/how-it-works, /co-buy/legal-and-risks, /co-buy/faq,
  /co-buy/circles/**, /admin/co-buy/circles/**, /admin/co-buy/services/**, /admin/vendors/**
```

---

## 5. Integration with the existing site
1. Homepage — single co-buy opportunity card when ≥1 `open_for_interest` (don't build a giant section until 3+).
2. Listing detail — conditional `CoBuyListingCTA` card above description when `is_co_buy_eligible`. **Most important integration.**
3. Explore filter chip — `WHERE is_co_buy_eligible = true`.
4. Admin listing edit — single toggle; on first enable, offer to create an opportunity (`/admin/co-buy/opportunities/new?listing_id=...`).
5. Legal Navigator cross-link — deep-link to `/legal/state/{state}` via `districtToState(listing.district)`. Don't duplicate legal content.
6. Sitemap — `/co-buy` + open opportunity slugs.
7. Search logs — tag `surface='co_buy_hub'` / `'co_buy_opportunity'` (reuse existing logger).
8. WhatsApp share — reuse `WhatsAppShare`.
9. NOT integrated: `/buy` flow, Founder Intelligence views, programmatic region/land co-buy pages.

---

## 6. Component plan
**Reuse:** Header, Footer, Logo, Map/MapLoader, WhatsAppShare, SaveButton, ShareButton, TrustScore, PriceInsight, ListingCard, admin shell.
**Extend:** ListingCard (eligible pill), listing detail (CTA block), admin listing edit (toggle), SearchFilters (chip).
**New public (`app/components/co-buy/`):** CoBuyBadge, CoBuyOpportunityCard, CoBuyListingCTA, CoBuyHero, CoBuyHowItWorks, CoBuyServicesExplainer, CoBuyContributionCalculator, CoBuyProgressBar, CoBuyLegalDisclaimer, CoBuyRiskNotice, CoBuyNriWarning, CoBuyFaqAccordion, CoBuyInterestForm.
**New admin:** AdminCoBuyOpportunityTable, AdminCoBuyOpportunityForm, AdminCoBuyLeadTable, AdminCoBuyLeadDrawer.
**Lib (`app/lib/co-buy/`):** types.ts, disclaimers.ts (verbatim constants), service-categories.ts (9 categories), calculator.ts (pure), slug.ts. Plus the server route/action for submission.

---

## 7. UX flow (Phase 1)
**Buyer:** listing CTA or `/co-buy` → `/co-buy/[slug]` (read, calculator, disclaimers) → `/express-interest` (9-step mobile-first; final step = 8 ack checkboxes; submit disabled until all ticked) → server validates → insert → `/thanks` ("we'll call within 24–48h").
**Admin:** `/admin` Buying Circles card → `/admin/co-buy` leads → drawer (all fields, status, notes, WhatsApp/call deep links) → update status after call. Create opportunity from listing or `/admin/co-buy/opportunities/new`.
No circles, documents, services, or payments — Phase 2+.

---

## 8. SEO plan
`/co-buy` only (800–1200 words): hero, problem, how it works (6 steps), service overview, featured opportunities (max 6), FAQ accordion (8–10 Q), trust + legal. Title: "Buy large agricultural land together in India | Acrehub Buying Circles". FAQPage JSON-LD. Per-opportunity: dynamic title/desc, LocalBusiness + BreadcrumbList JSON-LD, canonical. Sitemap: `/co-buy` (0.7, weekly), slugs (0.6, weekly). No auto-generated SEO prose; no keyword stuffing; no "join 12 investors!" social proof (a small "12 buyers interested" signal is OK).

---

## 9. Admin / sales workflow (Phase 1)
The admin is *you* — calling every buyer personally. Software ensures you don't forget anyone and captures what was said. Minimum: `/admin` card with counts; `/admin/co-buy` overview (open opps, recent leads, status pipeline); `/admin/co-buy/leads` table → drawer (full data, status dropdown, notes, "Open WhatsApp" + "Call now" deep links); opportunity create/edit forms. No lead assignment, team roles, service creation, or vendor management. WhatsApp templates go in `docs/whatsapp-templates.md` — copy-paste, no UI.

---

## 10. Phased roadmap (gated by real activity, not time)
- **Phase 1 (THIS):** now → ~1 week. Interest capture, opportunity pages, admin leads, listing integration.
- **Phase 2:** after 20+ qualified leads & 1 informal WhatsApp circle. Circle creation, private rooms, milestones/documents/site visits.
- **Phase 3:** after ONE service delivered end-to-end manually. Service request workflow, vendor CRM, quotes, approvals.
- **Phase 4:** after 5+ completed transactions. Lead scoring, team roles, automated templates, dashboards.
- **Phase 5:** after post-purchase governance done manually once. Maintenance subscriptions, expenses, voting, exit/resale.

---

## 11. Files likely to change
**Modify:** `app/listing/[id]/page.tsx`, `app/listing/[id]/edit/page.tsx`, `app/components/ListingCard.tsx`, `app/explore/page.tsx` + `app/components/SearchFilters.tsx`, `app/admin/page.tsx`, `app/sitemap.ts`, `app/page.tsx`.
**Create:** `app/co-buy/page.tsx`, `app/co-buy/[slug]/page.tsx`, `app/co-buy/[slug]/express-interest/page.tsx` + submission route/action, `app/co-buy/[slug]/thanks/page.tsx`, `app/admin/co-buy/*`, all components & lib in §6, `supabase-co-buy.sql`, `docs/whatsapp-templates.md`.
**Don't touch:** Legal Navigator, Farm Plots, Agent Dashboard, Founder Intelligence (pick up data passively). Brand: `acrehub`/`AcreHub` = marketplace; `AcrehubIndia` = services arm — honor in user-facing copy.

---

## 12. Risks & assumptions
**Risks:** (1) operational over-promise — don't launch until every lead gets a call within 24h; (2) SEBI/CIS regulatory — preserve compliance copy exactly, get a lawyer to review user-facing copy + ack language before launch (~₹20–50K); (3) NRI mis-routing — auto-route `buyer_type='nri_oci'` to `status='nri_legal_review'`; (4) first-mover failure — personally seed the first opportunity + warm-call 10–15 prospects, must show 5+ leads in 14 days or pull it; (5) co-owner dispute — the lawyer-reviewed co-ownership agreement is the real product; (6) schema bloat — nullable everything except ack booleans.
**Assumptions:** `is_admin()` exists ✅; service-role secure-insert pattern reused (via API route, not a listing server action — see inspection report); `listings.state`/district populated for eligible parcels; Karnataka/Tamil Nadu legal pages published before linking.

---

## 13. Testing checklist
Manual QA (incognito): `/co-buy` renders; `/co-buy/[slug]` 404s for non-existent/draft/closed; calculator math sane; listing CTA only when eligible; **submit disabled until all 8 ack checkboxes ticked (client AND server)**; `nri_oci` → `status='nri_legal_review'`; success → `/thanks`; phone normalized; admin card counts; leads table + drawer + status save + WhatsApp deep link; explore filter; sitemap includes open slugs only; RLS (anon can't read interests, non-admin reads only own, admin reads all).
Smoke: `GET /co-buy` 200 "Buying Circle"; `GET /co-buy/[seeded-slug]` 200; `GET /sitemap.xml` contains "/co-buy/"; `GET /explore?co_buy=1` 200.

---

## 14. Build prompts (paste sequentially — each gated by human review)
1. **Inspect, plan, schema** — inspection report + `supabase-co-buy.sql` (don't run, don't write other code). *(Done — see `docs/buying-circles-phase1-inspection.md`.)*
2. **Lib files** — `types.ts`, `disclaimers.ts` (verbatim), `service-categories.ts`, `calculator.ts` (pure), `slug.ts`; extend listing TS type with `is_co_buy_eligible`.
3. **Public landing + opportunity page** — `/co-buy`, `/co-buy/[slug]`, public components, `CoBuyListingCTA`, sitemap. (After SQL is run.)
4. **Interest form + server submission + thanks** — multi-step form, secure server validation of 8 acks + NRI routing, `/thanks`.
5. **Admin + listing edit toggle + explore chip + smoke + docs** — admin overview/leads/opportunity forms, `is_co_buy_eligible` toggle, filter chip, smoke tests, `docs/whatsapp-templates.md`, update CLAUDE.md + tracker, build + branch (DO NOT push to main).

---

## 15. The non-code work (the entire point)
Do not launch `/co-buy` publicly until items 1–3 are done:
1. **Lawyer-reviewed compliance pass** on user-facing copy + the 8 acknowledgements (CIS/AIF/adviser concerns) — ~₹20–50K.
2. **One real seed opportunity** (20–50 acre parcel in Karnataka/Tamil Nadu) with real photos/price/legal status.
3. **Personal 24-hour SLA** on every lead. If you can't commit, don't launch.
4. **Lawyer-drafted co-ownership agreement template** for one state (start Karnataka) — ~₹50K–1L.
5. **Five Bangalore-corridor vendor relationships** (lawyer, surveyor, fencing, civil, farm consultant) — not on the website yet.
6. **A dedicated AcrehubIndia WhatsApp number.**
7. **A 3-month "no public launch" period** — soft-launch to 10–20 known prospects, refine, then turn on SEO/homepage visibility.

---

*Last updated: June 8, 2026. Companion to CLAUDE.md, docs/project-tracker.md, docs/legal-navigator-spec.md, docs/farm-plots-spec.md.*
