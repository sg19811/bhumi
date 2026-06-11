# Acrehub Buying Circles — Phase 4 Spec

> **Phase 4 builds on Phases 1-3.** Prerequisites: services workflow (Phase 3) has run end-to-end at least once, AcrehubIndia has 50+ leads in `co_buy_interests`, and the team has grown beyond a single admin user. This phase is about operational scaling — turning a working manual workflow into one that supports a 5-15 person team without losing coherence.
>
> **Effort estimate:** ~3 weeks of Claude Code work (12-15 build days).
>
> **What this phase is and isn't:** Phase 4 adds intelligence layers (lead scoring, dashboards), team coordination (multi-role assignment, task ownership), and convenience features (WhatsApp templates as data, member-initiated service requests). It does NOT add new core entities — no new circles, no new services. It enriches the working system.

---

## 1. Scope

**In scope:**

- **Lead scoring algorithm** — computed field on `co_buy_interests` based on the weighted criteria from the original prompt
- **Multi-role team assignment** — separate `sales_owner`, `build_owner`, `legal_revenue_owner` on circles and service requests
- **WhatsApp template library** — saved templates with variable interpolation, admin editable
- **Member-initiated service requests** — circle members (not just admin) can propose services
- **Founder Intelligence dashboards** for Buying Circles — corridor demand, conversion funnel, service revenue, vendor performance
- **Build-task visualization** — kanban / Gantt-style view of all in-progress work across circles
- **User roles** within AcrehubIndia — admin, sales_member, build_member, viewer
- **Audit log** — who-did-what for sensitive admin actions

**Deferred to Phase 5:**
- Post-purchase governance, voting, maintenance subscriptions
- Member-to-member messaging
- Public vendor directory

**Out of scope (intentionally not built):**
- AI-generated lead qualifications or recommendations (data is too sparse to be useful)
- Automated WhatsApp sending (compliance + spam-trap risk; keep human-in-the-loop)
- Payment gateway integration (still no money flow in software)

---

## 2. Data model (Phase 4)

