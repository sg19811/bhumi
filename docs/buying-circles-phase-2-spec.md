# Acrehub Buying Circles — Phase 2 Spec

> **Phase 2 builds on Phase 1.** Prerequisites: Phase 1 is shipped, you have qualified leads in `co_buy_interests`, and AcrehubIndia is already running buying-circle coordination operationally (manually or via spreadsheets). This phase converts existing operational practice into software so the team scales beyond what one founder can hold in their head.
>
> **Effort estimate:** ~3 weeks of Claude Code work (15-18 build days).
>
> **What this phase is and isn't:** This phase builds the *coordination layer* — circles get formed, members get organized, documents get tracked, site visits get scheduled, costs get shown. It does NOT include paid services (Phase 3) or post-purchase governance (Phase 5). When a circle reaches the registration milestone in Phase 2, the actual registration handoff happens via the AcrehubIndia team manually — Phase 3 software comes later.

---

## 1. Scope

**In scope:**

- Conversion of `co_buy_interests` (Phase 1 leads) into circle members
- New `co_buy_circles` table with full status workflow
- Member management with privacy controls (masked identity until verified)
- Document status tracking (no file upload yet — just status flags + admin notes)
- Milestone timeline (per-circle progression markers)
- Site visit scheduling + buyer RSVP
- Cost estimate display (admin-entered, member-visible)
- Legal checklist with state-specific deep-links into Legal Navigator
- Activity event log per circle
- Private circle room (`/co-buy/circles/[id]`) — members-only view
- Admin: circle creation, member add/remove, milestone updates, site visit management
- WhatsApp group link field (admin pastes the WhatsApp group invite link; software doesn't manage WhatsApp directly)

**Deferred to Phase 3:**
- Service requests, vendor CRM, quote management, buyer service approval, service updates
- All of `co_buy_service_*` and `acrehub_vendors` tables

**Deferred to Phase 4:**
- Lead scoring algorithm
- Multi-role team assignment (still single admin in Phase 2; team can be added but everyone is "admin")
- Saved WhatsApp templates as a feature

**Deferred to Phase 5:**
- Post-purchase governance, expense tracking, voting, exit interest

---

## 2. Data model (Phase 2)

```sql
-- 1. Buying circles (the group entity)
create table if not exists co_buy_circles (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references co_buy_opportunities(id) on delete restrict,
  slug text unique not null,                                 -- short identifier for URL: 'kanakapura-40-acre-001'
  name text not null,                                        -- 'Kanakapura 40-acre Circle' or similar
  status text not null default 'forming',
    -- 'forming' | 'threshold_pending' | 'threshold_reached' | 'site_visit_scheduled'
    -- | 'legal_review' | 'negotiation' | 'agreement_drafting' | 'registration_planning'
    -- | 'completed' | 'cancelled' | 'archived'
  target_amount bigint,                                      -- expected total amount across all members
  current_soft_commitment_amount bigint default 0,
  target_members integer,
  current_members integer default 0,
  internal_sales_owner uuid references auth.users(id),       -- single owner for Phase 2; multi-role in Phase 4
  lawyer_name text,
  lawyer_status text default 'not_assigned',                 -- 'not_assigned' | 'engaged' | 'review_in_progress' | 'review_complete'
  legal_structure text,                                      -- free text in MVP; lawyer-determined
  legal_status text default 'pending_review',
  next_site_visit_id uuid,                                   -- self-ref forward declaration; FK added later in migration
  milestone_stage text default 'group_formation',
  whatsapp_group_link text,                                  -- admin pastes invite URL; software does NOT manage WA
  private_summary text,                                      -- admin-curated summary visible to all members
  admin_notes text,                                          -- admin-only
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_circles_opp_id_idx on co_buy_circles(opportunity_id);
create index if not exists co_buy_circles_status_idx on co_buy_circles(status);

-- 2. Circle members (the join table from interest to circle)
create table if not exists co_buy_circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  interest_id uuid references co_buy_interests(id) on delete set null,
  user_id uuid references auth.users(id),                    -- nullable; admin may add member before they have an account
  display_name text not null,                                -- masked or full per member.identity_visibility
  identity_visibility text default 'first_name_city',        -- 'first_name_city' | 'full_name' | 'masked'
  desired_share_label text,
  soft_commitment_amount bigint default 0,
  member_status text default 'invited',
    -- 'invited' | 'active' | 'paused' | 'withdrawn' | 'removed'
  joined_at timestamptz default now(),
  notes text,                                                -- admin-only
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_members_circle_idx on co_buy_circle_members(circle_id);
create index if not exists co_buy_members_user_idx on co_buy_circle_members(user_id) where user_id is not null;
create unique index if not exists co_buy_members_circle_user_uniq on co_buy_circle_members(circle_id, user_id) where user_id is not null;

-- 3. Documents (status tracking only; no file upload in Phase 2)
create table if not exists co_buy_documents (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  doc_type text not null,
    -- Generic: 'sale_deed' | 'parent_deed' | 'ec' | 'mutation' | 'survey_sketch' | 'tax_receipts'
    -- | 'litigation_check' | 'lawyer_opinion' | 'co_ownership_agreement_draft' | 'sale_agreement_draft'
    -- KA: 'rtc_pahani' | '11e_phodi' | 'ptcl_check' | 'conversion_order_ka'
    -- TN: 'patta_chitta' | 'a_register' | 'fmb_sketch_tn' | 'poramboke_check' | 'dtcp_approval'
    -- MH: '7_12' | '8a' | 'ferfar' | 'section_63_check' | 'na_conversion_mh'
    -- KL: 'btr' | 'thandaper' | 'pokkuvaravu' | 'data_bank_check_kl'
    -- AP: 'adangal' | 'ror_1b' | 'lp_map_ap' | '22a_check' | 'assigned_land_check_ap'
  status text default 'pending',                             -- 'pending' | 'in_review' | 'received' | 'verified' | 'flagged' | 'not_required'
  admin_notes text,                                          -- admin-only
  buyer_visible_note text,                                   -- shown to circle members
  flagged_concern text,                                      -- if status='flagged'
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create index if not exists co_buy_docs_circle_idx on co_buy_documents(circle_id);
create unique index if not exists co_buy_docs_circle_type_uniq on co_buy_documents(circle_id, doc_type);

-- 4. Milestones (timeline markers per circle)
create table if not exists co_buy_milestones (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  milestone_key text not null,
    -- 'group_forming' | 'group_qualified' | 'lawyer_engaged' | 'site_visit_done'
    -- | 'documents_under_review' | 'legal_clear' | 'sale_agreement' | 'registration_scheduled'
    -- | 'registration_complete' | 'handoff_to_phase5'
  title text not null,
  description text,
  status text default 'pending',                             -- 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'
  target_date date,
  completed_at timestamptz,
  sort_order integer default 0,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_milestones_circle_idx on co_buy_milestones(circle_id);
create unique index if not exists co_buy_milestones_circle_key_uniq on co_buy_milestones(circle_id, milestone_key);

-- 5. Site visits
create table if not exists co_buy_site_visits (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  scheduled_date timestamptz,                                -- nullable until confirmed
  meeting_point text,
  duration_minutes integer,
  transport_notes text,
  status text default 'proposed',                            -- 'proposed' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  field_coordinator_name text,
  post_visit_summary text,                                   -- admin posts after visit
  post_visit_media_urls text[] default '{}',                 -- URLs to photos in Supabase Storage; upload UI in admin only
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_site_visits_circle_idx on co_buy_site_visits(circle_id);

-- 6. Site visit RSVPs
create table if not exists co_buy_site_visit_rsvps (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid not null references co_buy_site_visits(id) on delete cascade,
  member_id uuid not null references co_buy_circle_members(id) on delete cascade,
  rsvp_status text not null default 'pending',               -- 'pending' | 'attending' | 'not_attending' | 'maybe'
  attendees_count integer default 1,                         -- members may bring family
  notes text,
  responded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists co_buy_rsvps_visit_member_uniq on co_buy_site_visit_rsvps(site_visit_id, member_id);

-- 7. Circle event log (activity feed)
create table if not exists co_buy_events (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  event_type text not null,
    -- 'circle_created' | 'member_joined' | 'member_left' | 'milestone_completed' | 'document_received'
    -- | 'document_flagged' | 'site_visit_scheduled' | 'site_visit_completed' | 'legal_review_started'
    -- | 'admin_announcement'
  actor_user_id uuid references auth.users(id),
  payload jsonb default '{}',                                -- event-specific data
  visibility text default 'members',                         -- 'members' | 'internal_only'
  title text not null,                                       -- short member-visible title
  body text,                                                 -- optional longer description
  created_at timestamptz default now()
);
create index if not exists co_buy_events_circle_idx on co_buy_events(circle_id, created_at desc);
create index if not exists co_buy_events_visibility_idx on co_buy_events(visibility);

-- 8. Admin task list (internal task queue per circle)
create table if not exists co_buy_tasks (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  task_type text,                                            -- 'call_member' | 'engage_lawyer' | 'collect_document' | 'schedule_visit' | 'follow_up' | 'other'
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
create index if not exists co_buy_tasks_circle_idx on co_buy_tasks(circle_id);
create index if not exists co_buy_tasks_assigned_idx on co_buy_tasks(assigned_to) where assigned_to is not null;

-- Now we can add the deferred FK
alter table co_buy_circles add constraint co_buy_circles_next_visit_fk
  foreign key (next_site_visit_id) references co_buy_site_visits(id) on delete set null;

-- RLS
alter table co_buy_circles enable row level security;
alter table co_buy_circle_members enable row level security;
alter table co_buy_documents enable row level security;
alter table co_buy_milestones enable row level security;
alter table co_buy_site_visits enable row level security;
alter table co_buy_site_visit_rsvps enable row level security;
alter table co_buy_events enable row level security;
alter table co_buy_tasks enable row level security;

-- Helper: is the user a member of this circle?
create or replace function is_circle_member(p_circle_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from co_buy_circle_members
    where circle_id = p_circle_id
      and user_id = auth.uid()
      and member_status = 'active'
  );
$$;

-- Circles
create policy "members read their circle" on co_buy_circles for select to authenticated
  using (is_circle_member(id));
create policy "admin all circles" on co_buy_circles for all to authenticated
  using (is_admin()) with check (is_admin());

-- Members
create policy "members read fellow members" on co_buy_circle_members for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all members" on co_buy_circle_members for all to authenticated
  using (is_admin()) with check (is_admin());

-- Documents
create policy "members read circle documents" on co_buy_documents for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all documents" on co_buy_documents for all to authenticated
  using (is_admin()) with check (is_admin());

-- Milestones
create policy "members read milestones" on co_buy_milestones for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all milestones" on co_buy_milestones for all to authenticated
  using (is_admin()) with check (is_admin());

-- Site visits
create policy "members read site visits" on co_buy_site_visits for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all site visits" on co_buy_site_visits for all to authenticated
  using (is_admin()) with check (is_admin());

-- RSVPs: members can read all RSVPs in their circle, but only write their own
create policy "members read circle rsvps" on co_buy_site_visit_rsvps for select to authenticated
  using (exists (
    select 1 from co_buy_site_visits sv
    where sv.id = site_visit_id and is_circle_member(sv.circle_id)
  ));
create policy "members write own rsvp" on co_buy_site_visit_rsvps for insert to authenticated
  with check (exists (
    select 1 from co_buy_circle_members m
    where m.id = member_id and m.user_id = auth.uid()
  ));
create policy "members update own rsvp" on co_buy_site_visit_rsvps for update to authenticated
  using (exists (
    select 1 from co_buy_circle_members m
    where m.id = member_id and m.user_id = auth.uid()
  ));
create policy "admin all rsvps" on co_buy_site_visit_rsvps for all to authenticated
  using (is_admin()) with check (is_admin());

-- Events: members see only member-visible events
create policy "members read member events" on co_buy_events for select to authenticated
  using (is_circle_member(circle_id) and visibility = 'members');
create policy "admin all events" on co_buy_events for all to authenticated
  using (is_admin()) with check (is_admin());

-- Tasks: admin only (internal queue)
create policy "admin all tasks" on co_buy_tasks for all to authenticated
  using (is_admin()) with check (is_admin());
```

**Key RLS principle:** A member of circle A cannot see any data from circle B. The `is_circle_member()` helper is used everywhere. `admin_notes`, `internal_notes`, `co_buy_tasks` are admin-only.

---

## 3. Route structure (Phase 2)

```
NEW PRIVATE ROUTES:
  /co-buy/circles                              → user's circles list (auth required)
  /co-buy/circles/[id]                         → circle dashboard (members only)
  /co-buy/circles/[id]/documents               → document status (read-only)
  /co-buy/circles/[id]/site-visit              → site visit + RSVP
  /co-buy/circles/[id]/costs                   → cost estimate (read-only)
  /co-buy/circles/[id]/members                 → member list (privacy controls)
  /co-buy/circles/[id]/timeline                → milestone + event feed

NEW ADMIN ROUTES:
  /admin/co-buy/circles                        → all circles table
  /admin/co-buy/circles/new                    → create from qualified interests
  /admin/co-buy/circles/[id]                   → circle detail (admin view)
  /admin/co-buy/circles/[id]/members           → member management
  /admin/co-buy/circles/[id]/documents         → document admin
  /admin/co-buy/circles/[id]/milestones        → milestone editor
  /admin/co-buy/circles/[id]/site-visits       → site visit admin
  /admin/co-buy/circles/[id]/tasks             → task queue
```

---

## 4. Integration with existing site

**1. Admin lead workflow extension.** On the existing `/admin/co-buy/leads` page (Phase 1), the lead drawer gets a new action: **"Add to Circle"**. Selecting it opens a sub-modal listing the eligible circles for this opportunity (status='forming' or 'threshold_pending'), or "Create new circle" which routes to `/admin/co-buy/circles/new?opportunity_id=...&interest_id=...`.

**2. User auth integration.** When a buyer with a pending `co_buy_interest.status='added_to_circle'` logs in via existing Supabase Auth, a new top-level navigation item "My Buying Circles" appears in the header. This routes to `/co-buy/circles` and lists all circles they're a member of.

**3. Opportunity page changes.** On `/co-buy/[slug]`, if logged-in user is already a circle member for that opportunity, show "View your buying circle" CTA instead of "Express Interest".

**4. Legal Navigator deep-link.** The legal checklist on `/co-buy/circles/[id]/documents` cross-links every state-specific document (RTC, Patta, etc.) to the corresponding Legal Navigator page (`/legal/state/karnataka` etc.).

**5. Existing components reused:**
- `Map`, `MapLoader` — for site visit meeting point display
- `WhatsAppShare` — for sharing site visit invites
- `Header`, `Footer`, `Logo`
- Existing admin shell

**6. NOT integrated for Phase 2:**
- Listing detail page is unchanged from Phase 1
- Buyer requirements form is unchanged
- Sitemap doesn't include private circle routes (they're auth-gated)

