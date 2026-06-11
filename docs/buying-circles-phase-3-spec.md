# Acrehub Buying Circles — Phase 3 Spec

> **Phase 3 builds on Phase 2.** Prerequisites: Phase 2 is shipped, buying circles are forming, members are using the private rooms. This phase adds the paid services layer — the actual revenue engine of the AcrehubIndia business.
>
> **Effort estimate:** ~4-6 weeks of Claude Code work (20-30 build days). This is the largest single phase.
>
> **What this phase is and isn't:** This phase builds the service-request lifecycle (request → quote → buyer approval → execution → completion), the vendor CRM, and the cost-transparency workflow (government fees + vendor cost + AcrehubIndia fee shown separately). It does NOT yet handle online payment, escrow, or post-purchase governance. All money handling remains offline; the software tracks status, scope, approval, and progress only.
>
> **Compliance note:** Phase 3 is where the regulatory exposure is highest. Service fees, vendor coordination, and government-fee facilitation all need to be presented carefully. **Get the user-facing copy lawyer-reviewed before ship**, especially the buyer-approval flow language. The "we don't make unofficial payments" language must remain prominent.

---

## 1. Scope

**In scope:**

- 9 service categories from the original prompt (Co-Buy Coordination, Legal/Revenue Facilitation, Site Visit, Registration, Boundary/Security, Common Amenities, Agriculture/Plantation, Architecture/Planning, Post-Purchase Maintenance)
- Service request creation (admin-initiated; member-requested follows in Phase 4)
- Cost breakdown with three explicit columns: official/government fees, vendor cost, AcrehubIndia fee
- Vendor CRM (internal-only; no public marketplace)
- Vendor quote management
- Buyer approval workflow (member acknowledgement before paid work starts)
- Service progress updates with visibility controls (internal_only / circle_members / public_summary)
- Internal team task tracking tied to service requests
- Service status lifecycle

**Deferred to Phase 4:**
- Member-initiated service requests (admin-initiated only in Phase 3)
- Lead scoring algorithm
- Multi-role team assignment (single admin per request in Phase 3)
- Saved WhatsApp templates as a feature
- Service-revenue analytics dashboards

**Deferred to Phase 5:**
- Recurring maintenance subscriptions
- Post-purchase service tracking
- Member voting on service requests

**Never in scope (regulatory):**
- Online payment collection
- Escrow facilities
- Money pooling
- Securities-style fractional interest issuance

---

## 2. Data model (Phase 3)

