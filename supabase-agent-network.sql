-- ============================================================================
-- Acrehub — Agent Network  ·  Phase 1 foundation schema
-- Spec: docs/agent-network-spec-build-ready.md  (section 3)
-- ----------------------------------------------------------------------------
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: tables use IF NOT EXISTS; policies are dropped & recreated.
--
-- ADAPTED TO THIS PROJECT (differs from the raw spec on purpose):
--   * Reuses the existing public.is_admin() helper (this DB keys admins on
--     profiles.user_id, not profiles.id as the spec assumed).
--   * The listings geom trigger reads latitude/longitude (this DB's real
--     column names), not lat/lng.
--   * Agent phone/email/admin_notes are NOT publicly readable. The base
--     agent_profiles table is admin-only; a public_agents VIEW exposes only
--     safe columns for the public directory.
--   * The price_benchmarks materialized view from the spec is DEFERRED — it
--     reads a listings.price_per_acre column that does not exist here. See the
--     TODO block at the bottom.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Required Postgres extensions
--    pgcrypto: gen_random_uuid() (already used elsewhere)
--    pg_trgm:  text similarity for duplicate detection (Phase 1 processing)
--    postgis:  GPS-proximity duplicate detection + listings.geom
--    All three are available on Supabase; enabling is free.
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists postgis;

-- Generic updated_at trigger fn, namespaced so it can't clash with an existing
-- set_updated_at() used by other tables.
create or replace function public.agent_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- 1. agent_profiles
-- ---------------------------------------------------------------------------
create table if not exists public.agent_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  display_name text,
  phone text unique not null,
  whatsapp text,
  email text,
  profile_photo_url text,

  -- Location
  city text,
  state text not null,
  district text not null,
  taluka text,

  -- Capability
  languages text[] default array['english']::text[],
  agent_type text default 'village_agent' check (agent_type in (
    'village_agent', 'broker', 'land_aggregator',
    'farm_plot_channel_partner', 'developer_sales_partner',
    'legal_document_consultant', 'land_consultant', 'other'
  )),
  years_experience numeric,
  bio text,
  specializations text[] default array[]::text[],
  land_types_handled text[] default array[]::text[],

  -- Trust and status
  verification_status text default 'pending_review' check (verification_status in (
    'pending_review', 'phone_verified', 'id_submitted',
    'verified', 'territory_verified', 'suspended', 'rejected'
  )),
  profile_status text default 'draft' check (profile_status in (
    'draft', 'active', 'hidden', 'suspended', 'archived'
  )),
  admin_notes text,
  trust_tier integer default 1 check (trust_tier between 1 and 5),
  auto_publish_listings boolean default false,

  -- Learned attributes (recomputed nightly from agent_events)
  observed_primary_district text,
  observed_primary_taluka text,
  observed_price_min_per_acre bigint,
  observed_price_max_per_acre bigint,
  observed_acreage_min numeric,
  observed_acreage_max numeric,
  accuracy_score numeric default 0.5,
  recent_submissions_count integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_agent_profiles_phone on public.agent_profiles(phone);
create index if not exists idx_agent_profiles_geo on public.agent_profiles(state, district, taluka);
create index if not exists idx_agent_profiles_verification on public.agent_profiles(verification_status);
create index if not exists idx_agent_profiles_status on public.agent_profiles(profile_status);
create index if not exists idx_agent_profiles_slug on public.agent_profiles(slug);

drop trigger if exists trg_agent_profiles_updated_at on public.agent_profiles;
create trigger trg_agent_profiles_updated_at
  before update on public.agent_profiles
  for each row execute function public.agent_set_updated_at();

