-- ============================================================================
-- AcreHub — Farm Plot Projects MVP  ·  schema migration
-- Spec: docs/farm-plots-spec.md (section 4)
-- ----------------------------------------------------------------------------
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (IF NOT EXISTS columns/table; policies dropped & recreated).
--
-- PREREQUISITES (run these first if not already applied):
--   1. supabase-setup.sql  — creates `listings`, `owner_user_id`, `is_admin()`,
--      and the existing RLS. This migration references all three.
--   Run order: supabase-setup.sql (+ any other outstanding supabase-*.sql) THEN this file.
--
-- WHAT THIS DOES:
--   - Adds 17 nullable project columns to `listings` (non-project listings unaffected).
--   - Creates one child table `farm_project_plots` (1-to-many plot inventory) with RLS.
--   - New land_type VALUES are app-level (app/lib/land.ts) — no DB enum/constraint.
-- ============================================================================

-- 1. New land_type values are handled in the app (app/lib/land.ts) — no check constraint.

-- 2. Additive project columns on listings (all nullable, defaults safe)
alter table public.listings add column if not exists project_name text;
alter table public.listings add column if not exists developer_name text;
alter table public.listings add column if not exists project_stage text;            -- 'pre_launch' | 'launched' | 'partial_inventory' | 'completed'
alter table public.listings add column if not exists total_project_acres numeric;
alter table public.listings add column if not exists plot_count integer;
alter table public.listings add column if not exists plot_size_min_value numeric;
alter table public.listings add column if not exists plot_size_max_value numeric;
alter table public.listings add column if not exists plot_size_unit text;            -- 'sqft' | 'guntha' | 'cent' | 'acre'
alter table public.listings add column if not exists maintenance_fee_amount integer; -- rupees
alter table public.listings add column if not exists maintenance_fee_period text;    -- 'monthly' | 'quarterly' | 'yearly' | 'one_time'
alter table public.listings add column if not exists corridor text;                  -- 'kanakapura-road' etc. (same slug as URL)
alter table public.listings add column if not exists nearest_city text;              -- 'bangalore' | 'hyderabad' etc.
alter table public.listings add column if not exists distance_from_city_km numeric;
alter table public.listings add column if not exists travel_time_minutes integer;
alter table public.listings add column if not exists layout_approval_status text;    -- 'approved' | 'pending' | 'not_required' | 'unknown'
alter table public.listings add column if not exists conversion_status text;         -- 'converted' | 'agricultural' | 'partial' | 'unknown'
alter table public.listings add column if not exists amenities jsonb default '[]'::jsonb;
alter table public.listings add column if not exists possession_timeline text;       -- 'ready' | '6_months' | '12_months' | '24_months' | 'phased'

-- 3. Plot inventory (the only genuinely new table)
create table if not exists public.farm_project_plots (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  plot_label  text,                                  -- 'Plot A-12' or 'Phase 1 / Block 2 / Plot 12'
  size_value  numeric not null,
  size_unit   text not null,                         -- 'sqft' | 'guntha' | 'cent' | 'acre'
  price       numeric,                               -- total price for this specific plot
  status      text not null default 'available',     -- 'available' | 'sold' | 'reserved' | 'on_hold'
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists farm_project_plots_listing_id_idx on public.farm_project_plots(listing_id);
create index if not exists farm_project_plots_status_idx on public.farm_project_plots(status);

alter table public.farm_project_plots enable row level security;

-- Public read of plots that belong to active listings
drop policy if exists "public read available plots" on public.farm_project_plots;
create policy "public read available plots" on public.farm_project_plots for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = farm_project_plots.listing_id
        and l.status = 'active'
    )
  );

-- Listing owner manages their plots
drop policy if exists "owner manages plots" on public.farm_project_plots;
create policy "owner manages plots" on public.farm_project_plots for all to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = farm_project_plots.listing_id
        and l.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = farm_project_plots.listing_id
        and l.owner_user_id = auth.uid()
    )
  );

-- Admin override (uses existing is_admin() from supabase-setup.sql)
drop policy if exists "admin manages plots" on public.farm_project_plots;
create policy "admin manages plots" on public.farm_project_plots for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. (Analytics) corridor on search_logs so /explore corridor selections are captured.
alter table public.search_logs add column if not exists corridor text;

notify pgrst, 'reload schema';