```sql
-- 1. Vendor CRM
create table if not exists acrehub_vendors (
  id uuid primary key default gen_random_uuid(),
  vendor_name text not null,
  vendor_category text not null,
    -- 'lawyer' | 'revenue_consultant' | 'surveyor' | 'registration_consultant'
    -- | 'civil_contractor' | 'fencing_vendor' | 'security_agency' | 'borewell_vendor'
    -- | 'water_consultant' | 'electrician' | 'solar_vendor' | 'architect' | 'planner'
    -- | 'landscape_designer' | 'agriculture_consultant' | 'horticulture_expert'
    -- | 'farm_manager' | 'caretaker' | 'labour_contractor' | 'drone_photographer'
    -- | 'soil_testing_lab' | 'other'
  primary_contact_name text,
  phone text not null,
  whatsapp text,
  email text,
  city text,
  district text,
  state text,
  coverage_areas text[] default '{}',                        -- districts or corridors they cover
  verification_status text default 'unverified',             -- 'unverified' | 'verified' | 'paused' | 'blocked'
  internal_score integer,                                    -- 1-5 internal rating; admin-only
  price_range_notes text,                                    -- 'fencing ~₹150/ft as of Jan 2026' style
  services_offered text[] default '{}',                      -- maps to service_category values
  active boolean default true,
  internal_notes text,                                       -- admin-only
  onboarded_at timestamptz default now(),
  last_engaged_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists vendors_category_idx on acrehub_vendors(vendor_category);
create index if not exists vendors_state_idx on acrehub_vendors(state);
create index if not exists vendors_active_idx on acrehub_vendors(active);

-- 2. Service requests (the core workflow entity)
create table if not exists co_buy_service_requests (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete restrict,
  opportunity_id uuid references co_buy_opportunities(id),
  service_category text not null,
    -- 'co_buy_coordination' | 'legal_revenue_facilitation' | 'site_visit_field_verification'
    -- | 'registration_coordination' | 'boundary_security' | 'common_amenities'
    -- | 'agriculture_plantation' | 'architecture_planning' | 'civil_works'
    -- | 'landscaping' | 'community_farming' | 'post_purchase_maintenance' | 'other'
  title text not null,
  description text,
  scope jsonb default '{}',                                  -- structured scope items
  status text not null default 'requested',
    -- 'requested' | 'under_review' | 'quote_pending' | 'quoted'
    -- | 'buyer_approval_pending' | 'approved' | 'in_progress'
    -- | 'completed' | 'cancelled' | 'on_hold'
  
  -- Cost transparency (three separate columns by regulatory design)
  official_fees_estimate bigint default 0,                   -- government fees, stamp duty, registration charges
  vendor_cost_estimate bigint default 0,                     -- third-party vendor charges
  acrehub_service_fee bigint default 0,                      -- AcrehubIndia coordination fee
  estimated_total_cost bigint generated always as (
    coalesce(official_fees_estimate,0) + coalesce(vendor_cost_estimate,0) + coalesce(acrehub_service_fee,0)
  ) stored,
  
  fee_model text default 'fixed',                            -- 'fixed' | 'success_linked' | 'per_buyer' | 'time_and_materials' | 'custom'
  fee_notes text,                                            -- explains the fee model in plain words
  
  -- Approval tracking
  approval_required boolean default true,
  approval_status text default 'pending',                    -- 'pending' | 'circle_approved' | 'rejected' | 'not_applicable'
  approved_at timestamptz,
  approved_by_summary text,                                  -- admin-entered: "Approved by 7 of 10 members via WhatsApp on..."
  
  buyer_visible_summary text,                                -- shown to members
  internal_notes text,                                       -- admin-only
  
  -- Assignment (single owner in Phase 3; multi-role in Phase 4)
  assigned_owner_id uuid references auth.users(id),
  
  requested_by uuid references auth.users(id),               -- admin who created the request in Phase 3
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz,
  cancelled_at timestamptz
);
create index if not exists svc_req_circle_idx on co_buy_service_requests(circle_id);
create index if not exists svc_req_status_idx on co_buy_service_requests(status);
create index if not exists svc_req_category_idx on co_buy_service_requests(service_category);

-- 3. Quotes from vendors
create table if not exists co_buy_service_vendor_quotes (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references co_buy_service_requests(id) on delete cascade,
  vendor_id uuid references acrehub_vendors(id),
  vendor_name_snapshot text,                                 -- if vendor not in CRM yet, record name here
  quote_title text not null,
  quote_amount bigint not null,
  quote_details text,
  quote_file_url text,                                       -- Supabase Storage URL
  validity_end_date date,
  selected boolean default false,                            -- the quote chosen for execution
  internal_notes text,
  buyer_visible boolean default false,                       -- whether to show this quote to members
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists svc_quotes_req_idx on co_buy_service_vendor_quotes(service_request_id);

-- 4. Tasks within a service request (for the internal team)
create table if not exists co_buy_service_tasks (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references co_buy_service_requests(id) on delete cascade,
  task_type text,
    -- 'call_member' | 'coordinate_vendor' | 'collect_quote' | 'revenue_office_followup'
    -- | 'lawyer_followup' | 'surveyor_followup' | 'registration_planning' | 'site_visit'
    -- | 'civil_work' | 'boundary_work' | 'agriculture_consultation' | 'landscaping'
    -- | 'security_setup' | 'buyer_approval' | 'payment_followup' | 'upload_update' | 'other'
  title text not null,
  description text,
  status text default 'open',                                -- 'open' | 'in_progress' | 'done' | 'blocked' | 'cancelled'
  assigned_to uuid references auth.users(id),
  due_date date,
  internal_notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists svc_tasks_req_idx on co_buy_service_tasks(service_request_id);
create index if not exists svc_tasks_assigned_idx on co_buy_service_tasks(assigned_to);

-- 5. Service progress updates (the visible activity stream)
create table if not exists co_buy_service_updates (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references co_buy_service_requests(id) on delete cascade,
  circle_id uuid not null references co_buy_circles(id),    -- denormalized for RLS efficiency
  update_type text,                                          -- 'milestone' | 'status_change' | 'photo' | 'document' | 'note' | 'completion'
  title text not null,
  body text,
  media_urls text[] default '{}',                            -- photos / videos in Supabase Storage
  visibility text not null default 'circle_members',
    -- 'internal_only' | 'circle_members' | 'public_summary'
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create index if not exists svc_updates_req_idx on co_buy_service_updates(service_request_id);
create index if not exists svc_updates_circle_idx on co_buy_service_updates(circle_id);
create index if not exists svc_updates_vis_idx on co_buy_service_updates(visibility);

-- RLS
alter table acrehub_vendors enable row level security;
alter table co_buy_service_requests enable row level security;
alter table co_buy_service_vendor_quotes enable row level security;
alter table co_buy_service_tasks enable row level security;
alter table co_buy_service_updates enable row level security;

-- Vendors: admin only (internal CRM in Phase 3; public directory is Phase 4+)
create policy "admin all vendors" on acrehub_vendors for all to authenticated
  using (is_admin()) with check (is_admin());

-- Service requests: circle members can read; admin all
create policy "members read service requests" on co_buy_service_requests for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all service requests" on co_buy_service_requests for all to authenticated
  using (is_admin()) with check (is_admin());

-- Quotes: circle members see only quotes marked buyer_visible; admin all
create policy "members read buyer-visible quotes" on co_buy_service_vendor_quotes for select to authenticated
  using (buyer_visible = true and exists (
    select 1 from co_buy_service_requests sr
    where sr.id = service_request_id and is_circle_member(sr.circle_id)
  ));
create policy "admin all quotes" on co_buy_service_vendor_quotes for all to authenticated
  using (is_admin()) with check (is_admin());

-- Tasks: admin only (internal queue)
create policy "admin all svc tasks" on co_buy_service_tasks for all to authenticated
  using (is_admin()) with check (is_admin());

-- Updates: visibility-aware
create policy "members read member-visible updates" on co_buy_service_updates for select to authenticated
  using (visibility = 'circle_members' and is_circle_member(circle_id));
create policy "anyone reads public updates" on co_buy_service_updates for select
  using (visibility = 'public_summary');
create policy "admin all updates" on co_buy_service_updates for all to authenticated
  using (is_admin()) with check (is_admin());
```