```sql
-- 1. User roles table (within AcrehubIndia team)
-- Note: existing 'profiles' table has a 'role' column ('user'|'agent'|'admin')
-- Phase 4 extends this with a subordinate roles table for finer-grained team roles
create table if not exists acrehub_team_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_role text not null,
    -- 'sales_member' | 'build_member' | 'legal_revenue_member' | 'finance_member' | 'viewer'
  active boolean default true,
  granted_by uuid references auth.users(id),
  granted_at timestamptz default now(),
  notes text,
  created_at timestamptz default now()
);
create index if not exists team_roles_user_idx on acrehub_team_roles(user_id);
create index if not exists team_roles_role_idx on acrehub_team_roles(team_role);
create unique index if not exists team_roles_user_role_uniq on acrehub_team_roles(user_id, team_role);

-- 2. Extend co_buy_circles with multi-role ownership
alter table co_buy_circles add column if not exists build_owner_id uuid references auth.users(id);
alter table co_buy_circles add column if not exists legal_revenue_owner_id uuid references auth.users(id);
-- internal_sales_owner already exists from Phase 2

-- 3. Extend co_buy_service_requests with multi-role ownership
alter table co_buy_service_requests add column if not exists assigned_sales_owner_id uuid references auth.users(id);
alter table co_buy_service_requests add column if not exists assigned_build_owner_id uuid references auth.users(id);
alter table co_buy_service_requests add column if not exists assigned_legal_revenue_owner_id uuid references auth.users(id);
-- existing assigned_owner_id stays as a backward-compatible "primary" owner; new fields are role-specific

-- 4. Lead scoring (computed and stored for query performance)
alter table co_buy_interests add column if not exists lead_score integer;
alter table co_buy_interests add column if not exists lead_score_label text;  -- 'hot' | 'warm' | 'needs_qualification' | 'legal_review_first' | 'low_intent'
alter table co_buy_interests add column if not exists lead_score_updated_at timestamptz;
alter table co_buy_interests add column if not exists lead_score_breakdown jsonb default '{}';  -- per-factor contribution for transparency

-- 5. WhatsApp template library
create table if not exists acrehub_message_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text unique not null,
    -- 'co_buy_interest_acknowledgement' | 'site_visit_invitation' | 'legal_review_reminder'
    -- | 'service_estimate_message' | 'circle_welcome' | 'document_request' | 'milestone_update'
    -- | 'follow_up_after_call' | 'thank_you_for_attending' | 'custom_X'
  channel text not null default 'whatsapp',                  -- 'whatsapp' | 'email' | 'sms' | 'internal_note'
  language text default 'en',                                -- 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml'
  display_name text not null,
  body text not null,                                        -- template with {{variables}}
  variables jsonb default '[]',                              -- list of supported variable names with descriptions
  active boolean default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists templates_active_idx on acrehub_message_templates(active);
create index if not exists templates_language_idx on acrehub_message_templates(language);

-- 6. Member-initiated service requests (track separately for analytics)
alter table co_buy_service_requests add column if not exists initiator_type text default 'admin';
  -- 'admin' | 'member' | 'lawyer' | 'auto'
alter table co_buy_service_requests add column if not exists requesting_member_id uuid references co_buy_circle_members(id);

-- 7. Audit log for sensitive actions
create table if not exists acrehub_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  actor_role text,                                           -- snapshot of role at time of action
  entity_type text not null,                                 -- 'circle' | 'service_request' | 'interest' | 'vendor' | 'opportunity' | 'member' | 'role'
  entity_id uuid,
  action text not null,                                      -- 'created' | 'updated' | 'deleted' | 'approved' | 'role_changed' | 'access_granted'
  before_state jsonb,
  after_state jsonb,
  ip_address inet,
  user_agent text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists audit_actor_idx on acrehub_audit_log(actor_user_id);
create index if not exists audit_entity_idx on acrehub_audit_log(entity_type, entity_id);
create index if not exists audit_created_idx on acrehub_audit_log(created_at desc);

-- 8. Founder Intelligence views (materialized for performance)
-- Implementation note: use database views or materialized views; can also be computed on-demand in Phase 4 and migrated to materialized in Phase 5+
create or replace view view_co_buy_corridor_demand as
  select
    o.corridor,
    o.state,
    count(distinct i.id) as interest_count,
    avg(i.budget_max) as avg_budget,
    count(distinct case when i.status = 'qualified' then i.id end) as qualified_count,
    count(distinct c.id) as circle_count,
    count(distinct case when c.status = 'completed' then c.id end) as completed_circles
  from co_buy_opportunities o
  left join co_buy_interests i on i.opportunity_id = o.id
  left join co_buy_circles c on c.opportunity_id = o.id
  where o.status != 'draft'
  group by o.corridor, o.state;

create or replace view view_co_buy_funnel as
  select
    count(*) filter (where status = 'new') as new_count,
    count(*) filter (where status in ('contacted', 'call_pending')) as contacted_count,
    count(*) filter (where status = 'qualified') as qualified_count,
    count(*) filter (where status = 'nri_legal_review') as nri_review_count,
    count(*) filter (where status = 'added_to_circle') as in_circle_count,
    count(*) filter (where status = 'dropped') as dropped_count
  from co_buy_interests
  where created_at >= now() - interval '90 days';

create or replace view view_co_buy_service_revenue as
  select
    date_trunc('month', completed_at) as month,
    service_category,
    count(*) as completed_requests,
    sum(acrehub_service_fee) as total_acrehub_fees,
    sum(vendor_cost_estimate) as total_vendor_costs,
    sum(estimated_total_cost) as total_volume
  from co_buy_service_requests
  where status = 'completed' and completed_at is not null
  group by 1, 2
  order by 1 desc;

create or replace view view_co_buy_vendor_performance as
  select
    v.id, v.vendor_name, v.vendor_category,
    count(distinct q.service_request_id) as quotes_provided,
    count(distinct q.service_request_id) filter (where q.selected) as quotes_selected,
    count(distinct sr.id) filter (where sr.status = 'completed') as services_completed
  from acrehub_vendors v
  left join co_buy_service_vendor_quotes q on q.vendor_id = v.id
  left join co_buy_service_requests sr on sr.id = q.service_request_id
  where v.active = true
  group by v.id, v.vendor_name, v.vendor_category;

-- RLS
alter table acrehub_team_roles enable row level security;
alter table acrehub_message_templates enable row level security;
alter table acrehub_audit_log enable row level security;

-- Team roles: admin can read/write all; users can read their own
create policy "admin all team roles" on acrehub_team_roles for all to authenticated
  using (is_admin()) with check (is_admin());
create policy "users read own roles" on acrehub_team_roles for select to authenticated
  using (user_id = auth.uid());

-- Templates: any team member can read; admin can write
create policy "team reads templates" on acrehub_message_templates for select to authenticated
  using (
    is_admin() or exists (
      select 1 from acrehub_team_roles
      where user_id = auth.uid() and active = true
    )
  );
create policy "admin writes templates" on acrehub_message_templates for all to authenticated
  using (is_admin()) with check (is_admin());

-- Audit log: admin reads all; no one writes directly (triggers populate it)
create policy "admin reads audit" on acrehub_audit_log for select to authenticated
  using (is_admin());

-- Helper: is the user any kind of AcrehubIndia team member?
create or replace function is_team_member()
returns boolean language sql security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from acrehub_team_roles
    where user_id = auth.uid() and active = true
  );
$$;

-- Helper: is the user a specific team role?
create or replace function has_team_role(p_role text)
returns boolean language sql security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from acrehub_team_roles
    where user_id = auth.uid() and team_role = p_role and active = true
  );
$$;
```

