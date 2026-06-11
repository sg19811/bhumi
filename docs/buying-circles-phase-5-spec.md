# Acrehub Buying Circles — Phase 5 Spec

> **Phase 5 builds on Phases 1-4.** Prerequisites: at least one buying circle has completed a purchase, members are now co-owners, AcrehubIndia is providing ongoing maintenance coordination for at least one circle, and you've operated post-purchase governance manually for 3+ months for at least one circle. This phase converts that manual practice into software for circles 2-N.
>
> **Effort estimate:** ~4-5 weeks of Claude Code work (20-25 build days).
>
> **What this phase is and isn't:** Phase 5 handles the long tail — the ongoing relationship after a buying circle has completed registration. Members are now legal co-owners; the software shifts from "facilitating a purchase" to "supporting joint stewardship." This includes recurring maintenance, shared expense tracking, governance decisions, exit/resale handling, and annual review prompts.
>
> Phase 5 is the **most operationally sensitive phase** because co-owners now have real money in real land. Mistakes here aren't "we lost a lead" — they're "two members are now in a dispute about ₹50,000 of maintenance reserve." Get the legal scaffolding right.

---

## 1. Scope

**In scope:**

- Transition flow: a Phase 2 circle reaches `status='completed'` (registration done) → upgrades to "post-purchase" state
- Recurring maintenance fee tracking (annual or monthly; no payment, just records)
- Shared expense tracker (admin or member-entered expenses, allocated by share)
- Governance proposals + voting (e.g., "should we hire a new caretaker?")
- Exit/resale interest registration (a member wants to leave; the software tracks intent, not the legal exit)
- Annual review prompts + summary documents
- Per-circle financial summary (year-end view)
- Member usage zone tracking (if applicable — for circles with internal demarcation)
- Maintenance subscription model (AcrehubIndia provides ongoing coordination for a fee)

**Deferred indefinitely (or to a Phase 6+ if ever):**
- Online payment / escrow
- Automated dispute resolution
- Resale marketplace (different product entirely)
- Property tax filing automation
- Insurance product offerings

**Never in scope:**
- Anything that resembles a securities exit, fractional unit trading, or pooled investment redemption
- Member-to-member money transfers via the platform
- Automated voting enforcement (votes are advisory inputs to admin decisions; legal authority remains with the actual co-ownership agreement)

---

## 2. Data model (Phase 5)