**Key compliance principle in the schema:** the three cost columns (`official_fees_estimate`, `vendor_cost_estimate`, `acrehub_service_fee`) are deliberately separate fields. This ensures the UI **always** displays them broken out — never as a single "total." This is the regulatory positioning made structural.

---

## 3. Route structure (Phase 3)

```
NEW PRIVATE ROUTES:
  /co-buy/circles/[id]/services                → list of service requests for the circle
  /co-buy/circles/[id]/services/[reqId]        → service request detail (member view)
  /co-buy/circles/[id]/services/[reqId]/approve → member approval form (links to detail)

NEW ADMIN ROUTES:
  /admin/co-buy/services                       → all service requests across circles
  /admin/co-buy/services/[reqId]               → service request detail (admin)
  /admin/co-buy/services/new                   → create service request
  /admin/vendors                               → vendor CRM list
  /admin/vendors/new                           → onboard new vendor
  /admin/vendors/[id]                          → edit vendor
  /admin/co-buy/services/[reqId]/quotes        → quote management
  /admin/co-buy/services/[reqId]/tasks         → task list for the request
```

---

## 4. Integration with existing site

**1. Circle dashboard extension.** On `/co-buy/circles/[id]` (Phase 2), add a "Services" section showing service requests for this circle, with status badges. Click → service detail.

**2. Phase 2 milestone integration.** When a milestone reaches `registration_planning`, the admin UI prompts: "Create Registration Coordination service request?" If yes → opens `/admin/co-buy/services/new?circle_id=...&category=registration_coordination`.