**Important note about lead_score:** it's *stored*, not *computed on-the-fly*. The reason: scoring runs server-side (in a server action) whenever an interest is created or updated, and the result is persisted. This makes the table queryable by score (e.g., "show all hot leads") without recomputing on every request. The `lead_score_breakdown` jsonb lets the admin UI explain *why* a lead got its score, which is critical for trust.

---

## 3. Lead scoring algorithm

Implementation in `app/lib/co-buy/lead-scoring.ts` as a pure function. Per the original prompt:

```typescript
export function computeLeadScore(interest: CoBuyInterest, opportunity: CoBuyOpportunity): LeadScoreResult {
  let score = 50;  // baseline
  const factors: Array<{key: string, delta: number, reason: string}> = [];
  const note = (delta: number, key: string, reason: string) => {
    score += delta;
    factors.push({key, delta, reason});
  };

  // Positive factors
  if ((interest.budget_max ?? 0) >= (opportunity.min_contribution ?? 0))
    note(+20, 'budget_meets_min', 'Budget meets or exceeds minimum contribution');
  if (interest.timeline === 'immediate' || interest.timeline === '1_month')
    note(+15, 'timeline_short', 'Buyer plans to act within 1 month');
  else if (interest.timeline === '3_months')
    note(+10, 'timeline_medium', 'Buyer plans to act within 3 months');
  if (interest.phone) note(+10, 'phone_provided', 'Phone number provided');
  if (interest.whatsapp) note(+5, 'whatsapp_provided', 'WhatsApp number provided');
  if (interest.desired_share_label && interest.desired_share_label !== 'not_sure')
    note(+10, 'specific_share', 'Specific desired share / acreage');
  if (interest.site_visit_interest) note(+10, 'site_visit_yes', 'Interested in site visit');
  if (interest.buyer_type === 'indian_resident') note(+10, 'resident_buyer', 'Indian resident — agricultural land eligible');
  if (interest.coownership_comfort === 'undivided_ok' || interest.coownership_comfort === 'demarcated_portion')
    note(+10, 'coownership_comfort', 'Comfortable with co-ownership structure');
  if (interest.coownership_comfort === 'lawyer_review_first')
    note(+5, 'wants_lawyer', 'Open to lawyer review');
  if ((interest.service_interests?.length ?? 0) > 0)
    note(+5, 'service_interest', 'Expressed interest in AcrehubIndia services');

  // Negative flags
  if (interest.buyer_type === 'nri_oci') {
    note(-30, 'nri_oci', 'NRI/OCI buyer — legal review required for agricultural land');
  }
  if (interest.timeline === 'exploring')
    note(-20, 'exploratory_only', 'Buyer is in exploration mode only');
  if ((interest.budget_max ?? 0) < (opportunity.min_contribution ?? 0) * 0.7)
    note(-15, 'budget_below_min', 'Budget significantly below minimum contribution');
  if (!interest.phone) note(-15, 'no_phone', 'No phone number — limited contactability');
  if (!interest.preferred_call_time) note(-5, 'no_call_time', 'No preferred call time');
  // Free-text flags (heuristic): if notes contain 'guaranteed' or 'assured', penalize
  const noteText = (interest.notes ?? '').toLowerCase();
  if (noteText.includes('guarantee') || noteText.includes('assured return'))
    note(-10, 'unrealistic_expectations', 'Buyer notes suggest unrealistic expectations');

  score = Math.max(0, Math.min(100, score));

  let label: LeadScoreLabel;
  if (interest.buyer_type === 'nri_oci') label = 'legal_review_first';
  else if (score >= 80) label = 'hot';
  else if (score >= 60) label = 'warm';
  else if (score >= 40) label = 'needs_qualification';
  else label = 'low_intent';

  return { score, label, factors };
}
```

