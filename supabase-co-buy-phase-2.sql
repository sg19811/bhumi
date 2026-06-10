-- Acrehub Buying Circles — Phase 2 migration (circles, members, docs, milestones,
-- site visits, RSVPs, events, tasks). Run once in the Supabase SQL Editor after
-- supabase-co-buy.sql. Defensive (IF NOT EXISTS). Spec: docs/buying-circles-phase-2-spec.md §2.

create table if not exists co_buy_circles (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references co_buy_opportunities(id) on delete restrict,
  slug text unique not null,
  name text not null,
  status text not null default 'forming',
  target_amount bigint,
  current_soft_commitment_amount bigint default 0,
  target_members integer,
  current_members integer default 0,
  internal_sales_owner uuid references auth.users(id),
  lawyer_name text,
  lawyer_status text default 'not_assigned',
  legal_structure text,
  legal_status text default 'pending_review',
  next_site_visit_id uuid,
  milestone_stage text default 'group_formation',
  whatsapp_group_link text,
  private_summary text,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_circles_opp_id_idx on co_buy_circles(opportunity_id);
create index if not exists co_buy_circles_status_idx on co_buy_circles(status);

create table if not exists co_buy_circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  interest_id uuid references co_buy_interests(id) on delete set null,
  user_id uuid references auth.users(id),
  display_name text not null,
  identity_visibility text default 'first_name_city',
  desired_share_label text,
  soft_commitment_amount bigint default 0,
  member_status text default 'invited',
  joined_at timestamptz default now(),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_members_circle_idx on co_buy_circle_members(circle_id);
create index if not exists co_buy_members_user_idx on co_buy_circle_members(user_id) where user_id is not null;
create unique index if not exists co_buy_members_circle_user_uniq on co_buy_circle_members(circle_id, user_id) where user_id is not null;

create table if not exists co_buy_documents (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  doc_type text not null,
  status text default 'pending',
  admin_notes text,
  buyer_visible_note text,
  flagged_concern text,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create index if not exists co_buy_docs_circle_idx on co_buy_documents(circle_id);
create unique index if not exists co_buy_docs_circle_type_uniq on co_buy_documents(circle_id, doc_type);

create table if not exists co_buy_milestones (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  milestone_key text not null,
  title text not null,
  description text,
  status text default 'pending',
  target_date date,
  completed_at timestamptz,
  sort_order integer default 0,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_milestones_circle_idx on co_buy_milestones(circle_id);
create unique index if not exists co_buy_milestones_circle_key_uniq on co_buy_milestones(circle_id, milestone_key);

create table if not exists co_buy_site_visits (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  scheduled_date timestamptz,
  meeting_point text,
  duration_minutes integer,
  transport_notes text,
  status text default 'proposed',
  field_coordinator_name text,
  post_visit_summary text,
  post_visit_media_urls text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_site_visits_circle_idx on co_buy_site_visits(circle_id);

create table if not exists co_buy_site_visit_rsvps (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid not null references co_buy_site_visits(id) on delete cascade,
  member_id uuid not null references co_buy_circle_members(id) on delete cascade,
  rsvp_status text not null default 'pending',
  attendees_count integer default 1,
  notes text,
  responded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists co_buy_rsvps_visit_member_uniq on co_buy_site_visit_rsvps(site_visit_id, member_id);

create table if not exists co_buy_events (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  event_type text not null,
  actor_user_id uuid references auth.users(id),
  payload jsonb default '{}',
  visibility text default 'members',
  title text not null,
  body text,
  created_at timestamptz default now()
);
create index if not exists co_buy_events_circle_idx on co_buy_events(circle_id, created_at desc);
create index if not exists co_buy_events_visibility_idx on co_buy_events(visibility);

create table if not exists co_buy_tasks (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete cascade,
  task_type text,
  title text not null,
  description text,
  status text default 'open',
  assigned_to uuid references auth.users(id),
  due_date date,
  internal_notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_tasks_circle_idx on co_buy_tasks(circle_id);
create index if not exists co_buy_tasks_assigned_idx on co_buy_tasks(assigned_to) where assigned_to is not null;

-- Deferred self-ref FK
do $$ begin
  alter table co_buy_circles add constraint co_buy_circles_next_visit_fk
    foreign key (next_site_visit_id) references co_buy_site_visits(id) on delete set null;
exception when duplicate_object then null; end $$;

-- Helper: is the current user an active member of this circle?
create or replace function is_circle_member(p_circle_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from co_buy_circle_members
    where circle_id = p_circle_id and user_id = auth.uid() and member_status = 'active'
  );
$$;

alter table co_buy_circles enable row level security;
alter table co_buy_circle_members enable row level security;
alter table co_buy_documents enable row level security;
alter table co_buy_milestones enable row level security;
alter table co_buy_site_visits enable row level security;
alter table co_buy_site_visit_rsvps enable row level security;
alter table co_buy_events enable row level security;
alter table co_buy_tasks enable row level security;

drop policy if exists "members read their circle" on co_buy_circles;
create policy "members read their circle" on co_buy_circles for select to authenticated using (is_circle_member(id));
drop policy if exists "admin all circles" on co_buy_circles;
create policy "admin all circles" on co_buy_circles for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read fellow members" on co_buy_circle_members;
create policy "members read fellow members" on co_buy_circle_members for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all members" on co_buy_circle_members;
create policy "admin all members" on co_buy_circle_members for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read circle documents" on co_buy_documents;
create policy "members read circle documents" on co_buy_documents for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all documents" on co_buy_documents;
create policy "admin all documents" on co_buy_documents for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read milestones" on co_buy_milestones;
create policy "members read milestones" on co_buy_milestones for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all milestones" on co_buy_milestones;
create policy "admin all milestones" on co_buy_milestones for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read site visits" on co_buy_site_visits;
create policy "members read site visits" on co_buy_site_visits for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all site visits" on co_buy_site_visits;
create policy "admin all site visits" on co_buy_site_visits for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read circle rsvps" on co_buy_site_visit_rsvps;
create policy "members read circle rsvps" on co_buy_site_visit_rsvps for select to authenticated
  using (exists (select 1 from co_buy_site_visits sv where sv.id = site_visit_id and is_circle_member(sv.circle_id)));
drop policy if exists "members write own rsvp" on co_buy_site_visit_rsvps;
create policy "members write own rsvp" on co_buy_site_visit_rsvps for insert to authenticated
  with check (exists (select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()));
drop policy if exists "members update own rsvp" on co_buy_site_visit_rsvps;
create policy "members update own rsvp" on co_buy_site_visit_rsvps for update to authenticated
  using (exists (select 1 from co_buy_circle_members m where m.id = member_id and m.user_id = auth.uid()));
drop policy if exists "admin all rsvps" on co_buy_site_visit_rsvps;
create policy "admin all rsvps" on co_buy_site_visit_rsvps for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read member events" on co_buy_events;
create policy "members read member events" on co_buy_events for select to authenticated
  using (is_circle_member(circle_id) and visibility = 'members');
drop policy if exists "admin all events" on co_buy_events;
create policy "admin all events" on co_buy_events for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "admin all tasks" on co_buy_tasks;
create policy "admin all tasks" on co_buy_tasks for all to authenticated using (is_admin()) with check (is_admin());