**3. Circle activity feed.** Service updates with `visibility='circle_members'` appear in the existing circle event feed (`co_buy_events` from Phase 2). Add a new event_type `service_update_posted` and a corresponding renderer.

**4. Opportunity page treatment.** On the public `/co-buy/[slug]` (Phase 1), the "Service Layer Explainer" cards stay read-only but now optionally link to public `co_buy_service_updates` (with `visibility='public_summary'`) from completed services in similar opportunities — for credibility. Example: "Completed: Boundary fencing for Kanakapura 40-acre circle, March 2026."

**5. Admin dashboard.** Extend `/admin/co-buy` and `/admin` with Phase 3 cards: services in progress, awaiting buyer approval, this-week vendor follow-ups, vendor count.

**6. Existing components reused:**
- File upload pattern from listing creation (for quote files + update photos)
- Existing Supabase Storage bucket strategy
- WhatsApp share for approval requests

**7. NOT integrated:**
- Public service marketplace — vendors stay internal-only in Phase 3
- Payment gateway — no money flow in software
- Buyer requirements form — services don't tie to requirements

---

## 5. Component plan (Phase 3)

**New components in `app/components/co-buy/services/`:**

Member-facing:
- `ServiceRequestList.tsx` — circle's service requests grid
- `ServiceRequestCard.tsx` — single request summary
- `ServiceRequestDetail.tsx` — full member view
- `ServiceCostBreakdown.tsx` — the three-column cost display (gov / vendor / AcrehubIndia)
- `ServiceApprovalPanel.tsx` — for circle members; admin enters approval summary
- `ServiceUpdatesFeed.tsx` — visibility-filtered updates
- `ServiceProgressBar.tsx` — visual lifecycle status

Admin:
- `AdminServiceRequestTable.tsx` — all requests across circles
- `AdminServiceRequestForm.tsx` — create/edit
- `AdminServiceRequestDetail.tsx` — full admin view with tabs (scope, quotes, tasks, updates)
- `AdminServiceCostEditor.tsx` — edit the three cost columns with explanations
- `AdminQuoteManager.tsx` — add/edit/select quotes
- `AdminVendorTable.tsx` — vendor list
- `AdminVendorForm.tsx` — create/edit vendor
- `AdminServiceTaskList.tsx` — task kanban
- `AdminServiceUpdatePoster.tsx` — post a new update with visibility control
- `AdminServiceApprovalEntry.tsx` — enter the approval summary post-WhatsApp consensus

**Library files (`app/lib/co-buy/services/`):**
- `types.ts` — TypeScript types
- `service-categories.ts` — extended definitions from Phase 1's catalog with scope templates per category
- `vendor-categories.ts` — vendor category enum + labels
- `service-actions.ts` — server actions (create request, add quote, mark approved, post update, etc.)
- `cost-formatting.ts` — INR formatting helpers
- `visibility.ts` — helper to filter updates by viewer role

---

## 6. UX flow

**Admin creates service request (admin-initiated in Phase 3):**

1. Admin in `/admin/co-buy/circles/[id]` clicks "Add service" → modal with 9 service categories
2. Selects category (e.g., Boundary/Security) → routes to `/admin/co-buy/services/new?circle_id=...&category=boundary_security`
3. Form prefilled with scope template for that category. Admin edits scope, adds description, sets initial cost estimates (all three columns), saves as `status='requested'`
4. Event auto-created in the circle's event feed: "Service request created: Boundary/Security"

**Admin gets quotes from vendors:**

1. Admin opens `/admin/co-buy/services/[reqId]/quotes`
2. "Add Quote" → selects vendor from CRM (or "New vendor" → quick vendor add)
3. Enters quote amount, attaches PDF if available, sets validity
4. Repeats for 2-3 vendors
5. Marks one quote as `selected=true` → that quote's amount populates `vendor_cost_estimate` on the request
6. Sets `buyer_visible=true` on quotes the admin wants members to see (typically only the selected one)
7. Status → `quoted`

**Buyer approval flow:**