**Tuning principles:**
- Initial weights are from the prompt; treat them as defaults
- Run the algorithm against existing 50+ qualified leads from Phase 1, sanity-check the labels — does "hot" actually correlate with the leads you converted? Adjust weights if not.
- Score is a *helper*, not a verdict. Admin always reviews actual lead data, regardless of score.

---

## 4. Route structure (Phase 4)

```
NEW ADMIN ROUTES:
  /admin/team                          → user role management
  /admin/team/[userId]                  → edit team member roles
  /admin/co-buy/intelligence            → Founder Intelligence dashboards
  /admin/co-buy/intelligence/corridors  → corridor demand view
  /admin/co-buy/intelligence/funnel     → conversion funnel
  /admin/co-buy/intelligence/services   → service revenue dashboard
  /admin/co-buy/intelligence/vendors    → vendor performance
  /admin/co-buy/intelligence/build      → build-tasks visualization
  /admin/templates                      → message template library
  /admin/templates/new                  → create template
  /admin/templates/[id]                 → edit template
  /admin/audit                          → audit log viewer

NEW MEMBER ROUTES:
  /co-buy/circles/[id]/services/request → member-initiated service request form
```

---

## 5. Integration with existing site

**1. Lead scoring on existing admin lead views.** The `/admin/co-buy/leads` page (Phase 1) now shows score column + label badge. Default sort: by `lead_score DESC`. Filter chips: Hot / Warm / Needs Qualification / Legal Review First / Low Intent.

**2. Multi-role assignment everywhere.** Existing circle and service request admin forms get three owner fields (sales / build / legal_revenue) instead of one. Backward compatibility: existing `assigned_owner_id` and `internal_sales_owner` remain populated; new fields are optional.

**3. WhatsApp template integration.** Existing "Open WhatsApp" deep links (in lead drawer, member contact actions, etc.) now show a "Use template" dropdown. Selecting a template populates the WhatsApp URL with `?text=` containing the interpolated body.

**4. Member-initiated service requests.** `/co-buy/circles/[id]/services` (Phase 3) adds a "Request a service" CTA for members. Routes to `/co-buy/circles/[id]/services/request` with a simplified form. On submit: creates `co_buy_service_requests` with `initiator_type='member'`, `status='requested'`, `requesting_member_id` set. Admin gets a notification (event).

**5. Founder Intelligence integration with existing /admin/intelligence.** The existing intelligence dashboard gets a "Buying Circles" tab with the new views.

