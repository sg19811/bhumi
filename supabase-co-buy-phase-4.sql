-- Acrehub Buying Circles — Phase 4 migration (scoring, team roles, templates,
-- intelligence views, audit log). Run after phases 1-3. Defensive (IF NOT EXISTS).
-- Spec: docs/buying-circles-phase-4-spec.md §2.
-- NOTE vs spec: co_buy_opportunities had no corridor/state columns, so we add them
-- here (nullable) to make view_co_buy_corridor_demand valid.

alter table co_buy_opportunities add column if not exists corridor text;
alter table co_buy_opportunities add column if not exists state text;

create table if not exists acrehub_team_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_role text not null,
  active boolean default true,
  granted_by uuid references auth.users(id),
  granted_at timestamptz default now(),
  notes text,
  created_at timestamptz default now()
);
create index if not exists team_roles_user_idx on acrehub_team_roles(user_id);
create index if not exists team_roles_role_idx on acrehub_team_roles(team_role);
create unique index if not exists team_roles_user_role_uniq on acrehub_team_roles(user_id, team_role);

alter table co_buy_circles add column if not exists build_owner_id uuid references auth.users(id);
alter table co_buy_circles add column if not exists legal_revenue_owner_id uuid references auth.users(id);

alter table co_buy_service_requests add column if not exists assigned_sales_owner_id uuid references auth.users(id);
alter table co_buy_service_requests add column if not exists assigned_build_owner_id uuid references auth.users(id);
alter table co_buy_service_requests add column if not exists assigned_legal_revenue_owner_id uuid references auth.users(id);
alter table co_buy_service_requests add column if not exists initiator_type text default 'admin';
alter table co_buy_service_requests add column if not exists requesting_member_id uuid references co_buy_circle_members(id);

alter table co_buy_interests add column if not exists lead_score integer;
alter table co_buy_interests add column if not exists lead_score_label text;
alter table co_buy_interests add column if not exists lead_score_updated_at timestamptz;
alter table co_buy_interests add column if not exists lead_score_breakdown jsonb default '{}';

create table if not exists acrehub_message_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text unique not null,
  channel text not null default 'whatsapp',
  language text default 'en',
  display_name text not null,
  body text not null,
  variables jsonb default '[]',
  active boolean default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists templates_active_idx on acrehub_message_templates(active);
create index if not exists templates_language_idx on acrehub_message_templates(language);

create table if not exists acrehub_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  actor_role text,
  entity_type text not null,
  entity_id uuid,
  action text not null,
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

create or replace view view_co_buy_corridor_demand as
  select o.corridor, o.state,
    count(distinct i.id) as interest_count, avg(i.budget_max) as avg_budget,
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
  select date_trunc('month', completed_at) as month, service_category,
    count(*) as completed_requests, sum(acrehub_service_fee) as total_acrehub_fees,
    sum(vendor_cost_estimate) as total_vendor_costs, sum(estimated_total_cost) as total_volume
  from co_buy_service_requests
  where status = 'completed' and completed_at is not null
  group by 1, 2 order by 1 desc;

create or replace view view_co_buy_vendor_performance as
  select v.id, v.vendor_name, v.vendor_category,
    count(distinct q.service_request_id) as quotes_provided,
    count(distinct q.service_request_id) filter (where q.selected) as quotes_selected,
    count(distinct sr.id) filter (where sr.status = 'completed') as services_completed
  from acrehub_vendors v
  left join co_buy_service_vendor_quotes q on q.vendor_id = v.id
  left join co_buy_service_requests sr on sr.id = q.service_request_id
  where v.active = true
  group by v.id, v.vendor_name, v.vendor_category;

alter table acrehub_team_roles enable row level security;
alter table acrehub_message_templates enable row level security;
alter table acrehub_audit_log enable row level security;

drop policy if exists "admin all team roles" on acrehub_team_roles;
create policy "admin all team roles" on acrehub_team_roles for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "users read own roles" on acrehub_team_roles;
create policy "users read own roles" on acrehub_team_roles for select to authenticated using (user_id = auth.uid());

drop policy if exists "team reads templates" on acrehub_message_templates;
create policy "team reads templates" on acrehub_message_templates for select to authenticated
  using (is_admin() or exists (select 1 from acrehub_team_roles where user_id = auth.uid() and active = true));
drop policy if exists "admin writes templates" on acrehub_message_templates;
create policy "admin writes templates" on acrehub_message_templates for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "admin reads audit" on acrehub_audit_log;
create policy "admin reads audit" on acrehub_audit_log for select to authenticated using (is_admin());
drop policy if exists "admin writes audit" on acrehub_audit_log;
create policy "admin writes audit" on acrehub_audit_log for insert to authenticated with check (is_admin());

-- Phase 4: members may PROPOSE a service for their own circle (initiator_type='member').
-- Admin still owns scoping/quotes/approval. (Phase 3 only allowed admin inserts.)
drop policy if exists "members request services" on co_buy_service_requests;
create policy "members request services" on co_buy_service_requests for insert to authenticated
  with check (is_circle_member(circle_id) and initiator_type = 'member');

create or replace function is_team_member()
returns boolean language sql security definer set search_path = public as $$
  select is_admin() or exists (select 1 from acrehub_team_roles where user_id = auth.uid() and active = true);
$$;

create or replace function has_team_role(p_role text)
returns boolean language sql security definer set search_path = public as $$
  select is_admin() or exists (select 1 from acrehub_team_roles where user_id = auth.uid() and team_role = p_role and active = true);
$$;