1. Admin sets status to `buyer_approval_pending`. Event created: "Service estimate ready for review"
2. Members see the request on `/co-buy/circles/[id]/services/[reqId]` with the three-column cost breakdown clearly displayed
3. Each cost column has an explainer:
   - **Official / Government fees** — "Paid lawfully to government via proper channels"
   - **Vendor cost** — "Paid to the third-party vendor for work executed"
   - **AcrehubIndia coordination fee** — "Charged by AcrehubIndia for managing this service"
4. Members read, discuss in WhatsApp group (the actual decision-making channel)
5. Once consensus is reached, admin enters approval into `AdminServiceApprovalEntry`:
   - `approved_by_summary` = "Approved by 7 of 10 members in WhatsApp poll on 12 Mar 2026"
   - Status → `approved`
6. Event created: "Service approved by circle"

**Execution + updates:**

1. Admin sets status → `in_progress`, creates tasks
2. As work happens: admin posts updates via `AdminServiceUpdatePoster`. Each update has visibility:
   - `internal_only` — admin team only
   - `circle_members` — visible to members of this circle
   - `public_summary` — visible publicly (for credibility on opportunity pages)
3. Updates can include photos. Members see them on `ServiceUpdatesFeed`
4. On completion: status → `completed`, completion update posted, optional `public_summary` update

**Vendor onboarding (admin):**

1. Admin in `/admin/vendors` clicks "New Vendor"
2. Form: name, category, contact, city/coverage, services offered, price range notes
3. Save → status starts as `unverified`
4. After working with the vendor: admin updates `verification_status='verified'`, sets `internal_score`
5. Vendor now appears in the dropdown when adding quotes to service requests

---

## 7. Admin workflow (Phase 3)

The admin's daily routine in Phase 3 expands considerably:

1. **Service request triage:** new requests need scope refinement
2. **Quote chasing:** vendors are slow; tasks like "call X vendor for quote" go in the task queue
3. **Approval shepherding:** members in the WhatsApp group need nudging; admin posts the cost breakdown link in WA, follows up
4. **Execution tracking:** for in-progress services, daily/weekly check-ins with vendors, photo updates posted
5. **Completion documentation:** photos, final cost vs estimate, post to members and optionally public

This is where the "AcrehubIndia coordinates end-to-end" promise becomes real. The software exists to make the team's actual coordination work efficient and auditable.

---

## 8. Compliance considerations (Phase 3 specific)

This phase has the most regulatory exposure of any. Make these design choices explicit and lawyer-reviewed:

**1. Three-column cost display.** The schema enforces it; the UI must too. Every member-facing cost view shows official/vendor/AcrehubIndia separately. This is the structural defense against "AcrehubIndia is collecting unofficial payments."