---

## 5. Component plan (Phase 2)

**New components in `app/components/co-buy/circles/`:**

Public/member:
- `CircleHeader.tsx` — name, status badge, progress bar, key stats
- `CircleMembersList.tsx` — privacy-respecting member display
- `CircleMilestonesTimeline.tsx` — vertical timeline of milestones
- `CircleDocumentsChecklist.tsx` — document status grid
- `CircleSiteVisitCard.tsx` — upcoming/past site visit + RSVP button
- `CircleSiteVisitRsvpForm.tsx` — client component for RSVP submission
- `CircleCostBreakdown.tsx` — read-only cost estimate display
- `CircleLegalChecklist.tsx` — state-specific checklist with Legal Navigator links
- `CircleEventFeed.tsx` — recent activity log
- `CircleQuickActions.tsx` — WhatsApp group join, contact admin, etc.

Admin:
- `AdminCircleTable.tsx` — all circles
- `AdminCircleCreateForm.tsx` — form for new circle from interest(s)
- `AdminCircleDetail.tsx` — admin view of a single circle
- `AdminCircleMembersManager.tsx` — add/remove/update members
- `AdminCircleDocumentEditor.tsx` — status updates for docs
- `AdminCircleMilestoneEditor.tsx` — drag-to-reorder, status updates
- `AdminCircleSiteVisitForm.tsx` — schedule / update site visits
- `AdminCircleTasksList.tsx` — kanban-style task board for the circle

