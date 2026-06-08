-- ============================================================================
-- AcreHub — Farm Plot Projects, PHASE 2  ·  schema migration
-- Spec: docs/farm-plots-spec.md (Phase 2)
-- ----------------------------------------------------------------------------
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (IF NOT EXISTS + policies dropped & recreated).
--
-- PREREQUISITES (run first if not already applied):
--   1. supabase-setup.sql        (listings, owner_user_id, is_admin(), base RLS)
--   2. supabase-farm-plots.sql   (project columns + farm_project_plots)
--   Run order: setup -> farm-plots -> THIS file.
--
-- WHAT THIS DOES (all additive — nothing existing changes):
--   A. site_visit_requests  — buyers request a site visit (public insert; owner/admin read+update)
--   B. listings.verification_tier — tiered verification badge (text, app-level values)
--   C. project_documents    — links to project docs (public-read on active listings; owner/admin manage)
-- ============================================================================

-- ── A. Site-visit requests ──────────────────────────────────────────────────
create table if not exists public.site_visit_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  name text,
  contact_phone text not null,
  preferred_date date,
  notes text,
  status text not null default 'new', -- new | contacted | scheduled | done | cancelled (app-level)
  created_at timestamptz not null default now()
);
create index if not exists site_visit_requests_listing_idx on public.site_visit_requests(listing_id);

alter table public.site_visit_requests enable row level security;

-- Anyone can request a visit (mirrors inquiries — anonymous-friendly).
drop policy if exists "site_visit insert (public)" on public.site_visit_requests;
create policy "site_visit insert (public)" on public.site_visit_requests
  for insert with check (true);

-- Only the listing owner or an admin can read the requests.
drop policy if exists "site_visit read (owner/admin)" on public.site_visit_requests;
create policy "site_visit read (owner/admin)" on public.site_visit_requests
  for select using (
    public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.owner_user_id = auth.uid())
  );

-- Owner/admin can update status.
drop policy if exists "site_visit update (owner/admin)" on public.site_visit_requests;
create policy "site_visit update (owner/admin)" on public.site_visit_requests
  for update using (
    public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.owner_user_id = auth.uid())
  );

-- ── B. Tiered verification ──────────────────────────────────────────────────
-- App-level values (no DB constraint): 'unverified' | 'details_verified'
--   | 'documents_verified' | 'site_verified'. Null = treat as unverified.
alter table public.listings add column if not exists verification_tier text;

-- ── C. Project documents ────────────────────────────────────────────────────
create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  label text not null,
  url text not null,        -- storage URL or external link
  doc_type text,            -- rera | layout_approval | conversion_order | brochure | other (app-level)
  created_at timestamptz not null default now()
);
create index if not exists project_documents_listing_idx on public.project_documents(listing_id);

alter table public.project_documents enable row level security;

-- Public can read documents on active listings (so buyers see them); owner/admin always.
drop policy if exists "project_docs read (public-active/owner/admin)" on public.project_documents;
create policy "project_docs read (public-active/owner/admin)" on public.project_documents
  for select using (
    exists (select 1 from public.listings l where l.id = listing_id and l.status = 'active')
    or public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.owner_user_id = auth.uid())
  );

-- Owner/admin manage (insert/update/delete).
drop policy if exists "project_docs manage (owner/admin)" on public.project_documents;
create policy "project_docs manage (owner/admin)" on public.project_documents
  for all using (
    public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.owner_user_id = auth.uid())
  ) with check (
    public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.owner_user_id = auth.uid())
  );

-- Reload PostgREST schema cache so the new tables/columns are visible immediately.
notify pgrst, 'reload schema';