-- RLS: base table is ADMIN-ONLY. Public access is via public_agents view below,
-- so sensitive columns (phone, email, admin_notes) are never exposed publicly.
alter table public.agent_profiles enable row level security;
drop policy if exists "admin all agents" on public.agent_profiles;
create policy "admin all agents" on public.agent_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. agent_territories
-- ---------------------------------------------------------------------------
create table if not exists public.agent_territories (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agent_profiles(id) on delete cascade,
  state text not null,
  district text not null,
  taluka text,
  villages text[] default array[]::text[],
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_agent_territories_agent on public.agent_territories(agent_id);
create index if not exists idx_agent_territories_geo on public.agent_territories(state, district, taluka);

alter table public.agent_territories enable row level security;
drop policy if exists "public read territories of active agents" on public.agent_territories;
create policy "public read territories of active agents" on public.agent_territories
  for select using (
    exists (
      select 1 from public.agent_profiles
      where agent_profiles.id = agent_territories.agent_id
        and agent_profiles.profile_status = 'active'
    )
  );
drop policy if exists "admin write territories" on public.agent_territories;
create policy "admin write territories" on public.agent_territories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. whatsapp_inbox  (admin-only — contains raw agent messages + PII)
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_inbox (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null default gen_random_uuid(),
  sender_phone text not null,
  agent_id uuid references public.agent_profiles(id),

  -- Content
  raw_message text not null,
  voice_note_url text,
  voice_transcript text,
  voice_duration_seconds integer,
  media_urls text[] default array[]::text[],
  location_lat numeric,
  location_lng numeric,
  received_at timestamptz default now(),
  language_detected text,

  -- Parsing
  parsed_payload jsonb,
  parsing_status text default 'pending' check (parsing_status in (
    'pending', 'parsed', 'parsing_failed', 'not_a_listing'
  )),
  parsing_confidence text check (parsing_confidence in ('high', 'medium', 'low')),
  parsing_cost_inr numeric default 0,

  -- Clarification dialogue
  missing_critical_fields text[],
  clarification_questions text[],
  clarification_sent_at timestamptz,
  clarification_reply_received boolean default false,

  -- Duplicate detection
  duplicate_check_status text default 'pending' check (duplicate_check_status in (
    'pending', 'clean', 'duplicate_suspected', 'duplicate_confirmed'
  )),
  duplicate_of_listing_id uuid references public.listings(id),
  similarity_score numeric,

  -- Price sanity
  price_unusual boolean default false,
  district_median_price_per_acre bigint,

  -- Matching
  matched_buyer_requirements jsonb,

  -- Workflow
  processed_status text default 'inbox' check (processed_status in (
    'inbox', 'awaiting_clarification', 'in_progress',
    'listing_drafted', 'published', 'rejected', 'duplicate_merged', 'archived'
  )),
  resulting_listing_id uuid references public.listings(id),
  admin_notes text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_inbox_sender on public.whatsapp_inbox(sender_phone);
create index if not exists idx_inbox_conversation on public.whatsapp_inbox(conversation_id);
create index if not exists idx_inbox_agent on public.whatsapp_inbox(agent_id);
create index if not exists idx_inbox_status on public.whatsapp_inbox(processed_status);
create index if not exists idx_inbox_received on public.whatsapp_inbox(received_at desc);

alter table public.whatsapp_inbox enable row level security;
drop policy if exists "admins only inbox" on public.whatsapp_inbox;
create policy "admins only inbox" on public.whatsapp_inbox
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. mobile_submissions  (stub for Phase 4; admin-only)
--    land_record_id FK is added after land_records exists (below).
-- ---------------------------------------------------------------------------
create table if not exists public.mobile_submissions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agent_profiles(id),
  submitted_at timestamptz default now(),

  state text not null,
  district text not null,
  taluka text not null,
  village text not null,
  survey_number text,
  sub_division text,
  land_record_id uuid,  -- FK added in section 5

  land_type text,
  acreage numeric,
  acreage_unit text,
  price_per_acre bigint,
  water_source text,
  road_access text,
  electricity text,

  media_urls text[],
  voice_note_url text,
  voice_transcript text,

  processed_status text default 'inbox',
  resulting_listing_id uuid references public.listings(id),
  admin_notes text,
  processed_at timestamptz
);

create index if not exists idx_mobile_agent on public.mobile_submissions(agent_id);
create index if not exists idx_mobile_status on public.mobile_submissions(processed_status);

alter table public.mobile_submissions enable row level security;
drop policy if exists "admins only mobile submissions" on public.mobile_submissions;
create policy "admins only mobile submissions" on public.mobile_submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. land_records  (+ mobile_submissions FK)
--    Public-read policy is deferred to section 9 (needs listings.land_record_id).
-- ---------------------------------------------------------------------------
create table if not exists public.land_records (
  id uuid primary key default gen_random_uuid(),

  state text not null,
  district text not null,
  taluka text not null,
  village text not null,
  survey_number text not null,
  sub_division text,

  source text not null check (source in (
    'manual', 'landeed', 'tamilnilam', 'bhoomi', 'dharani',
    'meebhoomi', 'mahabhulekh', 'relis', 'other'
  )),
  retrieved_at timestamptz not null,
  expires_at timestamptz not null,

  owners jsonb,
  extent_value numeric,
  extent_unit text,
  classification text,
  fmb_sketch_url text,
  parent_document text,
  encumbrance_status text,
  raw_payload jsonb,
  fetch_cost_inr numeric default 0,

  created_at timestamptz default now()
);

create unique index if not exists uniq_land_record on public.land_records(
  state, district, taluka, village, survey_number, coalesce(sub_division, '')
);
create index if not exists idx_land_records_geo on public.land_records(state, district, taluka, village, survey_number);

-- Add the FK on mobile_submissions now that land_records exists.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fk_mobile_land_record'
  ) then
    alter table public.mobile_submissions
      add constraint fk_mobile_land_record
      foreign key (land_record_id) references public.land_records(id);
  end if;
