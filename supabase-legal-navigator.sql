-- ============================================================================
-- AcreHub — Land Legal Navigator (MVP)  ·  Database schema
-- Spec: docs/legal-navigator-spec.md  (section 5)
-- ----------------------------------------------------------------------------
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: tables use IF NOT EXISTS, policies are dropped & recreated.
--
-- Governance rule (section 18): never set published=true on a state rule or
-- article without reviewed_by + reviewed_at populated by a real lawyer.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Curated state legal data (lawyer-reviewed content only)
-- ---------------------------------------------------------------------------
create table if not exists public.legal_state_rules (
  state        text primary key,
  state_label  text not null,                 -- "Karnataka"
  data         jsonb not null,                -- JurisdictionRule.data (see types.ts)
  reviewed_by  text,                          -- lawyer name + bar reg
  reviewed_at  timestamptz,
  published    boolean not null default false,
  updated_at   timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 2. Eligibility wizard answers + result
-- ---------------------------------------------------------------------------
create table if not exists public.legal_eligibility_results (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  state           text not null,
  answers         jsonb not null,
  verdict         text not null,              -- likely_eligible | with_conditions | needs_approval | high_risk | insufficient_info
  confidence      integer not null check (confidence between 0 and 100),
  risk_score      integer not null check (risk_score between 0 and 100),
  rationale       jsonb not null,
  references_list jsonb,
  next_steps      jsonb,
  created_at      timestamptz default now()
);
create index if not exists idx_legal_results_user on public.legal_eligibility_results (user_id);
create index if not exists idx_legal_results_state_verdict on public.legal_eligibility_results (state, verdict);

-- ---------------------------------------------------------------------------
-- 3. Articles (FAQ + programmatic SEO)
-- ---------------------------------------------------------------------------
create table if not exists public.legal_articles (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  summary          text,
  body_md          text not null,
  state            text,                       -- nullable: pan-India articles too
  topic            text not null,              -- nri | conversion | document | rtc | mutation | ...
  land_types       text[],
  reading_minutes  integer default 5,
  reviewed_by      text,
  reviewed_at      timestamptz,
  published        boolean not null default false,
  seo_title        text,
  seo_description  text,
  schema_data      jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists idx_legal_articles_state_topic on public.legal_articles (state, topic);
create index if not exists idx_legal_articles_pub_updated on public.legal_articles (published, updated_at desc);

-- ---------------------------------------------------------------------------
-- 4. Mock lawyer directory (becomes real in Phase 2)
-- ---------------------------------------------------------------------------
create table if not exists public.lawyers (
  id                            uuid primary key default gen_random_uuid(),
  name                          text not null,
  photo_url                     text,
  bar_reg_placeholder           text,          -- not validated in MVP
  state                         text not null,
  districts                     text[],
  languages                     text[] not null,
  practice_areas                text[] not null,
  experience_years              integer,
  specializations               text[],        -- agri | nri | conversion | document_review | ...
  consultation_modes            text[],        -- phone | video | in_person
  consultation_fee_placeholder  integer,       -- rupees; not real pricing
  verification_badge            text,          -- pending | verified  (mock data: verified)
  rating_placeholder            numeric,       -- not real ratings
  bio                           text,
  is_mock                       boolean not null default true,
  published                     boolean not null default true,
  created_at                    timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 5. Service packages (mock pricing in MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.legal_services (
  id                          uuid primary key default gen_random_uuid(),
  slug                        text unique not null,
  name                        text not null,
  description                 text,
  included_items              text[] not null,
  target_users                text[] not null, -- buyer | nri | agent | seller
  required_documents          text[],
  turnaround_days_min         integer,
  turnaround_days_max         integer,
  starting_price_placeholder  integer,         -- rupees; not real pricing
  display_order               integer default 0,
  published                   boolean not null default true,
  created_at                  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 6. Lead capture (sensitive — server-read only)
-- ---------------------------------------------------------------------------
create table if not exists public.legal_inquiries (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  name                text not null,
  phone               text not null,
  whatsapp            text,
  email               text,
  state               text,
  district            text,
  land_type           text,
  buyer_type          text,
  budget_range        text,
  legal_concern       text,
  related_result_id   uuid references public.legal_eligibility_results(id),
  related_service_slug text,
  related_lawyer_id   uuid references public.lawyers(id),
  source_page         text,
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  consent_given       boolean not null default false,
  consent_timestamp   timestamptz,
  status              text not null default 'new', -- new | contacted | routed | closed
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists idx_legal_inquiries_status_created on public.legal_inquiries (status, created_at desc);
create index if not exists idx_legal_inquiries_user on public.legal_inquiries (user_id);

-- ---------------------------------------------------------------------------
-- 7. Per-user due-diligence progress
-- ---------------------------------------------------------------------------
create table if not exists public.legal_dd_progress (
  user_id      uuid references auth.users(id) on delete cascade,
  scope_id     text,                            -- 'standalone' or a listing_id
  step_id      text not null,                   -- verify_ownership | verify_title_chain | ...
  completed    boolean not null default false,
  completed_at timestamptz,
  notes        text,
  primary key (user_id, scope_id, step_id)
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

-- legal_inquiries: insert-only for everyone; reads happen server-side only
-- (service-role bypasses RLS). No public select policy on purpose.
alter table public.legal_inquiries enable row level security;
drop policy if exists "insert legal inquiries" on public.legal_inquiries;
create policy "insert legal inquiries" on public.legal_inquiries for insert with check (true);

-- legal_eligibility_results: anyone can insert; owners (and anon rows) can read own.
alter table public.legal_eligibility_results enable row level security;
drop policy if exists "anyone insert results" on public.legal_eligibility_results;
create policy "anyone insert results" on public.legal_eligibility_results for insert with check (true);
drop policy if exists "owner read own results" on public.legal_eligibility_results;
create policy "owner read own results" on public.legal_eligibility_results for select using (auth.uid() = user_id or user_id is null);

-- legal_dd_progress: each user manages only their own rows.
alter table public.legal_dd_progress enable row level security;
drop policy if exists "user manages own dd progress" on public.legal_dd_progress;
create policy "user manages own dd progress" on public.legal_dd_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public-readable reference tables (no PII): only published rows are visible.
alter table public.legal_state_rules enable row level security;
drop policy if exists "public read published states" on public.legal_state_rules;
create policy "public read published states" on public.legal_state_rules for select using (published = true);

alter table public.legal_articles enable row level security;
drop policy if exists "public read published articles" on public.legal_articles;
create policy "public read published articles" on public.legal_articles for select using (published = true);

alter table public.lawyers enable row level security;
drop policy if exists "public read published lawyers" on public.lawyers;
create policy "public read published lawyers" on public.lawyers for select using (published = true);

alter table public.legal_services enable row level security;
drop policy if exists "public read published services" on public.legal_services;
create policy "public read published services" on public.legal_services for select using (published = true);

-- Tell PostgREST to reload its schema cache so the new tables are queryable.
notify pgrst, 'reload schema';
