# AcreHub — Pending / Open Items Report

> Snapshot as of 2026-06-08. Covers the **whole app**, not just farm plots. Grouped by priority:
> **P0** = blocking / ops / activation · **P1** = unshipped work + real bugs · **P2** = product backlog (next) ·
> **P3** = advanced / moat (later). Items marked *(uncertain)* need a quick confirmation.

---

## P0 — Activation & ops (do these to make what's built actually work)

1. **Run the Phase 3 migration** — `supabase-farm-plots-phase3.sql` is **not yet applied**. Until it is,
   resale posting, lead assignment, and the virtual-tour field won't persist (they degrade gracefully).
2. **Add `ANTHROPIC_API_KEY`** (server-only, no `NEXT_PUBLIC_`) in `.env.local` **and** Vercel → activates the
   AI buyer report + AI listing assistant. Everything else works without it.
3. **Production domain is wrong / unclean.** `bhumi.vercel.app` does **not** serve this project (returns 404);
   the live site is on the generated `bhumi-…-projects19.vercel.app` URL. Action: assign a **stable public
   domain** (clean `*.vercel.app` or a custom domain) in Vercel → Settings → Domains. This is also an SEO bug
   (see P1.3).
4. **Confirm Deployment Protection stays off for production** (it was blocking all public visitors earlier).
5. **Confirm which SQL migrations are applied** *(uncertain)*. Repo has 15 `supabase-*.sql` files. Known:
   `supabase-farm-plots.sql` ✅, `…-phase2.sql` ✅, `…-phase3.sql` ⏳. Verify the legal seeds and fix scripts
   (`…-fix-listings-read`, `…-fix-owner-manage-listings`, `…-ensure-funnel-policies`) were each run once.
6. **Local-only branches not backed up** — see P1.1; they exist only on this machine (not pushed). Risk of loss.

---

## P1 — Unshipped work & real bugs

1. **Two unmerged branches with real features** (local only, never pushed → at risk):
   - **`overnight/foundation-hardening`** — Playwright smoke tests, GA4 + PostHog analytics, **zod server-side
     validation gate**, env-var validation on startup, **ConfirmModal** (replaces `confirm()`), **route error
     boundaries**, ROI/appreciation calculators. *None of this is on `main`.* Decide: merge or discard.
   - **`chore/tracker-resync`** — the Bhūmi→AcreHub doc/branding resync. Decide: merge or discard.
   > Several "Known issues / tech debt" below are **already fixed on the hardening branch** — merging it closes them.
2. **Listing input validation** — beyond HTML `required`, server-side validation only exists on the unmerged
   hardening branch (zod). On `main`, create/edit largely trust the client.
3. **SEO canonical/JSON-LD point to a dead domain.** `app/sitemap.ts` `BASE` and the farm-plots Breadcrumb
   JSON-LD are hardcoded to `https://bhumi.vercel.app` (which 404s). Every canonical URL, sitemap entry, and
   breadcrumb references a non-working host. Fix once the real domain (P0.3) is decided.
4. **`confirm()` still used** in `AdminListingRow` and `my-listings` (ConfirmModal exists only on the hardening branch).
5. **Legal pricing is placeholder data.** Lawyer fees, service "from ₹…" prices, and ratings are
   `*_placeholder` fields (illustrative, not real). Needs real data or a clearer "indicative" disclaimer before
   relying on them.
6. **Inquiries are anonymous** — store no buyer identity; hard to follow up beyond a phone number.

---

## P2 — Product backlog (the tracker's "next", ~42 open items)

**Discovery**
- Region/village/taluka **landing pages** (`/region/...`) — partially in sitemap, pages not built.
- **Draw-to-search** polygon on the map.
- Richer semantic search purposes ("coffee estate in Coorg", "resort-suitable").

**Map & visualization**
- Toggleable **dynamic layers**: village/survey boundaries, roads/water/forests (needs PostGIS + gov data).
- **Boundary overlay** on satellite (parcel polygons), terrain view.
- **Nearby amenities** (schools/hospitals/markets/stations) — needs a Places API (paid; ask first).
- **360 tours** (native viewer) and **drone** capture program (link/upload exists; no native panorama viewer).

**Trust & decisions**
- **Trust Score v2**: document / ownership / encumbrance / identity verification (currently completeness-based).
- **Land Health Score** (0–100: water/soil/road/topography/legal/demand).
- **Buyer Decision Dashboard** (pros/risks/appreciation/suitability per purpose).

**Agents & CRM**
- **Agent experience**: lead + follow-up dashboards, commission tracking, territory/performance analytics.
- **Internal sales CRM**: lead funnel, hot-demand clusters, underpriced-land detection, follow-up scheduling.

**Engagement / comms**
- **WhatsApp**: login, lead alerts, brochures, chatbot (only share + brochure exist today).
- WhatsApp-style in-app messaging UI; offline/PWA for saved properties.
- **Gamification**: agent rankings/badges; saved-search **alerts** need a scheduled job.

**Reach**
- **Full multi-language** (Hindi/Kannada/Tamil/Telugu/Marathi/Malayalam) — only nav/some strings are i18n'd now.
- Voice search, elderly-friendly mode.

**Sharing**
- Share farm **portfolio**; **AI Property Report PDF**; more calculators (resort feasibility, farm suitability).

---

## P3 — Founder Intelligence Layer & moat (v3 — capture data now, build later)

All unbuilt (the strategic differentiator). Raw data **is** being logged (`search_logs`, `demand_signals`),
which is the important part. To build later:
- Villages where searches are rising fast · land types with rising demand · undervalued-cluster detection ·
  distressed-seller detection · high-performing-agent ID · future-hotspot prediction ·
  buyer-intent / seller-urgency / acquisition (DealScore) scores.
- AI Copilot everywhere (buyer NL search, seller assistant, agent "who to call today", internal "rising villages").
- Resale **ownership-transfer** flow (current resale is contact-only); resale moderation/verification.

---

## Farm-plots — small known follow-ups
- **Seed real projects** per corridor before publicising (empty corridor pages are weak SEO). *Highest-value move.*
- Create-time **plot/document save is best-effort** (RLS) — reliably added via the **Edit** page after a listing exists.
- **Document upload is link-based**, not file-to-storage.
- **Hosur (Tamil Nadu)**: copy + TN legal guidance need a **TN lawyer review** before that corridor goes public
  (the page already self-flags this).
- Define the **farm-plot verification standard** behind the tiered badge.

---

## Suggested order
1. P0.1–P0.4 (run Phase 3 SQL, decide domain, confirm protection) — unlocks/cleans what's already built.
2. Decide on **`overnight/foundation-hardening`** (P1.1) — merging it closes validation, analytics, error
   boundaries, and `confirm()` debt in one move.
3. Fix the **canonical domain** in code (P1.3) once the domain is chosen.
4. Then real-project onboarding > new features.