**Library files (`app/lib/co-buy/circles/`):**
- `types.ts` — TypeScript types for circle, member, document, milestone, etc.
- `state-document-templates.ts` — for each Indian state, the default doc list to seed when a circle is created
- `milestone-templates.ts` — default milestone sequence to seed a new circle
- `privacy.ts` — function to compute displayed name based on `identity_visibility`
- `circle-actions.ts` — server actions (create circle, add member, update milestone, RSVP, etc.)

---

## 6. UX flow

**Lead → Member conversion:**

1. Admin on `/admin/co-buy/leads` opens a `qualified` lead's drawer
2. Clicks "Add to Circle" → modal lists circles in `status='forming'` for the same opportunity, plus "Create new circle"
3. Selects existing circle OR creates new (form prefilled from lead data)
4. On confirm: server action creates `co_buy_circle_members` row, updates `co_buy_interests.status='added_to_circle'`, sends WhatsApp template (admin gets a "send WA" deeplink), creates a circle event

**Member's first login after being added:**

1. Member receives WhatsApp from admin: "You've been added to a buying circle. Sign in to see details: acrehub.com/login"
2. Member signs in (existing Supabase Auth)
3. Header shows "My Buying Circles" badge with count
4. Lands on `/co-buy/circles` → sees list (just one in MVP)
5. Clicks circle → `/co-buy/circles/[id]` → sees overview, members (masked names), milestones, no documents yet, no site visit yet
6. Status badge says "Forming". A banner reads: "We're confirming participants. AcrehubIndia will contact you before the next milestone."

