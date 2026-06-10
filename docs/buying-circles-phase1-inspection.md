# Buying Circles — Phase 1 inspection report

> Output of "Prompt 1" from `docs/buying-circles-spec.md`. Snapshot 2026-06-10.
> No feature code written in this step — only inspection + the migration (`supabase-co-buy.sql`).

## 1. Land types / listing field options (centralized where?)
- `app/lib/land.ts` — `LAND_TYPE_LABELS` map + `landLabel()` (marketplace land types, incl. farm-plot types).
- `app/lib/legal/options.ts` — `LAND_TYPE_OPTIONS`, `BUYER_TYPE_OPTIONS`, `STATES`, etc. (wizard/selectors).
- `app/lib/farm-plots/*` — farm-plot-specific option lists.
- **For Phase 2 build:** new co-buy enums (buyer_type, status, share label) go in `app/lib/co-buy/types.ts`, not these.

## 2. Admin pages + how admin auth is checked
- Client gate: `useAuth()` exposes `role`; pages check `role === 'admin'` (e.g. `app/admin/page.tsx`, `app/admin/import/page.tsx`). Non-admins see an "Admins only" panel (no HTTP redirect).
- DB gate: RLS uses **`is_admin()`** (SECURITY DEFINER, checks `profiles.role = 'admin'`). ✅ confirmed present in `supabase-setup.sql` (+ farm-plots / fix / legal migrations).
- Admin dashboard (`app/admin/page.tsx`) is a client component that reads many tables via the anon client (RLS-gated) — it does **not** use the service-role client in the browser (correct).
- **For Phase 5 build:** `/admin/co-buy/*` pages follow the same `role === 'admin'` client gate; reads are RLS-gated by the admin policies in `supabase-co-buy.sql`.

## 3. Server-action / secure-insert pattern (correcting a spec assumption)
- **There is no server action for listing creation.** `app/listing/new/page.tsx` does a **client-side** `supabase.from('listings').insert(...)` under RLS. Same for `/buy` (`buyer_interests`) and the legal `LeadCaptureForm` (`legal_inquiries`).
- The genuine **service-role pattern** lives in **API routes**: `app/api/notify-lead/route.ts` and `app/api/alerts/route.ts` import `supabaseAdmin` from `app/lib/supabase-server.ts` and run server-side only.
- **Decision for Prompt 4:** the express-interest submission will POST to a server route **`app/api/co-buy/interest/route.ts`** (or a `"use server"` action) that uses `supabaseAdmin`, validates all 8 ack booleans `=== true`, checks the opportunity is `open_for_interest`/`forming_circle`, normalizes the phone, sets `status='nri_legal_review'` for `buyer_type='nri_oci'`, then inserts. This preserves the spec's security intent (no public-insert RLS policy) while matching the codebase's actual API-route convention.
- Reminder (CLAUDE.md hard rule): never import `lib/supabase-server.ts` into a `"use client"` file.

## 4. `is_admin()` Supabase function
- ✅ Present. Defined in `supabase-setup.sql`; referenced by farm-plots, legal, and fix migrations. The co-buy RLS policies reuse it.

## 5. Legal Navigator state pages (cross-link target)
- Route: `app/legal/state/[state]/page.tsx` → `/legal/state/{state}` (e.g. `/legal/state/karnataka`, `/legal/state/tamil_nadu`).
- `districtToState()` (`app/lib/legal/districts.ts`) maps a listing district → state slug; `stateLabel()` (`app/lib/legal/options.ts`) gives the label.
- **For the build:** co-buy legal blocks deep-link via `districtToState(listing.district)` → `/legal/state/{state}`. Karnataka/Tamil Nadu guides exist; confirm they're published before linking (spec §12 assumption).

## Other confirmations
- **SEO infra** ready to reuse: `app/sitemap.ts` (BASE = `https://acrehubindia.com`), Breadcrumb/FAQ JSON-LD patterns already used on farm-plots and guides-style pages.
- **Reusable components** confirmed present: `Header`, `Footer`, `Logo`, `MapLoader`, `WhatsAppShare`, `ShareButton`, `SaveButton`, `TrustScore`, `ListingCard`, `PriceInsight`.
- **Smoke tests** exist: `tests/smoke/pages.spec.ts` (request-based GET + needle). New co-buy routes will be added here in Prompt 5.
- **Brand note:** keep `AcreHub`/`acrehub` for the marketplace, `AcrehubIndia` for the services entity in user-facing co-buy copy (spec §11).

## Next step (gated on you)
1. Run **`supabase-co-buy.sql`** in the Supabase SQL Editor.
2. Confirm the **lawyer review** of the acknowledgement/disclaimer copy is planned (spec §15) — the build can proceed in parallel, but **do not launch `/co-buy` publicly** until §15 items 1–3 are done.
3. Give the go-ahead and I'll execute Prompt 2 (lib files + types) on a feature branch.
