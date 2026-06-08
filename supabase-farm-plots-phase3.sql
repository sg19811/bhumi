-- ============================================================================
-- AcreHub — Farm Plot Projects, PHASE 3 (remaining)  ·  schema migration
-- ----------------------------------------------------------------------------
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (IF NOT EXISTS + policies dropped & recreated).
--
-- PREREQUISITES: supabase-setup.sql, supabase-farm-plots.sql, supabase-farm-plots-phase2.sql
--
-- WHAT THIS DOES (all additive):
--   A. lead assignment    — assigned_to on site_visit_requests + inquiries
--   B. virtual tour        — listings.tour_url (drone footage uses existing videos[])
--   C. resale marketplace  — plot_resales table (owners re-list a bought plot)
-- ============================================================================

-- ── A. Lead assignment ──────────────────────────────────────────────────────
alter table public.site_visit_requests add column if not exists assigned_to text;
alter table public.inquiries           add column if not exists assigned_to text;

-- ── B. Virtual tour / 360 link ──────────────────────────────────────────────
alter table public.listings add column if not exists tour_url text;

-- ── C. Resale marketplace ───────────────────────────────────────────────────
create table if not exists public.plot_resales (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null, -- optional link to the original project
  project_name text,
  corridor text,
  nearest_city text,
  plot_size_value numeric,
  plot_size_unit text,
  price numeric,
  contact_name text,
  contact_phone text not null,
  notes text,
  status text not null default 'active', -- active | sold | withdrawn (app-level)
  created_at timestamptz not null default now()
);
create index if not exists plot_resales_status_idx on public.plot_resales(status);
create index if not exists plot_resales_city_idx on public.plot_resales(nearest_city);

alter table public.plot_resales enable row level security;

-- Public can read active resale posts.
drop policy if exists "plot_resales read (public-active)" on public.plot_resales;
create policy "plot_resales read (public-active)" on public.plot_resales
  for select using (status = 'active' or public.is_admin() or owner_user_id = auth.uid());

-- Signed-in users can post a resale (must own the row).
drop policy if exists "plot_resales insert (auth)" on public.plot_resales;
create policy "plot_resales insert (auth)" on public.plot_resales
  for insert with check (auth.uid() is not null and owner_user_id = auth.uid());

-- Owner/admin can update or delete their resale.
drop policy if exists "plot_resales manage (owner/admin)" on public.plot_resales;
create policy "plot_resales manage (owner/admin)" on public.plot_resales
  for update using (public.is_admin() or owner_user_id = auth.uid());
drop policy if exists "plot_resales delete (owner/admin)" on public.plot_resales;
create policy "plot_resales delete (owner/admin)" on public.plot_resales
  for delete using (public.is_admin() or owner_user_id = auth.uid());

-- Reload PostgREST schema cache.
notify pgrst, 'reload schema';