```sql
-- 1. Mark circles as post-purchase
alter table co_buy_circles add column if not exists post_purchase_at timestamptz;
alter table co_buy_circles add column if not exists registration_date date;
alter table co_buy_circles add column if not exists sale_deed_doc_url text;       -- admin-uploaded
alter table co_buy_circles add column if not exists final_purchase_amount bigint; -- actual amount registered
alter table co_buy_circles add column if not exists maintenance_subscription_status text default 'not_subscribed';
  -- 'not_subscribed' | 'active' | 'paused' | 'cancelled'
alter table co_buy_circles add column if not exists maintenance_fee_monthly bigint;
alter table co_buy_circles add column if not exists land_use_pattern text;
  -- 'undivided' | 'demarcated_zones' | 'partitioned' | 'mixed'

-- 2. Expense tracking
create table if not exists co_buy_expenses (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  category text not null,
    -- 'maintenance' | 'caretaker' | 'security' | 'water' | 'electricity' | 'farming'
    -- | 'fencing_repair' | 'civil_repair' | 'plantation' | 'tax' | 'legal' | 'insurance'
    -- | 'common_amenity' | 'professional_fee' | 'other'
  title text not null,
  description text,
  amount bigint not null,                                    -- expense amount in rupees
  expense_date date not null,
  paid_by text,                                              -- 'circle_pool' | 'individual_member' | 'acrehub' | 'pending'
  paid_by_member_id uuid references co_buy_circle_members(id), -- if individual member
  receipt_url text,
  allocation_method text default 'equal',                    -- 'equal' | 'by_share' | 'specific_members' | 'custom'
  allocation_details jsonb default '{}',                     -- if specific or custom
  status text default 'recorded',                            -- 'pending_approval' | 'recorded' | 'disputed' | 'reimbursed'
  internal_notes text,
  recorded_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists expenses_circle_idx on co_buy_expenses(circle_id);
create index if not exists expenses_date_idx on co_buy_expenses(expense_date desc);
create index if not exists expenses_category_idx on co_buy_expenses(category);

-- 3. Member contribution / dues tracking (a running ledger per member per year)
create table if not exists co_buy_member_dues (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  member_id uuid not null references co_buy_circle_members(id) on delete cascade,
  fiscal_year integer not null,                              -- e.g., 2026 for FY2026-27
  total_allocated bigint default 0,                          -- sum of expenses allocated to this member
  total_paid bigint default 0,                               -- sum of payments made
  balance bigint generated always as (total_allocated - total_paid) stored,
  status text default 'current',                             -- 'current' | 'overdue' | 'cleared' | 'in_dispute'
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
create unique index if not exists dues_circle_member_year_uniq on co_buy_member_dues(circle_id, member_id, fiscal_year);

-- 4. Governance proposals (advisory votes — no legal enforcement)
create table if not exists co_buy_proposals (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  title text not null,
  description text not null,
  proposal_type text default 'general',
    -- 'general' | 'expense_approval' | 'vendor_selection' | 'land_use_change'
    -- | 'maintenance_decision' | 'member_change' | 'annual_review'
  options jsonb not null,                                    -- [{key:'yes',label:'Yes'},{key:'no',label:'No'},{key:'abstain',label:'Abstain'}]
  threshold_required text default 'simple_majority',         -- 'simple_majority' | 'supermajority_67' | 'unanimous' | 'admin_decision'
  voting_starts_at timestamptz default now(),
  voting_ends_at timestamptz,
  status text default 'open',                                -- 'draft' | 'open' | 'closed' | 'cancelled'
  outcome text,                                              -- which option won; 'inconclusive' if quorum not met
  outcome_summary text,                                      -- admin-written summary
  decision_notes text,                                       -- what admin/circle actually decided to do
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  closed_at timestamptz
);
create index if not exists proposals_circle_idx on co_buy_proposals(circle_id);
create index if not exists proposals_status_idx on co_buy_proposals(status);

-- 5. Votes (one per member per proposal)
create table if not exists co_buy_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references co_buy_proposals(id) on delete cascade,
  member_id uuid not null references co_buy_circle_members(id) on delete cascade,
  vote_value text not null,                                  -- one of the option keys from proposals.options
  comment text,
  created_at timestamptz default now()
);
create unique index if not exists votes_proposal_member_uniq on co_buy_votes(proposal_id, member_id);

-- 6. Exit/resale interest
create table if not exists co_buy_exit_interests (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  member_id uuid not null references co_buy_circle_members(id) on delete cascade,
  exit_type text not null,                                   -- 'sell_to_existing_member' | 'sell_to_new_buyer' | 'partition_request' | 'gift_transfer' | 'inheritance'
  expected_price bigint,
  preferred_timeline text,                                   -- 'immediate' | '3_months' | '6_months' | '1_year' | 'flexible'
  reason text,
  status text default 'registered',                          -- 'registered' | 'lawyer_engaged' | 'buyer_identified' | 'in_negotiation' | 'completed' | 'withdrawn'
  internal_notes text,
  buyer_visible_summary text,
  registered_at timestamptz default now(),
  resolved_at timestamptz,
  resolution_notes text
);
create index if not exists exit_circle_idx on co_buy_exit_interests(circle_id);
create index if not exists exit_member_idx on co_buy_exit_interests(member_id);
create index if not exists exit_status_idx on co_buy_exit_interests(status);

-- 7. Annual reviews
create table if not exists co_buy_annual_reviews (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  fiscal_year integer not null,
  summary text,                                              -- admin-written annual summary
  highlights jsonb default '[]',                             -- array of highlight strings
  financial_summary jsonb default '{}',                      -- {total_expenses, by_category, member_balances}
  attendees text[] default '{}',                             -- members who attended
  meeting_date date,
  meeting_minutes text,
  next_year_plan text,
  document_url text,                                         -- formal review document
  status text default 'draft',                               -- 'draft' | 'published' | 'archived'
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists annual_reviews_circle_year_uniq on co_buy_annual_reviews(circle_id, fiscal_year);

-- 8. Land usage zones (for circles with demarcated zones)
create table if not exists co_buy_usage_zones (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  zone_label text not null,                                  -- 'Zone A-1' or member-chosen name
  assigned_member_id uuid references co_buy_circle_members(id),
  area_value numeric,
  area_unit text,                                            -- 'acre' | 'guntha' | 'cent' | 'sqft'
  description text,
  boundary_notes text,                                       -- text describing the zone boundaries
  current_use text,                                          -- 'farming' | 'farmhouse' | 'plantation' | 'unused' | 'common'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists zones_circle_idx on co_buy_usage_zones(circle_id);
create index if not exists zones_member_idx on co_buy_usage_zones(assigned_member_id);

-- RLS
alter table co_buy_expenses enable row level security;
alter table co_buy_member_dues enable row level security;
alter table co_buy_proposals enable row level security;
alter table co_buy_votes enable row level security;
alter table co_buy_exit_interests enable row level security;
alter table co_buy_annual_reviews enable row level security;
alter table co_buy_usage_zones enable row level security;

-- Expenses: circle members can read; only admin can insert/edit (Phase 6 may allow member-entered with admin approval)
create policy "members read expenses" on co_buy_expenses for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all expenses" on co_buy_expenses for all to authenticated
  using (is_admin()) with check (is_admin());

-- Dues: members read their own, plus aggregate of others
create policy "members read circle dues" on co_buy_member_dues for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all dues" on co_buy_member_dues for all to authenticated
  using (is_admin()) with check (is_admin());

-- Proposals: members read; admin writes
create policy "members read proposals" on co_buy_proposals for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all proposals" on co_buy_proposals for all to authenticated
  using (is_admin()) with check (is_admin());

-- Votes: members can read all votes in their circle, write their own
create policy "members read circle votes" on co_buy_votes for select to authenticated
  using (exists (
    select 1 from co_buy_proposals p where p.id = proposal_id and is_circle_member(p.circle_id)
  ));
create policy "members write own vote" on co_buy_votes for insert to authenticated
  with check (exists (
    select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()
  ));
create policy "members update own vote" on co_buy_votes for update to authenticated
  using (exists (
    select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()
  ));
create policy "admin all votes" on co_buy_votes for all to authenticated
  using (is_admin()) with check (is_admin());

-- Exit interests: members read their own, admin sees all
create policy "members read own exit" on co_buy_exit_interests for select to authenticated
  using (exists (
    select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()
  ));
create policy "members register own exit" on co_buy_exit_interests for insert to authenticated
  with check (exists (
    select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()
  ));
create policy "admin all exits" on co_buy_exit_interests for all to authenticated
  using (is_admin()) with check (is_admin());

-- Annual reviews: published reviews visible to members; drafts admin-only
create policy "members read published reviews" on co_buy_annual_reviews for select to authenticated
  using (is_circle_member(circle_id) and status = 'published');
create policy "admin all reviews" on co_buy_annual_reviews for all to authenticated
  using (is_admin()) with check (is_admin());

-- Usage zones: members read; admin writes (member can view their own zone in detail)
create policy "members read zones" on co_buy_usage_zones for select to authenticated
  using (is_circle_member(circle_id));
create policy "admin all zones" on co_buy_usage_zones for all to authenticated
  using (is_admin()) with check (is_admin());
```

