-- Acrehub Buying Circles — Phase 3 migration (vendor CRM + service lifecycle).
-- Run once in the Supabase SQL Editor after phase 1 & 2. Defensive (IF NOT EXISTS).
-- Spec: docs/buying-circles-phase-3-spec.md §2.
-- Compliance: the three cost columns are SEPARATE by design — never display a lone total.

create table if not exists acrehub_vendors (
  id uuid primary key default gen_random_uuid(),
  vendor_name text not null,
  vendor_category text not null,
  primary_contact_name text,
  phone text not null,
  whatsapp text,
  email text,
  city text,
  district text,
  state text,
  coverage_areas text[] default '{}',
  verification_status text default 'unverified',
  internal_score integer,
  price_range_notes text,
  services_offered text[] default '{}',
  active boolean default true,
  internal_notes text,
  onboarded_at timestamptz default now(),
  last_engaged_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists vendors_category_idx on acrehub_vendors(vendor_category);
create index if not exists vendors_state_idx on acrehub_vendors(state);
create index if not exists vendors_active_idx on acrehub_vendors(active);

create table if not exists co_buy_service_requests (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references co_buy_circles(id) on delete restrict,
  opportunity_id uuid references co_buy_opportunities(id),
  service_category text not null,
  title text not null,
  description text,
  scope jsonb default '{}',
  status text not null default 'requested',
  official_fees_estimate bigint default 0,
  vendor_cost_estimate bigint default 0,
  acrehub_service_fee bigint default 0,
  estimated_total_cost bigint generated always as (
    coalesce(official_fees_estimate,0) + coalesce(vendor_cost_estimate,0) + coalesce(acrehub_service_fee,0)
  ) stored,
  fee_model text default 'fixed',
  fee_notes text,
  approval_required boolean default true,
  approval_status text default 'pending',
  approved_at timestamptz,
  approved_by_summary text,
  buyer_visible_summary text,
  internal_notes text,
  assigned_owner_id uuid references auth.users(id),
  requested_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz,
  cancelled_at timestamptz
);
create index if not exists svc_req_circle_idx on co_buy_service_requests(circle_id);
create index if not exists svc_req_status_idx on co_buy_service_requests(status);
create index if not exists svc_req_category_idx on co_buy_service_requests(service_category);

create table if not exists co_buy_service_vendor_quotes (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references co_buy_service_requests(id) on delete cascade,
  vendor_id uuid references acrehub_vendors(id),
  vendor_name_snapshot text,
  quote_title text not null,
  quote_amount bigint not null,
  quote_details text,
  quote_file_url text,
  validity_end_date date,
  selected boolean default false,
  internal_notes text,
  buyer_visible boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists svc_quotes_req_idx on co_buy_service_vendor_quotes(service_request_id);

create table if not exists co_buy_service_tasks (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references co_buy_service_requests(id) on delete cascade,
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
create index if not exists svc_tasks_req_idx on co_buy_service_tasks(service_request_id);
create index if not exists svc_tasks_assigned_idx on co_buy_service_tasks(assigned_to);

create table if not exists co_buy_service_updates (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references co_buy_service_requests(id) on delete cascade,
  circle_id uuid not null references co_buy_circles(id),
  update_type text,
  title text not null,
  body text,
  media_urls text[] default '{}',
  visibility text not null default 'circle_members',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create index if not exists svc_updates_req_idx on co_buy_service_updates(service_request_id);
create index if not exists svc_updates_circle_idx on co_buy_service_updates(circle_id);
create index if not exists svc_updates_vis_idx on co_buy_service_updates(visibility);

alter table acrehub_vendors enable row level security;
alter table co_buy_service_requests enable row level security;
alter table co_buy_service_vendor_quotes enable row level security;
alter table co_buy_service_tasks enable row level security;
alter table co_buy_service_updates enable row level security;

drop policy if exists "admin all vendors" on acrehub_vendors;
create policy "admin all vendors" on acrehub_vendors for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read service requests" on co_buy_service_requests;
create policy "members read service requests" on co_buy_service_requests for select to authenticated using (is_circle_member(circle_id));
drop policy if exists "admin all service requests" on co_buy_service_requests;
create policy "admin all service requests" on co_buy_service_requests for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read buyer-visible quotes" on co_buy_service_vendor_quotes;
create policy "members read buyer-visible quotes" on co_buy_service_vendor_quotes for select to authenticated
  using (buyer_visible = true and exists (select 1 from co_buy_service_requests sr where sr.id = service_request_id and is_circle_member(sr.circle_id)));
drop policy if exists "admin all quotes" on co_buy_service_vendor_quotes;
create policy "admin all quotes" on co_buy_service_vendor_quotes for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "admin all svc tasks" on co_buy_service_tasks;
create policy "admin all svc tasks" on co_buy_service_tasks for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "members read member-visible updates" on co_buy_service_updates;
create policy "members read member-visible updates" on co_buy_service_updates for select to authenticated
  using (visibility = 'circle_members' and is_circle_member(circle_id));
drop policy if exists "anyone reads public updates" on co_buy_service_updates;
create policy "anyone reads public updates" on co_buy_service_updates for select using (visibility = 'public_summary');
drop policy if exists "admin all updates" on co_buy_service_updates;
create policy "admin all updates" on co_buy_service_updates for all to authenticated using (is_admin()) with check (is_admin());