**6. Audit log triggers.** Database triggers on `co_buy_*` tables write to `acrehub_audit_log` for sensitive actions: status changes, member adds/removes, service approval, role changes, opportunity publication.

---

## 6. Component plan (Phase 4)

**New components:**

Admin:
- `AdminTeamRoleEditor.tsx` — assign/revoke team roles
- `AdminLeadScoreBadge.tsx` — color-coded label
- `AdminLeadScoreBreakdown.tsx` — expandable explanation of why a lead got its score
- `AdminMultiOwnerSelect.tsx` — three-way selector (sales / build / legal_revenue)
- `AdminTemplateLibrary.tsx` — template list
- `AdminTemplateEditor.tsx` — template editor with variable picker
- `AdminTemplateUsePicker.tsx` — popover used inside lead drawers / circles
- `AdminCorridorDemandView.tsx` — chart + table
- `AdminFunnelView.tsx` — funnel visualization
- `AdminServiceRevenueView.tsx` — monthly service revenue
- `AdminVendorPerformanceView.tsx` — vendor rankings
- `AdminBuildTasksKanban.tsx` — kanban of all service tasks across circles
- `AdminAuditLogTable.tsx` — chronological audit log

Member:
- `MemberServiceRequestForm.tsx` — simplified request submission

**Library files:**
- `app/lib/co-buy/lead-scoring.ts` — algorithm + types
- `app/lib/co-buy/templates.ts` — template interpolation
- `app/lib/co-buy/intelligence.ts` — query helpers for the views
- `app/lib/co-buy/audit.ts` — audit log helper

---

## 7. UX flow

**Team role onboarding:**

1. Admin in `/admin/team` clicks "Invite team member" → enter email + role
2. System creates auth user (or invites existing), creates `acrehub_team_roles` row
3. New member signs in → has access to relevant admin areas based on role
4. Admin can later revoke role; user retains login but loses team access

**Member-initiated service request:**

1. Member in `/co-buy/circles/[id]/services` sees "Request a service" CTA
2. Routes to simplified form: category + brief description + urgency
3. Submit → request created with `initiator_type='member'`, status `requested`
4. Admin sees in their queue, takes ownership, develops scope/quotes
5. From that point: same flow as admin-initiated (Phase 3)

**Lead scoring in action:**

1. New interest submitted (Phase 1) → server action recomputes score, persists
2. Admin opens `/admin/co-buy/leads` → table sorted by score, hot leads at top
3. Click lead → drawer shows score badge + "Why?" → breakdown explains factors
4. Admin can override score manually (sets `lead_score` directly + adds qualification_notes)

**Template usage:**

1. Admin in lead drawer clicks "Open WhatsApp" → popover "Use template?"
2. Selects "Co-Buy Interest Acknowledgement (en)"
3. Body interpolates `{{name}}`, `{{opportunity_title}}`, `{{location}}` from current lead/opportunity
4. WhatsApp URL opens with prefilled message
5. Admin sends manually (no automated sends — keeps human in loop, avoids spam-trap risk)

**Founder Intelligence:**

1. Admin in `/admin/co-buy/intelligence` sees tabs: Corridors / Funnel / Services / Vendors / Build
2. Corridors tab: bar chart of interest count per corridor + table with avg budget, qualified %, completed circles
3. Funnel tab: classic funnel visualization (new → contacted → qualified → in_circle → completed) with drop-off %
4. Services tab: monthly bar chart of revenue by service category
5. Vendors tab: ranked vendors by completed services, conversion rate
6. Build tab: kanban of all in-progress service tasks across all circles, filterable by team role

---

## 8. Risks and assumptions

**Risks:**

