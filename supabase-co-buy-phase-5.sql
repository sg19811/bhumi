-- Acrehub Buying Circles — Phase 5 migration (post-purchase governance).
-- Run after phases 1-4. Defensive. Spec: docs/buying-circles-phase-5-spec.md §2.
-- Regulatory design: proposals/votes are ADVISORY; expenses are records only (no money
-- moves); exit interests record intent. Legal authority lives in the co-ownership agreement.

alter table co_buy_circles add column if not exists post_purchase_at timestamptz;
alter table co_buy_circles add column if not exists registration_date date;
alter table co_buy_circles add column if not exists sale_deed_doc_url text;
alter table co_buy_circles add column if not exists final_purchase_amount bigint;
alter table co_buy_circles add column if not exists maintenance_subscription_status text default 'not_subscribed';
alter table co_buy_circles add column if not exists maintenance_fee_monthly bigint;
alter table co_buy_circles add column if not exists land_use_pattern text;

create table if not exists co_buy_expenses (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  amount bigint not null,
  expense_date date not null,
  paid_by text,
  paid_by_member_id uuid references co_buy_circle_members(id),
  receipt_url text,
  allocation_method text default 'equal',
  allocation_details jsonb default '{}',
  status text default 'recorded',
  internal_notes text,
  recorded_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists expenses_circle_idx on co_buy_expenses(circle_id);
create index if not exists expenses_date_idx on co_buy_expenses(expense_date desc);

create table if not exists co_buy_member_dues (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  member_id uuid not null references co_buy_circle_members(id) on delete cascade,
  fiscal_year integer not null,
  total_allocated bigint default 0,
  total_paid bigint default 0,
  balance bigint generated always as (total_allocated - total_paid) stored,
  status text default 'current',
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
create unique index if not exists dues_circle_member_year_uniq on co_buy_member_dues(circle_id, member_id, fiscal_year);

create table if not exists co_buy_proposals (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  title text not null,
  description text not null,
  proposal_type text default 'general',
  options jsonb not null,
  threshold_required text default 'simple_majority',
  voting_starts_at timestamptz default now(),
  voting_ends_at timestamptz,
  status text default 'open',
  outcome text,
  outcome_summary text,
  decision_notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  closed_at timestamptz
);
create index if not exists proposals_circle_idx on co_buy_proposals(circle_id);
create index if not exists proposals_status_idx on co_buy_proposals(status);

create table if not exists co_buy_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references co_buy_proposals(id) on delete cascade,
  member_id uuid not null references co_buy_circle_members(id) on delete cascade,
  vote_value text not null,
  comment text,
  created_at timestamptz default now()
);
create unique index if not exists votes_proposal_member_uniq on co_buy_votes(proposal_id, member_id);

create table if not exists co_buy_exit_interests (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  member_id uuid not null references co_buy_circle_members(id) on delete cascade,
  exit_type text not null,
  expected_price bigint,
  preferred_timeline text,
  reason text,
  status text default 'registered',
  internal_notes text,
  buyer_visible_summary text,
  registered_at timestamptz default now(),
  resolved_at timestamptz,
  resolution_notes text
);
create index if not exists exit_circle_idx on co_buy_exit_interests(circle_id);
create index if not exists exit_status_idx on co_buy_exit_interests(status);

create table if not exists co_buy_annual_reviews (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  fiscal_year integer not null,
  summary text,
  highlights jsonb default '[]',
  financial_summary jsonb default '{}',
  attendees text[] default '{}',
  meeting_date date,
  meeting_minutes text,
  next_year_plan text,
  document_url text,
  status text default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists annual_reviews_circle_year_uniq on co_buy_annual_reviews(circle_id, fiscal_year);

create table if not exists co_buy_usage_zones (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  zone_label text not null,
  assigned_member_id uuid references co_buy_circle_members(id),
  area_value numeric,
  area_unit text,
  description text,
  boundary_notes text,
  current_use text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists zones_circle_idx on co_buy_usage_zones(circle_id);

alter table co_buy_expenses enable row level security;
alter table co_buy_member_dues enable row level security;
alter table co_buy_proposals enable row level security;
alter table co_buy_votes enable row level security;
alter table co_buy_exit_interests enable row level security;
alter table co_buy_annual_reviews enable row level security;
alter table co_buy_usage_zones enable row level security;

drop policy if exists "members read expenses" on co_buy_expenses;
create policy "members read expenses" on co_buy_expenses for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all expenses" on co_buy_expenses;
create policy "admin all expenses" on co_buy_expenses for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read circle dues" on co_buy_member_dues;
create policy "members read circle dues" on co_buy_member_dues for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all dues" on co_buy_member_dues;
create policy "admin all dues" on co_buy_member_dues for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read proposals" on co_buy_proposals;
create policy "members read proposals" on co_buy_proposals for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all proposals" on co_buy_proposals;
create policy "admin all proposals" on co_buy_proposals for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read circle votes" on co_buy_votes;
create policy "members read circle votes" on co_buy_votes for select to authenticated
  using (exists (select 1 from co_buy_proposals p where p.id = proposal_id and is_circle_member(p.circle_id)));
drop policy if exists "members write own vote" on co_buy_votes;
create policy "members write own vote" on co_buy_votes for insert to authenticated
  with check (exists (select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()));
drop policy if exists "members update own vote" on co_buy_votes;
create policy "members update own vote" on co_buy_votes for update to authenticated
  using (exists (select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()));
drop policy if exists "admin all votes" on co_buy_votes;
create policy "admin all votes" on co_buy_votes for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read own exit" on co_buy_exit_interests;
create policy "members read own exit" on co_buy_exit_interests for select to authenticated
  using (exists (select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()));
drop policy if exists "members register own exit" on co_buy_exit_interests;
create policy "members register own exit" on co_buy_exit_interests for insert to authenticated
  with check (exists (select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()));
drop policy if exists "admin all exits" on co_buy_exit_interests;
create policy "admin all exits" on co_buy_exit_interests for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read published reviews" on co_buy_annual_reviews;
create policy "members read published reviews" on co_buy_annual_reviews for select to authenticated
  using (is_circle_member(circle_id) and status = 'published');
drop policy if exists "admin all reviews" on co_buy_annual_reviews;
create policy "admin all reviews" on co_buy_annual_reviews for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read zones" on co_buy_usage_zones;
create policy "members read zones" on co_buy_usage_zones for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all zones" on co_buy_usage_zones;
create policy "admin all zones" on co_buy_usage_zones for all to authenticated using (is_admin()) with check (is_admin());