**Site visit flow (members):**

1. Admin schedules site visit via `/admin/co-buy/circles/[id]/site-visits` (date, meeting point, duration)
2. System creates `co_buy_site_visits` + corresponding event ("Site visit scheduled for...") + WhatsApp template for admin to send
3. Members log in → see `CircleSiteVisitCard` with "RSVP" button
4. Member clicks RSVP → form (attending / not attending / maybe + attendees_count)
5. Submit → upserts `co_buy_site_visit_rsvps` + event "Member confirmed attendance"
6. Admin sees aggregate RSVP count on `/admin/co-buy/circles/[id]/site-visits`
7. Post-visit: admin posts summary + uploads photos → visible to members on `CircleSiteVisitCard`

**Document tracking flow (admin):**

1. When a circle is created, the system auto-seeds `co_buy_documents` rows for that state (using `state-document-templates.ts`)
2. Each doc row starts with `status='pending'`
3. Admin updates status as documents come in (via `/admin/co-buy/circles/[id]/documents`)
4. Each status change creates an event
5. Member-facing view shows simplified status: ✅ Received / 🔍 In Review / ⚠️ Flagged / ⏳ Pending / N/A Not Required
6. `admin_notes` are admin-only; `buyer_visible_note` shows to members

---

## 7. Admin workflow (Phase 2)