end $$;

alter table public.land_records enable row level security;
drop policy if exists "admin all land records" on public.land_records;
create policy "admin all land records" on public.land_records
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. agent_listing_links
-- ---------------------------------------------------------------------------
create table if not exists public.agent_listing_links (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agent_profiles(id),
  listing_id uuid not null references public.listings(id) on delete cascade,
  relationship text not null check (relationship in (
    'primary_agent', 'co_broker', 'source_agent', 'seller_agent', 'uploader'
  )),
  is_primary boolean default false,
  source_protected boolean default true,
  commission_expectation text,
  co_broking_terms text,
  added_at timestamptz default now()
);

create unique index if not exists uniq_agent_listing_rel on public.agent_listing_links(agent_id, listing_id, relationship);
create index if not exists idx_listing_links_listing on public.agent_listing_links(listing_id);

alter table public.agent_listing_links enable row level security;
drop policy if exists "public read primary agent links for active listings" on public.agent_listing_links;
create policy "public read primary agent links for active listings" on public.agent_listing_links
  for select using (
    relationship = 'primary_agent'
    and exists (
      select 1 from public.listings
      where listings.id = agent_listing_links.listing_id
        and listings.status = 'active'
    )
  );
drop policy if exists "admin all listing links" on public.agent_listing_links;
create policy "admin all listing links" on public.agent_listing_links
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. agent_events  (admin-only)
-- ---------------------------------------------------------------------------
create table if not exists public.agent_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agent_profiles(id),
  event_type text not null check (event_type in (
    'submission_received', 'submission_parsed',
    'clarification_sent', 'clarification_reply_received',
    'listing_published', 'admin_correction',
    'lead_delivered', 'lead_response',
    'auto_publish_triggered', 'duplicate_detected',
    'price_anomaly_detected', 'agent_suspended'
  )),
  listing_id uuid references public.listings(id),
  inbox_id uuid references public.whatsapp_inbox(id),
  mobile_submission_id uuid references public.mobile_submissions(id),
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_events_agent_time on public.agent_events(agent_id, created_at desc);
create index if not exists idx_events_type on public.agent_events(event_type);

alter table public.agent_events enable row level security;
drop policy if exists "admins only events" on public.agent_events;
create policy "admins only events" on public.agent_events
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 8. outbound_messages  (admin-only)
-- ---------------------------------------------------------------------------
create table if not exists public.outbound_messages (
  id uuid primary key default gen_random_uuid(),
  to_phone text not null,
  agent_id uuid references public.agent_profiles(id),
  channel text not null check (channel in ('whatsapp', 'sms')),
  message_text text not null,
  template_used text,
  context jsonb,
  status text default 'pending' check (status in (
    'pending', 'sent_manually', 'sent_via_bsp', 'failed'
  )),
  sent_at timestamptz,
  bsp_message_id text,
  created_at timestamptz default now()
);