**2. AcrehubIndia fee charged separately.** Document operationally: AcrehubIndia issues invoices for its coordination fee only. Vendor invoices go directly to circle members (or to the circle's pooled account that members fund directly). AcrehubIndia is not a money-flow intermediary.

**3. No payment in software.** The `approved` status means "members have agreed to proceed and pay outside the platform" — not "money has been collected." The software doesn't see, hold, or route payments.

**4. Per-request disclaimer copy.** On every service request page, show: "AcrehubIndia coordinates this service. We do not guarantee government approvals, legal outcomes, vendor performance, construction quality, or final costs. Quoted amounts are estimates; actual costs may vary."

**5. Vendor disclaimer.** "Vendors are coordinated by AcrehubIndia but operate independently. AcrehubIndia does not warrant vendor work; warranties and liabilities lie with the vendor."

**6. Government-fee handling.** Explicit text: "Government fees, stamp duty, registration charges, and statutory dues must be paid lawfully through proper official channels. AcrehubIndia does not make unofficial or facilitation payments."

Get these reviewed by a lawyer with proptech + service-business experience before ship.

---

## 9. Risks and assumptions

**Risks:**

1. **Buyer approval gets ambiguous** — "5 out of 10 said yes in WA" is not a clean record. *Mitigation:* `approved_by_summary` is free-text admin-entered. Document operationally how AcrehubIndia handles partial consensus (e.g., minimum 70% threshold). For high-cost services (>₹5 lakh), require written confirmation from each member via WhatsApp screenshot or email.
2. **Quote management bloat** — vendors send PDFs, photos, voice notes. *Mitigation:* `quote_file_url` accepts one file; admin can attach the most authoritative. Internal voice notes / WA messages stay in WA — don't try to be a CRM-for-WhatsApp.
3. **Service category misuse** — admin may create requests with non-canonical categories. *Mitigation:* `service_category` is a string but the UI restricts to the 13 enum values; `other` exists for true edge cases.
4. **Vendor double-booking / overload** — if AcrehubIndia uses the same fencing vendor across 5 circles, the vendor gets overwhelmed. *Mitigation:* vendor list shows `last_engaged_at`; the task queue makes this visible.
5. **Cost estimate drift** — actual costs often exceed estimates in Indian construction. *Mitigation:* `fee_notes` field documents assumptions; updates can post variance to members. Don't pretend estimates are commitments.

**Assumptions:**
- Phase 2 is shipped and stable
- AcrehubIndia has 5+ vendors already in working relationships (the CRM populates from existing reality)
- The team handling services has at least 2-3 people (a sales/coordination person and a build/field person)
- Lawyer-reviewed compliance copy exists before public ship

---

## 10. Files likely to change

**Modify:**
- `app/co-buy/circles/[id]/page.tsx` — add Services section
- `app/admin/co-buy/circles/[id]/page.tsx` — add Services tab
- `app/co-buy/[slug]/page.tsx` — optional public_summary updates from completed services
- `app/admin/page.tsx` — extend Buying Circles dashboard

**Create:**
- All routes in section 3
- All components in section 5
- All library files in section 5
- `supabase-co-buy-phase-3.sql` — migration from section 2

**Don't touch:**
- Anything outside `app/co-buy/services/*`, `app/admin/co-buy/services/*`, `app/admin/vendors/*`, `app/components/co-buy/services/*`, `app/lib/co-buy/services/*`
- Phase 1 and Phase 2 working code

---

## 11. Testing checklist

**Manual QA:**

1. **Vendor CRM:**
   - Onboard a new vendor; appears in vendor list
   - Status transitions: unverified → verified → paused
   - Member cannot access /admin/vendors (RLS test)
2. **Service request lifecycle:**
   - Admin creates request from circle detail
   - Members see request in their service list
   - Admin adds quotes from vendors; selects one
   - Status changes propagate: requested → quoted → buyer_approval_pending → approved → in_progress → completed
3. **Three-column cost display:**
   - On every member view, the three columns are visible and labelled
   - Cannot find any "Total cost" alone without breakdown anywhere member-facing
4. **Buyer approval:**
   - Admin records approval summary; status updates to `approved`
   - Approval timestamp + summary persisted
5. **Updates visibility:**
   - `internal_only` updates invisible to members
   - `circle_members` updates visible to that circle's members only
   - `public_summary` updates visible publicly
   - Cross-circle: member of circle A cannot see updates from circle B
6. **Quote visibility:**
   - Quotes default to `buyer_visible=false`
   - Only quotes marked `buyer_visible=true` appear in member view
7. **Task queue:**
   - Admin creates tasks; not visible to members at all
   - Task completion tracked
8. **Disclaimer presence:**
   - Every service-request detail page (member view) shows the per-request disclaimer
   - Every quote display shows the vendor disclaimer

**Smoke tests:**
```
GET /co-buy/circles/[id]/services            (member)      → 200
GET /admin/vendors                           (admin)        → 200
GET /admin/vendors                           (non-admin)    → 403
GET /admin/co-buy/services                   (admin)        → 200
```

---

## 12. Claude Code build prompts

### Prompt 1 — Schema + vendor CRM

```
Read CLAUDE.md, docs/buying-circles-phase-3-spec.md, and Phase 2 specs.

Output supabase-co-buy-phase-3.sql per spec section 2 (5 tables + RLS). Ready to apply.

Then build the vendor CRM:
1. app/lib/co-buy/services/vendor-categories.ts (the 22 vendor types)
2. app/admin/vendors/page.tsx — vendor list
3. app/admin/vendors/new/page.tsx — create vendor
4. app/admin/vendors/[id]/page.tsx — edit vendor
5. AdminVendorTable + AdminVendorForm components

This is foundational — service requests will depend on it. Show me a plan first.
```

### Prompt 2 — Service request creation (admin)

```
I've applied the migration.

Build service request creation:
1. app/lib/co-buy/services/types.ts + service-categories.ts (the 13 service categories with scope templates)
2. app/admin/co-buy/services/page.tsx — all requests
3. app/admin/co-buy/services/new/page.tsx — create request with prefill from query params
4. app/admin/co-buy/services/[reqId]/page.tsx — admin detail with tabs
5. Server actions in app/lib/co-buy/services/service-actions.ts
6. Add "Add service" button to /admin/co-buy/circles/[id] linking to new request form

Three-column cost editor is critical — labels must be the exact compliance copy from spec section 8.
```

### Prompt 3 — Quote management + tasks

```
Build quote and task management:
1. AdminQuoteManager.tsx with add/edit/select/buyer-visible toggle
2. /admin/co-buy/services/[reqId]/quotes (tab inside service detail OR own page)
3. AdminServiceTaskList.tsx — kanban or list
4. /admin/co-buy/services/[reqId]/tasks
5. Task auto-creation: when service is created, seed 2-3 default tasks based on category
6. Vendor dropdown in quote form pulls from active+verified vendors, filtered by service_category

Member side: nothing yet.
```

### Prompt 4 — Member-facing service views + approval

```
Build the member experience:
1. app/co-buy/circles/[id]/services/page.tsx — list of requests for this circle
2. app/co-buy/circles/[id]/services/[reqId]/page.tsx — detail with three-column cost, approval state, quote (if buyer_visible), updates feed
3. ServiceRequestDetail, ServiceCostBreakdown, ServiceUpdatesFeed components
4. Compliance disclaimers: per-request disclaimer + vendor disclaimer at bottom of every member-facing page
5. Admin approval entry: AdminServiceApprovalEntry — text field for approved_by_summary, sets status='approved'

Privacy / visibility tests: a member of circle A must not see anything from circle B.
```

### Prompt 5 — Updates + progress + final polish

```
Build the update/progress workflow:
1. AdminServiceUpdatePoster.tsx — visibility radio (internal/members/public), title/body/photo upload
2. ServiceUpdatesFeed.tsx — RLS-aware rendering
3. Integration: when service status changes, auto-create a 'status_change' update
4. Integration: on /co-buy/[slug] (Phase 1 opportunity page), pull recent public_summary updates from similar/completed opportunities (limit 3)
5. Extend /admin/co-buy dashboard with service counts
6. Smoke tests from spec section 11
7. Update CLAUDE.md + tracker
8. Run npm run build, fix errors, commit. Branch only.
```

---

## 13. The non-code work for Phase 3

This phase has the most operational prerequisites — the team is now the product:

1. **Lawyer review of all compliance copy** in the buyer approval flow, three-column cost display, vendor disclaimer, per-request disclaimer. **Do not ship Phase 3 without this.** Budget ₹30-75K for the review specifically.
2. **AcrehubIndia legal entity structure for service revenue.** AcrehubIndia should be a service company (Pvt Ltd or LLP); marketplace and services should be in separate entities. A CA review is required.
3. **GST registration and invoicing setup** for AcrehubIndia. Service fees attract GST in India; this needs to be reflected in cost displays for services above the threshold.
4. **Vendor agreements.** Each vendor in the CRM should have a basic service agreement with AcrehubIndia (scope, payment terms, indemnity, confidentiality). Doesn't need to be in software; needs to exist on paper.
5. **Internal approval thresholds.** Document: services below ₹X don't need full circle approval; services above ₹Y need written confirmation from each member. The software allows admin-entered summaries; the policy defines what's acceptable.
6. **Public_summary content review.** Anything marked `visibility='public_summary'` becomes marketing content. Have a designated person (not the engineer) approve each one before it goes public.

---

*Companion to buying-circles-spec.md (Phase 1), buying-circles-phase-2-spec.md (Phase 2), buying-circles-phase-4-spec.md (Phase 4), buying-circles-phase-5-spec.md (Phase 5).*