The admin's daily routine in Phase 2:

1. **Morning:** `/admin/co-buy` dashboard shows: forming circles (need members), site visits this week (need RSVPs followed up), document checklists with overdue items, open tasks across circles
2. **For each forming circle:** review qualified leads, add members, update WhatsApp group link, post announcement event
3. **For each circle in legal_review:** check document statuses, follow up on pending ones, update lawyer_status
4. **Before site visits:** confirm meeting point, RSVPs received, send WhatsApp reminders, assign field coordinator
5. **After site visits:** post summary + upload photos to circle, advance milestone if applicable
6. **Task queue:** mark tasks done, assign new tasks for follow-ups

The admin views are designed for **one admin user managing 5-15 circles simultaneously**. Multi-admin team assignment is Phase 4.

---

## 8. Risks and assumptions

**Risks:**

1. **Member privacy expectations vs. group dynamics** — co-buyers want to know who they're buying with, but Indian privacy norms vary widely. *Mitigation:* default `identity_visibility='first_name_city'`. Members can opt-up to `full_name` from their settings. Phone numbers never auto-visible; the WhatsApp group itself becomes the contact channel.
2. **Inter-circle data leakage via mis-coded queries** — biggest risk in this phase. *Mitigation:* the `is_circle_member()` helper is used in every RLS policy; every server action validates membership before reading/writing. Add an explicit test for "can member of circle A read circle B's data" in the testing checklist.
3. **Document status drift from reality** — admin updates document status but documents themselves live in Google Drive / lawyer's office. *Mitigation:* status is admin-asserted; treat it as "best-known status", not legal record. The actual legal record is the lawyer's file. Phase 4 can add document file upload + verification.
4. **WhatsApp group becomes the source of truth** — members may use the WA group instead of the site. *Mitigation:* this is actually desirable for chat; the site is for *structured* data (status, milestones, documents). Don't try to replace WhatsApp. The `whatsapp_group_link` field is intentional.
5. **Stale circles** — circles formed but never advance past `forming`. *Mitigation:* admin dashboard surfaces "circles with no activity in 30 days" for cleanup.