**Important regulatory design:**
- `co_buy_proposals` and `co_buy_votes` are explicitly **advisory** in the schema and copy. The `outcome` field captures the vote result; the `decision_notes` captures what actually got decided (which may differ). Legal authority lives in the co-ownership agreement, not in the software.
- `co_buy_expenses` records who paid; the platform does not move money. The `paid_by` field exists for historical record only.
- `co_buy_exit_interests` records intent. Actual exit requires legal process; this is the "we should start that process" trigger.

---

## 3. Route structure (Phase 5)

```
NEW MEMBER ROUTES:
  /co-buy/circles/[id]/expenses              → expenses + dues view
  /co-buy/circles/[id]/proposals             → list of governance proposals
  /co-buy/circles/[id]/proposals/[id]        → proposal detail + vote
  /co-buy/circles/[id]/exit                  → register exit interest (for self)
  /co-buy/circles/[id]/annual-review/[year]  → annual review document
  /co-buy/circles/[id]/zones                 → land usage zones map

NEW ADMIN ROUTES:
  /admin/co-buy/circles/[id]/expenses        → expense entry + allocation
  /admin/co-buy/circles/[id]/proposals       → proposal management
  /admin/co-buy/circles/[id]/exit-interests  → exit handling
  /admin/co-buy/circles/[id]/annual-review/new → create annual review
  /admin/co-buy/circles/[id]/zones           → zone assignment

NEW ROUTES (cross-circle for AcrehubIndia maintenance subscriptions):
  /admin/co-buy/maintenance                  → subscription dashboard
```