1. **Lead score becomes a vanity metric** — admins ignore everything but the score, missing important context. *Mitigation:* always show breakdown alongside score; never use score alone for status transitions; admin retains full override.
2. **Team role sprawl** — too many roles, unclear permissions. *Mitigation:* start with 5 roles; expand only when operationally needed.
3. **Template misuse** — sending the same template to every lead becomes spammy. *Mitigation:* template usage isn't automated; admin selects and reviews each send. Phase 4 deliberately doesn't add bulk-send.
4. **Materialized view staleness** — if views are materialized, refresh schedule matters. *Mitigation:* start with regular views (recomputed on each query); materialize only if performance demands.
5. **Audit log bloat** — every status change creates a row. *Mitigation:* archive entries older than 1 year to a separate cold-storage table.
6. **Member-initiated requests opening operational floodgates** — circle members request 20 services, admin overwhelmed. *Mitigation:* member form has a "this is a request, not a commitment" line; admin can mark requests as `under_review` without scoping them, batch-triage weekly.

**Assumptions:**
- Phases 1-3 are shipped and stable
- AcrehubIndia has 3+ team members ready to onboard (otherwise multi-role is theoretical)
- ~50+ qualified leads exist (otherwise scoring tuning is guesswork)
- The team has used WhatsApp templates manually long enough to know which copy works (otherwise the template library is full of theoretical templates)

---

## 9. Files likely to change

**Modify:**
- `app/admin/co-buy/leads/page.tsx` — score column + filter chips + sort
- Existing lead drawer — score breakdown + template picker
- Existing circle admin forms — multi-role owner select
- Existing service request admin forms — multi-role owner select
- `app/co-buy/circles/[id]/services/page.tsx` — "Request a service" CTA
- `app/admin/intelligence/page.tsx` (existing Founder Intelligence) — Buying Circles tab
- Various admin pages — wrap actions with audit log writes

**Create:**
- All routes in section 4
- All components in section 6
- Library files in section 6
- `supabase-co-buy-phase-4.sql` — migration from section 2

**Don't touch:**
- Phase 1-3 working code (extensions only)
- Public-facing marketplace surfaces

---

## 10. Testing checklist

**Manual QA:**

1. **Lead scoring:**
   - Submit a fresh interest with high-quality fields → score >= 80, label `hot`
   - Submit NRI/OCI interest → score regardless, label `legal_review_first`
   - Verify breakdown matches stored factors
2. **Team roles:**
   - Create user with `sales_member` role; cannot access `/admin/vendors` or audit log
   - Create user with `build_member` role; can see service tasks but not lead drawer
   - Create `viewer`; read-only across admin
3. **Multi-role assignment:**
   - Assign three different team members to sales/build/legal on a circle
   - Each sees the circle in their dashboard with their role highlighted
4. **Templates:**
   - Create template with variables; renders correctly with substituted data
   - Use from lead drawer; WhatsApp URL contains interpolated message
5. **Member-initiated request:**
   - Member submits → admin sees in queue with `initiator_type='member'` badge
   - Admin can take ownership and develop scope
6. **Intelligence views:**
   - Corridor view shows real data, no NaN/null crashes
   - Funnel adds up (new + contacted + qualified + ... = total)
   - Service revenue aggregates correctly
   - Vendor performance ranks by completed services
7. **Audit log:**
   - Change a circle status → log entry created with actor, before/after states
   - Non-admin cannot read audit log

**Smoke tests:**
```
GET /admin/team                          (admin)         → 200
GET /admin/team                          (sales_member)  → 403
GET /admin/co-buy/intelligence           (admin)         → 200
GET /admin/templates                     (team_member)   → 200
GET /admin/audit                         (admin)         → 200
POST /co-buy/circles/[id]/services/request (member)      → 201
```

---

## 11. Claude Code build prompts

### Prompt 1 — Schema + lead scoring algorithm + team roles

```
Read CLAUDE.md and docs/buying-circles-phase-4-spec.md (and earlier phase specs).

Output supabase-co-buy-phase-4.sql per spec section 2.

Then implement:
1. app/lib/co-buy/lead-scoring.ts (pure functions per spec section 3)
2. Server action that recomputes lead_score whenever co_buy_interests is created or updated (use a Supabase database function/trigger OR a server-side hook in the existing interest submission action — your call, document the choice)
3. app/lib/co-buy/templates.ts (interpolation: replace {{key}} with values; handle missing variables gracefully)
4. Seed file or migration extension to populate acrehub_message_templates with the 8 default templates from earlier Phase 1 prompt (the WhatsApp templates from docs/whatsapp-templates.md)

Show plan first.
```