create index if not exists idx_outbound_agent on public.outbound_messages(agent_id);
create index if not exists idx_outbound_status on public.outbound_messages(status);

alter table public.outbound_messages enable row level security;
drop policy if exists "admins only outbound" on public.outbound_messages;
create policy "admins only outbound" on public.outbound_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 9. listings additions  (additive; all nullable / defaulted)
-- ---------------------------------------------------------------------------
alter table public.listings add column if not exists agent_id uuid references public.agent_profiles(id);
alter table public.listings add column if not exists source_type text default 'web' check (source_type in (
  'web', 'whatsapp', 'mobile_app', 'admin_manual', 'bulk'
));
alter table public.listings add column if not exists inbox_id uuid references public.whatsapp_inbox(id);
alter table public.listings add column if not exists mobile_submission_id uuid references public.mobile_submissions(id);
alter table public.listings add column if not exists land_record_id uuid references public.land_records(id);
alter table public.listings add column if not exists survey_number_clean text;
alter table public.listings add column if not exists location_visibility text default 'public' check (location_visibility in (
  'public', 'approximate', 'admin_only', 'qualified_buyer_only'
));
alter table public.listings add column if not exists survey_number_visibility text default 'public' check (survey_number_visibility in (
  'public', 'qualified_buyer_only', 'admin_only', 'hidden'
));

create index if not exists idx_listings_agent on public.listings(agent_id);
create index if not exists idx_listings_source on public.listings(source_type);
create index if not exists idx_listings_survey_clean on public.listings(survey_number_clean);

-- GPS-proximity duplicate detection needs a geography column on listings.
alter table public.listings add column if not exists geom geography(point, 4326);
create index if not exists idx_listings_geom on public.listings using gist(geom);

-- Populate geom from THIS DB's real latitude/longitude columns.
create or replace function public.listings_set_geom() returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.geom = st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_listings_set_geom on public.listings;
create trigger trg_listings_set_geom
  before insert or update on public.listings
  for each row execute function public.listings_set_geom();

-- Backfill geom for existing rows that have coordinates.
update public.listings
  set geom = st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
  where latitude is not null and longitude is not null and geom is null;

-- Now-safe public-read policy for land_records linked to active listings.
drop policy if exists "public read land_records of active listings" on public.land_records;
create policy "public read land_records of active listings" on public.land_records
  for select using (
    exists (
      select 1 from public.listings
      where listings.land_record_id = land_records.id
        and listings.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- 10. public_agents VIEW — safe public projection of agent_profiles.
--     Excludes phone, whatsapp, email, admin_notes, accuracy_score and other
--     sensitive/internal fields. The public agent directory reads from here.
--     (A plain view runs with the owner's rights, so it bypasses the
--     admin-only RLS on the base table while exposing only these columns.)
-- ---------------------------------------------------------------------------
create or replace view public.public_agents as
select
  id, slug, name, display_name, profile_photo_url,
  city, state, district, taluka,
  languages, agent_type, years_experience, bio,
  specializations, land_types_handled,
  verification_status, trust_tier,
  created_at
from public.agent_profiles
where profile_status = 'active'
  and verification_status in ('verified', 'phone_verified', 'id_submitted', 'territory_verified');

grant select on public.public_agents to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 11. DEFERRED — price_benchmarks materialized view
-- ---------------------------------------------------------------------------
-- The spec's price_benchmarks view aggregates listings.price_per_acre, a column
-- this project does NOT have. Prices here are stored as `price` (integer rupees)
-- with `price_basis` ('total'|'per_acre'|'per_guntha'|'per_sqft') and
-- `area_value` + `area_unit`. Deriving a normalized per-acre price requires a
-- deliberate conversion decision (units differ by state). Deferred until the
-- price-sanity feature is built (Phase 2). Do NOT uncomment as-is — it will fail.
--
-- TODO(price-sanity): add a normalized listings.price_per_acre (generated or
-- backfilled) or compute per-acre in SQL from price/price_basis/area_*, then
-- create the materialized view + refresh_price_benchmarks() function.

-- Tell PostgREST to reload its schema cache so the new tables/view are queryable.
notify pgrst, 'reload schema';