---

## 4. Integration with existing site

**1. Circle status transition.** When a circle's status changes from any Phase 2 state to `completed`, the system automatically:
- Sets `post_purchase_at = now()`
- Prompts admin to enter `registration_date`, `final_purchase_amount`, upload `sale_deed_doc_url`
- Seeds default proposal for "Annual maintenance budget for FY{current}"
- Enables Phase 5 routes for that circle

**2. Phase 2 circle dashboard becomes post-purchase dashboard.** `/co-buy/circles/[id]` automatically shows different tabs based on `post_purchase_at`:
- Pre-purchase: Overview / Members / Milestones / Documents / Site Visit / Costs / Services
- Post-purchase: Overview / Members / Expenses / Proposals / Annual Review / Zones / Services

**3. Service requests carry over.** Existing Phase 3 service request workflow continues to work; "post-purchase maintenance" is a service category. The difference is that for post-purchase circles, services tend to be recurring (annual fencing repair, monthly caretaker payments) rather than one-off.

**4. Founder Intelligence extensions.** Phase 4 dashboards get new tabs:
- **Maintenance subscriptions:** how many active, monthly recurring revenue
- **Circle health:** completed vs. dormant vs. disputed circles
- **Exit patterns:** which exits succeeded, how long they took

**5. NOT integrated:**
- Public marketplace surfaces (no public exposure of post-purchase data)
- Buyer requirements (different intent)
- Listings (post-purchase land is generally not relisted unless an exit goes through, in which case it becomes a separate listing via the normal flow)

---

## 5. Component plan (Phase 5)

**Member-facing:**
- `PostPurchaseHeader.tsx` — shows registration date, final amount, status
- `ExpenseLedger.tsx` — list of expenses with category filter
- `MemberDuesCard.tsx` — current year balance for the viewing member
- `ProposalCard.tsx` — proposal summary with vote status
- `ProposalDetail.tsx` — full proposal + voting interface
- `VoteForm.tsx` — vote submission (client component)
- `VoteResultsDisplay.tsx` — current tally (visible during voting + final)
- `ExitInterestForm.tsx` — register own exit
- `AnnualReviewDocument.tsx` — printable annual review
- `UsageZonesMap.tsx` — visual representation of zones (Leaflet or static)
- `MaintenanceSubscriptionStatus.tsx` — info about ongoing AcrehubIndia subscription

**Admin:**
- `AdminCircleTransitionForm.tsx` — post-purchase setup wizard
- `AdminExpenseEntryForm.tsx` — expense recording with allocation logic
- `AdminExpenseAllocator.tsx` — distribute expense across members
- `AdminProposalCreator.tsx` — create governance proposal
- `AdminProposalManager.tsx` — close, post outcome, write decision notes
- `AdminExitInterestQueue.tsx` — exit requests across circles
- `AdminAnnualReviewBuilder.tsx` — compose annual review with auto-populated financial summary
- `AdminUsageZoneEditor.tsx` — assign zones to members
- `AdminMaintenanceDashboard.tsx` — subscription overview