### Prompt 2 — Multi-role team management

```
I've applied migration.

Build team-role management:
1. app/admin/team/page.tsx — list of team members with their roles
2. app/admin/team/[userId]/page.tsx — edit roles
3. AdminTeamRoleEditor component
4. Extend admin layout/header: show current user's roles
5. Helper hook useTeamRole() for client components to check role
6. Update RLS on existing tables to recognize new team roles where appropriate (e.g., sales_member can read leads even if not admin)

Then update existing circle admin forms and service request admin forms with AdminMultiOwnerSelect (three-way: sales / build / legal_revenue).
```

### Prompt 3 — Lead scoring UI + template library

```
Build the lead score UI:
1. AdminLeadScoreBadge + AdminLeadScoreBreakdown components
2. Update /admin/co-buy/leads with score column + filter chips + default sort
3. Lead drawer shows breakdown on expand
4. Admin can override score manually with a justification

Then build templates:
1. app/admin/templates/page.tsx
2. app/admin/templates/new/page.tsx + [id]/page.tsx (editor with variable picker)
3. AdminTemplateUsePicker — popover that integrates with existing "Open WhatsApp" buttons throughout admin

Test interpolation thoroughly.
```

### Prompt 4 — Founder Intelligence dashboards + member-initiated requests

```
Build the analytics views:
1. app/admin/co-buy/intelligence/page.tsx — tabs landing
2. Four sub-views: corridors, funnel, services, vendors (one component each)
3. Charts: use a lightweight library already in the codebase if any, otherwise simple HTML/CSS bars + tables (no new npm packages unless you confirm with me)
4. AdminBuildTasksKanban for /admin/co-buy/intelligence/build

Then member-initiated service requests:
1. app/co-buy/circles/[id]/services/request/page.tsx — simplified form
2. MemberServiceRequestForm component
3. Server action creates request with initiator_type='member', status='requested'
4. Existing /admin/co-buy/services queue surfaces these with an indicator badge
```

### Prompt 5 — Audit log + polish + tests

```
Final integration:
1. Audit log writers: add a helper function audit.record({entity_type, entity_id, action, before, after}) used in every admin server action that modifies a co_buy_* row
2. app/admin/audit/page.tsx — table viewer with filters (entity_type, actor, date range)
3. Trigger-based audit for low-effort consistency: where server actions might be bypassed, add Postgres triggers on critical tables (your call between server-side and DB-side; document trade-offs)
4. Smoke tests from spec section 10
5. Update CLAUDE.md + tracker
6. Run npm run build, fix errors, commit. Branch only.
```

---

## 12. The non-code work for Phase 4

1. **Train the team on roles and tools.** Phase 4 is when AcrehubIndia stops being one founder. Document responsibilities, escalation paths, and who-owns-what.
2. **Tune lead scoring with real data.** Run the algorithm against your 50+ existing leads; check the labels match your gut on which converted. Adjust weights — they're starting points, not gospel.
3. **Template content review.** The default 8 templates are direct from the original prompt. Polish them based on how the actual conversations have gone — what works, what doesn't.
4. **Audit log governance.** Decide retention period, who can read what historical period, how to handle data deletion requests under DPDP Act.
5. **Founder Intelligence interpretation.** The dashboards show data — they don't tell you what to do with it. Set up a weekly review meeting to look at funnel drop-offs, vendor performance, corridor patterns and decide on actions.

---

*Companion to buying-circles-spec.md (Phase 1), buying-circles-phase-2-spec.md (Phase 2), buying-circles-phase-3-spec.md (Phase 3), buying-circles-phase-5-spec.md (Phase 5).*