**Assumptions:**
- Phase 1 is shipped and producing qualified leads
- The `is_admin()` function from earlier phases works correctly
- Existing Supabase Storage bucket can be used for site visit photos (admin upload only)
- AcrehubIndia team has 1-3 people who can be onboarded as admin users; full multi-role is Phase 4

---

## 9. Files likely to change

**Modify:**
- `app/admin/co-buy/leads/page.tsx` + lead drawer — add "Add to Circle" action
- `app/co-buy/[slug]/page.tsx` — show "View your circle" if member
- Header / navigation — conditional "My Buying Circles" item when user has memberships
- `app/admin/page.tsx` — extend Buying Circles dashboard card with circle counts

**Create:**
- All routes in section 3
- All components in section 5
- All library files in section 5
- `supabase-co-buy-phase-2.sql` — migration from section 2

**Don't touch:**
- Phase 1 opportunity creation / interest capture (working as-is)
- Legal Navigator (link out, don't duplicate)
- Anything outside `app/co-buy/circles/*`, `app/admin/co-buy/circles/*`, `app/components/co-buy/circles/*`, `app/lib/co-buy/circles/*`

---

## 10. Testing checklist

**Manual QA:**

1. **Creation:** admin promotes a qualified lead to a new circle. Confirm:
   - Circle is created with sensible defaults
   - Lead status updates to `added_to_circle`
   - Member row created
   - Default milestones seeded
   - Default state-specific documents seeded
   - Event log shows the creation
2. **Member access:** sign in as the added member. Confirm:
   - "My Buying Circles" appears in nav
   - `/co-buy/circles/[id]` renders for their circle
   - `/co-buy/circles/[other-id]` returns 404 (or "not authorized")
   - Member names display per `identity_visibility`
   - Phone numbers of other members NOT visible
3. **Cross-circle privacy:** add a second test circle with different members. As member of circle A, confirm no data from circle B leaks (API tests + UI tests)
4. **Site visit RSVP:** admin schedules a visit → member receives event → RSVPs → admin sees aggregated count
5. **Document workflow:** admin updates `co_buy_documents.status` to `received` → event created → member sees status change with `buyer_visible_note`
6. **Milestone update:** admin marks `lawyer_engaged` milestone as completed → event created → timeline reflects change → next milestone auto-activates
7. **Admin notes hidden:** admin sets `admin_notes` on a member, member, or document; verify member never sees it via API or UI
8. **Task queue:** admin creates a task, marks done, confirms it disappears from open list

**Smoke tests:**
```
GET /co-buy/circles                  (no auth)     → redirect to login
GET /co-buy/circles                  (auth, no membership)  → empty state
GET /co-buy/circles/[id]             (auth, member)         → 200
GET /co-buy/circles/[other-id]       (auth, NOT member)     → 404
GET /admin/co-buy/circles            (admin)                → 200
```

---

## 11. Claude Code build prompts

### Prompt 1 — Schema + lib files

```
Read CLAUDE.md, docs/buying-circles-phase-2-spec.md, and docs/project-tracker.md.

Output supabase-co-buy-phase-2.sql per spec section 2 (8 tables + RLS + is_circle_member function). Ready to paste; don't apply.

Then implement library files:
1. app/lib/co-buy/circles/types.ts
2. app/lib/co-buy/circles/state-document-templates.ts (default doc list per state: KA, TN, MH, KL, AP)
3. app/lib/co-buy/circles/milestone-templates.ts (default milestone sequence: 10 milestones from group_forming to registration_complete)
4. app/lib/co-buy/circles/privacy.ts (displayName function based on identity_visibility)

Show me a plan first.
```

### Prompt 2 — Lead-to-circle workflow + admin circle list

```
I've applied the migration.

Build:
1. Extend the existing /admin/co-buy/leads drawer to add an "Add to Circle" action. Modal shows existing forming circles for the opportunity + "Create new circle" option.
2. app/admin/co-buy/circles/page.tsx — table of all circles, filter by status, link to detail
3. app/admin/co-buy/circles/new/page.tsx — create circle form. Pre-fills from query params (opportunity_id, interest_id). On submit: creates circle, auto-seeds milestones, auto-seeds state-specific documents, creates initial member row, creates circle_created event.
4. app/admin/co-buy/circles/[id]/page.tsx — admin view of circle with all sub-sections inline
5. Server actions in app/lib/co-buy/circles/circle-actions.ts

Don't build member-facing pages yet.
```

### Prompt 3 — Member-facing circle dashboard

```
Build the member-side experience:
1. app/co-buy/circles/page.tsx — list of user's active circles (using is_circle_member helper)
2. app/co-buy/circles/[id]/page.tsx — circle dashboard (server component, auth-gated)
3. Components from spec section 5 (public/member group)
4. Header navigation: conditional "My Buying Circles" item when user has at least one active membership
5. On /co-buy/[slug]: if logged-in user is already a member, swap "Express Interest" CTA for "View your circle" link

Privacy is critical: members see masked or first-name-city by default; never expose phone numbers via API.
```

### Prompt 4 — Documents, milestones, site visits, RSVPs

```
Build the operational sub-pages:
1. /co-buy/circles/[id]/documents (member) + /admin/co-buy/circles/[id]/documents (admin editor)
2. /co-buy/circles/[id]/timeline (member) + /admin/co-buy/circles/[id]/milestones (admin editor)
3. /co-buy/circles/[id]/site-visit (member with RSVP form) + /admin/co-buy/circles/[id]/site-visits (admin scheduling)
4. /co-buy/circles/[id]/costs (member, read-only) + cost editing inline in admin circle detail
5. /admin/co-buy/circles/[id]/tasks (admin only, kanban or list)
6. Each admin action creates appropriate event log entries

Site visit photo upload uses existing Supabase Storage bucket; admin uploads only.
```

### Prompt 5 — Admin dashboard updates + tests + docs

```
Final pass:
1. Extend /admin and /admin/co-buy dashboards with Phase 2 counts: active circles, this-week site visits, overdue documents, open tasks
2. Add smoke tests from spec section 10 to tests/smoke/
3. Run npm run build, fix any TypeScript errors
4. Update CLAUDE.md with Phase 2 architecture
5. Update docs/project-tracker.md to mark Phase 2 complete and reflect what's still deferred to Phase 3 (services + vendors)
6. Commit. DO NOT push to main — branch only.
```

---

## 12. The non-code work for Phase 2

Even with an operational team, these still need attention:

1. **Lawyer-reviewed default milestones.** The 10 default milestones in `milestone-templates.ts` represent the canonical path; ensure your lawyer agrees that "lawyer_engaged" before "legal_clear" is the right sequence for the states you operate in.
2. **State document templates** in `state-document-templates.ts` should be reviewed by the lawyer who covers each state. KA, TN are mature; MH, KL, AP can ship with placeholders that say "consult lawyer for state-specific docs" until properly seeded.
3. **WhatsApp group governance.** Document operationally who creates the WA group, who admin-controls it, what naming convention (e.g., "Acrehub-Kanakapura-Circle-1"), what the welcome message is. The software stores the link but doesn't dictate the policy.
4. **Identity verification policy.** When does a member transition from `first_name_city` to `full_name`? Probably after lawyer KYC for the eventual sale deed. Document this.
5. **Site visit liability.** If a member trips on the field walk, who's responsible? Discuss with insurance / lawyer; have members sign a basic indemnity acknowledgement (paper at site is fine for now).

---

*Companion to buying-circles-spec.md (Phase 1), buying-circles-phase-3-spec.md (Phase 3), buying-circles-phase-4-spec.md (Phase 4), buying-circles-phase-5-spec.md (Phase 5).*