**Library files:**
- `app/lib/co-buy/post-purchase/types.ts`
- `app/lib/co-buy/post-purchase/expense-allocation.ts` — pure functions for allocation math
- `app/lib/co-buy/post-purchase/voting.ts` — vote counting + threshold checks
- `app/lib/co-buy/post-purchase/dues-calculator.ts`
- `app/lib/co-buy/post-purchase/actions.ts` — server actions

---

## 6. UX flow

**Circle transitions to post-purchase:**

1. Admin in `/admin/co-buy/circles/[id]` advances milestone to `registration_complete`
2. Modal prompts: "Move this circle to post-purchase?"
3. On confirm: admin fills out registration date, final amount, uploads sale deed
4. System sets `post_purchase_at`, transitions UI for this circle
5. Initial annual review draft created for current FY
6. Event log records the transition

**Expense recording flow:**

1. Admin in `/admin/co-buy/circles/[id]/expenses` clicks "Add expense"
2. Form: category, title, description, amount, date, paid_by, receipt upload, allocation method
3. Allocation method options:
   - **Equal:** divide amount equally across active members
   - **By share:** divide by each member's `soft_commitment_amount` ratio
   - **Specific members:** select which members bear this expense
   - **Custom:** enter custom amount per member
4. On save: expense recorded, `co_buy_member_dues` rows updated for affected members + FY
5. Members see expense in their ledger; their `balance` updates

**Governance proposal + voting:**

1. Admin creates proposal: title, description, options (default: Yes/No/Abstain), threshold, voting deadline
2. Members get notified (event in feed + WhatsApp template send)
3. Each member visits proposal page, casts vote
4. Vote tally visible to all members (transparent)
5. When voting closes: admin reviews tally, writes `outcome_summary` and `decision_notes` (what's actually being done)
6. Important: the software does NOT auto-execute outcomes. Admin uses outcome as input to real-world decision.

**Exit interest flow:**

1. Member visits `/co-buy/circles/[id]/exit` → registers intent
2. Form: type (sell to existing member / sell to new buyer / partition / etc.), expected price, timeline, reason
3. On submit: admin gets notification, status `registered`
4. Admin engages lawyer → status `lawyer_engaged`
5. Lawyer-led process happens outside platform; admin updates status as it progresses
6. On completion: member status changes to `withdrawn`, circle.current_members decremented, audit log records the change

**Annual review:**

1. At end of FY (or on demand): admin in `/admin/co-buy/circles/[id]/annual-review/new`
2. Form pre-populated with financial summary (auto-computed from co_buy_expenses for the FY)
3. Admin writes summary, highlights, attendees, meeting minutes, next year plan
4. Optional: upload formal review document (PDF)
5. Status `draft` → admin shares draft with members for review → publishes → status `published`
6. Members see published review on `/co-buy/circles/[id]/annual-review/[year]`

---

## 7. Risks and assumptions

**Risks:**

1. **The software becomes the source of truth for things it shouldn't.** Members might assume "the platform says I owe ₹15,000" is legally definitive. *Mitigation:* prominent footer on every expense/dues view: "This is a record-keeping tool. Legal financial obligations are governed by the co-ownership agreement. Disputes should be resolved per that agreement, not the platform."
2. **Vote counts get treated as binding.** *Mitigation:* every proposal view shows "Advisory vote — final decision per co-ownership agreement and consensus." The `decision_notes` field captures what was actually decided regardless of vote outcome.
3. **Exit interest goes nowhere.** Members register exit, nothing happens for months. *Mitigation:* admin queue with aging indicators; SLA documented (e.g., admin contacts within 7 days).
4. **Expense allocation disputes.** Member challenges that "I shouldn't pay for fencing because I don't use that section." *Mitigation:* allocation method is recorded on each expense; admin can adjust + record reasoning in `internal_notes`. Disputes resolved per co-ownership agreement.
5. **Dormant circles accumulate** in the database with no activity. *Mitigation:* admin dashboard surfaces "circles with no expenses/proposals in 6 months" — prompts annual review or status change.
6. **DPDP Act compliance grows complex.** Members have ongoing personal data; data deletion requests are tricky for joint-property records. *Mitigation:* document retention policy with lawyer; offer privacy-mode display for departing members (full data retained in audit log, but visible records redacted).

**Assumptions:**
- At least one circle has completed registration and is operating post-purchase manually
- AcrehubIndia has run an annual review at least once before
- The team has a clear process for non-software workflows: lawyer engagement on exits, payment collection (outside platform), dispute escalation
- DPDP Act guidance on long-lived personal data has been incorporated into the privacy policy

---

## 8. Files likely to change

**Modify:**
- `app/co-buy/circles/[id]/page.tsx` — conditional tabs based on post_purchase status
- `app/admin/co-buy/circles/[id]/page.tsx` — Phase 5 sub-sections
- Existing milestone editor — auto-trigger transition prompt at `registration_complete`
- `app/admin/co-buy/intelligence/page.tsx` — maintenance + health tabs

**Create:**
- All routes in section 3
- All components in section 5
- All library files in section 5
- `supabase-co-buy-phase-5.sql`

**Don't touch:**
- Phases 1-4 working code (extensions only)
- Public marketplace surfaces

---

## 9. Testing checklist

**Manual QA:**

1. **Transition:**
   - Advance a circle's milestone to `registration_complete` → admin prompt fires
   - Fill out post-purchase form → circle UI shifts to Phase 5 tabs
2. **Expense allocation:**
   - Record an equal-allocation expense across 5 members → each member's dues update by amount/5
   - Record share-based expense → each member's dues update proportional to their soft_commitment
   - Record specific-members expense → only those members' dues affected
3. **Voting:**
   - Create proposal, members vote → tally updates
   - Vote with simple_majority threshold; verify outcome correctness
   - Member submits vote, then changes it → only most recent vote counts
   - Vote close → admin enters decision_notes; result archived
4. **Exit:**
   - Member registers exit → admin sees in queue
   - Status transitions: registered → lawyer_engaged → completed
   - On completion: member status updated, current_members decremented
5. **Annual review:**
   - Create draft → financial summary auto-populates from FY expenses
   - Publish → members see read-only version
6. **Privacy:**
   - Member A cannot see member B's individual dues figures (only aggregate is visible)
   - Member A cannot see member B's exit interest details
   - Non-members of a circle see nothing
7. **Cross-circle isolation:**
   - Same multi-circle privacy tests as Phase 2

**Smoke tests:**
```
GET /co-buy/circles/[id]/expenses           (member)    → 200
GET /co-buy/circles/[id]/proposals          (member)    → 200
GET /co-buy/circles/[id]/exit               (member)    → 200
GET /admin/co-buy/circles/[id]/expenses     (admin)     → 200
GET /admin/co-buy/maintenance               (admin)     → 200
```

---

## 10. Claude Code build prompts

### Prompt 1 — Schema + transition + post-purchase header

```
Read CLAUDE.md and docs/buying-circles-phase-5-spec.md (and earlier specs).

Output supabase-co-buy-phase-5.sql per spec section 2.

Then build the transition flow:
1. AdminCircleTransitionForm.tsx — prompted when a circle milestone advances to registration_complete
2. Server action that handles the transition (sets post_purchase_at, seeds initial annual review draft, creates transition event)
3. PostPurchaseHeader component for /co-buy/circles/[id] when post_purchase_at is set
4. /co-buy/circles/[id] gets conditional tab structure based on post_purchase_at

Show plan first.
```

### Prompt 2 — Expenses + dues

```
I've applied migration.

Build expense tracking:
1. app/lib/co-buy/post-purchase/expense-allocation.ts (pure functions for the 4 allocation methods)
2. app/lib/co-buy/post-purchase/dues-calculator.ts (recompute dues when expense added/edited/deleted)
3. /admin/co-buy/circles/[id]/expenses + AdminExpenseEntryForm + AdminExpenseAllocator
4. /co-buy/circles/[id]/expenses (member view) + ExpenseLedger + MemberDuesCard
5. Recompute dues atomically (transaction) when expense is mutated

Critical: prominent footer on member view: "Record-keeping tool. Legal obligations per co-ownership agreement."
```

### Prompt 3 — Governance proposals + voting

```
Build voting:
1. app/lib/co-buy/post-purchase/voting.ts (tally + threshold check)
2. /admin/co-buy/circles/[id]/proposals + AdminProposalCreator + AdminProposalManager
3. /co-buy/circles/[id]/proposals + ProposalCard + ProposalDetail + VoteForm + VoteResultsDisplay
4. Server action for casting/updating votes
5. Auto-close proposal at voting_ends_at via a daily cron job OR on-demand on next view (your call, document)
6. Outcome is advisory; decision_notes is what admin records actually happened

Every proposal view must show "Advisory vote — final decision per co-ownership agreement."
```

### Prompt 4 — Exit interests + annual review + zones

```
Build:
1. /co-buy/circles/[id]/exit + ExitInterestForm (member)
2. /admin/co-buy/circles/[id]/exit-interests + AdminExitInterestQueue
3. /admin/co-buy/circles/[id]/annual-review/new + AdminAnnualReviewBuilder (auto-populates financial summary)
4. /co-buy/circles/[id]/annual-review/[year] (member, published only)
5. /admin/co-buy/circles/[id]/zones + AdminUsageZoneEditor
6. /co-buy/circles/[id]/zones + UsageZonesMap (Leaflet or static rendering)

Exit interest flow: member registers → admin engages lawyer (status change) → eventual resolution.
```

### Prompt 5 — Cross-circle dashboards + tests + polish

```
Final integration:
1. /admin/co-buy/maintenance — subscription dashboard (all circles by maintenance_subscription_status)
2. Extend /admin/co-buy/intelligence with maintenance + circle-health + exit-patterns tabs
3. Dormant-circle detection: admin sees "circles with no activity in 6 months"
4. Smoke tests from spec section 9
5. Update CLAUDE.md and tracker
6. Run npm run build, fix errors, commit. Branch only.
```

---

## 11. The non-code work for Phase 5

This is the most operationally consequential phase. Don't ship without:

1. **Lawyer-reviewed disclaimer copy** for: expense allocation displays, voting (advisory), exit interest, annual review. The "this is record-keeping, not legal authority" line must be airtight.
2. **A signed co-ownership agreement template** for each Indian state where you operate (Karnataka first). The software references this agreement; it must exist.
3. **Documented dispute resolution process.** When members disagree about expense allocation or vote outcomes, what does AcrehubIndia do? Mediate? Refer to lawyer? Step back? Document it.
4. **DPDP Act retention policy.** How long is post-purchase data retained? How are deletion requests from former members handled? Lawyer review required.
5. **Insurance considerations.** AcrehubIndia is now coordinating maintenance and recording expenses for jointly-owned property. Professional indemnity insurance becomes relevant. Talk to a broker.
6. **Annual review meeting facilitation.** Software helps create the document; the actual meeting (in person or video) needs a process. Document it.
7. **Decide on AcrehubIndia's recurring subscription model.** Monthly maintenance coordination fee per circle? Per-member fee? Flat annual fee with usage tiers? Have a pricing model documented before enabling `maintenance_subscription_status='active'` on any circle.

---

*Companion to buying-circles-spec.md (Phase 1), buying-circles-phase-2-spec.md (Phase 2), buying-circles-phase-3-spec.md (Phase 3), buying-circles-phase-4-spec.md (Phase 4). This is the final phase spec. Anything beyond Phase 5 (e.g., public vendor directory, resale marketplace, automated dispute resolution) is a separate product decision and should be specced fresh when the time comes.*
