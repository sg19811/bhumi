# Acrehub Agent Network — Build-Ready Spec

**Status:** Build-ready. Replaces agent-network-spec-v2.md.
**Build approach:** WhatsApp-first. Mobile app comes later.
**Total estimated build time:** ~12 weeks across 5 phases.

---

## How to use this spec

This document is meant to be consumed by Claude Code, one phase at a time. Each phase contains multiple **build prompts**. Each prompt is self-contained: it tells Claude exactly what to build, what acceptance criteria to meet, and what to verify before declaring it done.

**Workflow for each prompt:**
1. In Claude Code (`claude --permission-mode auto`), paste the prompt verbatim
2. Let Claude implement
3. Walk through the **Definition of Done** at the end of each prompt manually
4. Only move to the next prompt when all checks pass
5. Commit with the suggested commit message
6. Git push at the end of each phase, not after every prompt

**Important reading order before starting any prompt:**
- `CLAUDE.md` (project conventions)
- `docs/project-architecture.md`
- `docs/project-tracker.md`
- This spec file
- Any phase-specific sections referenced in the prompt

---

# Table of Contents

1. [Strategic context](#1-strategic-context)
2. [Architecture overview](#2-architecture-overview)
3. [Complete database schema](#3-complete-database-schema)
4. [TypeScript types reference](#4-typescript-types-reference)
5. [API contracts](#5-api-contracts)
6. [Message templates](#6-message-templates)
7. [Claude parsing system prompts](#7-claude-parsing-system-prompts)
8. [Component specifications](#8-component-specifications)
9. [Algorithm reference](#9-algorithm-reference)
10. [Phase 1 build prompts](#10-phase-1-build-prompts)
11. [Phase 2 build prompts](#11-phase-2-build-prompts)
12. [Phase 3 build prompts](#12-phase-3-build-prompts)
13. [Phase 4 build prompts](#13-phase-4-build-prompts)
14. [Phase 5 build prompts](#14-phase-5-build-prompts)
15. [Operational runbook](#15-operational-runbook)
16. [Compliance and disclaimers](#16-compliance-and-disclaimers)

---

# 1. Strategic context

Acrehub is an India-first agricultural land marketplace. The Agent Network module adds an agent-centric supply layer.

**Core insight:** Indian land agents use WhatsApp, not dashboards. Build the WhatsApp ingestion pipeline first; build agent-facing UI only when validated.

**Three input channels (now and future):**
- **WhatsApp** — Phase 1, primary channel
- **Mobile PWA** — Phase 4, button-driven structured input
- **Web form** — already exists, low volume

All three write to the same `listings` table via channel-specific intake tables. The same admin tooling reviews all of them.

**Five hard rules across all phases:**
1. Do not break existing flows. Additive only.
2. Strict RLS. No service-role key in client components.
3. No new npm packages without explicit approval.
4. Owner phone/email never publicly readable.
5. Every AI/external API call has cost logging and rate limits.

---

# 2. Architecture overview

## 2.1 Data flow at a glance

```
[Agent's WhatsApp message]
        |
        v
[Manual admin form OR BSP webhook]
        |
        v
[Insert into whatsapp_inbox table]
        |
   +----+----+
   |         |
   v         v
[Whisper]   [Claude Haiku parsing]
voice→text   text→structured JSON
   |         |
   +----+----+
        |
        v
[Duplicate detection (DB)]
   +----+----+
   |         |
   v         v
[Buyer matching][Price sanity]
   |         |
   +----+----+
        |
        v
[Admin reviews in processor UI]
        |
        v
[Publish: create listing, link agent, send confirmation]
```

## 2.2 Tech stack (already established)

- Next.js 16 App Router, TypeScript, Tailwind, Supabase Postgres/Auth/Storage, Vercel
- Leaflet/OSM, no Google Maps
- Server components for SEO pages; client components for interactive admin
- Claude API: `claude-haiku-4-5` for parsing
- OpenAI Whisper API for voice transcription
- Postgres extensions used: `pgcrypto` (UUIDs), `pg_trgm` (text similarity), `postgis` (GPS proximity), `pgvector` (deferred to Phase 5)

## 2.3 Module-level architecture

```
app/
├── agents/                    [public agent pages]
│   ├── page.tsx               (directory)
│   ├── join/page.tsx          (application form)
│   ├── [slug]/page.tsx        (public profile)
│   ├── [state]/...            (SEO geo pages)
│   ├── how-it-works/page.tsx
│   └── whatsapp/page.tsx
│
├── admin/                     [internal team tools]
│   ├── whatsapp/
│   │   ├── inbox/page.tsx     (list)
│   │   ├── inbox/[id]/page.tsx (PROCESSOR — workhorse)
│   │   ├── inbox/new/page.tsx (manual paste form)
│   │   ├── clarifications/page.tsx
│   │   └── duplicates/page.tsx
│   ├── mobile/inbox/page.tsx
│   ├── agents/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── applications/page.tsx
│   ├── land-records/page.tsx
│   ├── listings/pending/page.tsx
│   └── outbound-messages/page.tsx
│
├── api/                       [server endpoints]
│   ├── whatsapp/
│   │   ├── parse/route.ts
│   │   ├── transcribe/route.ts
│   │   ├── clarify/route.ts
│   │   └── inbox-to-listing/route.ts
│   ├── agents/apply/route.ts
│   ├── land-records/fetch/route.ts
│   ├── duplicates/check/route.ts
│   └── matching/buyers/route.ts
│
├── components/                [UI components]
│   ├── agents/...
│   └── admin/...
│
└── lib/                       [pure logic + API wrappers]
    ├── agent-types.ts
    ├── agent-matching.ts
    ├── agent-scoring.ts
    ├── agent-learning.ts
    ├── whatsapp-parsing.ts
    ├── whatsapp-transcribe.ts
    ├── whatsapp-clarify.ts
    ├── duplicates.ts
    ├── price-benchmarks.ts
    └── land-records/...
```

---

# 3. Complete database schema

All migrations live in `supabase/migrations/`. Naming: `{YYYYMMDDHHMMSS}_{description}.sql`.

## 3.1 Required Postgres extensions

```sql
-- Run once if not already enabled:
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists postgis;
```

## 3.2 Migration 1 — agent_profiles

```sql
create table agent_profiles (
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

create index idx_agent_profiles_phone on agent_profiles(phone);
create index idx_agent_profiles_geo on agent_profiles(state, district, taluka);
create index idx_agent_profiles_verification on agent_profiles(verification_status);
create index idx_agent_profiles_status on agent_profiles(profile_status);
create index idx_agent_profiles_slug on agent_profiles(slug);

-- Trigger to keep updated_at fresh
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_agent_profiles_updated_at
  before update on agent_profiles
  for each row execute function set_updated_at();

-- RLS
alter table agent_profiles enable row level security;

create policy "public can read active verified agents"
  on agent_profiles for select
  using (
    profile_status = 'active'
    and verification_status in ('verified', 'phone_verified', 'id_submitted', 'territory_verified')
  );

create policy "admins can read all agents"
  on agent_profiles for select
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "admins can write agents"
  on agent_profiles for all
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
```

## 3.3 Migration 2 — agent_territories

```sql
create table agent_territories (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agent_profiles(id) on delete cascade,
  state text not null,
  district text not null,
  taluka text,
  villages text[] default array[]::text[],
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index idx_agent_territories_agent on agent_territories(agent_id);
create index idx_agent_territories_geo on agent_territories(state, district, taluka);

alter table agent_territories enable row level security;

create policy "public can read territories of active agents"
  on agent_territories for select
  using (
    exists (
      select 1 from agent_profiles
      where agent_profiles.id = agent_territories.agent_id
        and agent_profiles.profile_status = 'active'
    )
  );

create policy "admins can write territories"
  on agent_territories for all
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
```

## 3.4 Migration 3 — whatsapp_inbox

```sql
create table whatsapp_inbox (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null default gen_random_uuid(),
  sender_phone text not null,
  agent_id uuid references agent_profiles(id),

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
  parsing_confidence text check (parsing_confidence in (
    'high', 'medium', 'low'
  )),
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
  duplicate_of_listing_id uuid references listings(id),
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
  resulting_listing_id uuid references listings(id),
  admin_notes text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz default now()
);

create index idx_inbox_sender on whatsapp_inbox(sender_phone);
create index idx_inbox_conversation on whatsapp_inbox(conversation_id);
create index idx_inbox_agent on whatsapp_inbox(agent_id);
create index idx_inbox_status on whatsapp_inbox(processed_status);
create index idx_inbox_received on whatsapp_inbox(received_at desc);

alter table whatsapp_inbox enable row level security;

create policy "admins only - inbox"
  on whatsapp_inbox for all
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
```

## 3.5 Migration 4 — mobile_submissions (stub for Phase 4)

```sql
create table mobile_submissions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agent_profiles(id),
  submitted_at timestamptz default now(),

  state text not null,
  district text not null,
  taluka text not null,
  village text not null,
  survey_number text,
  sub_division text,
  land_record_id uuid,  -- foreign key added in migration 5

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
  resulting_listing_id uuid references listings(id),
  admin_notes text,
  processed_at timestamptz
);

create index idx_mobile_agent on mobile_submissions(agent_id);
create index idx_mobile_status on mobile_submissions(processed_status);

alter table mobile_submissions enable row level security;

create policy "admins only - mobile submissions"
  on mobile_submissions for all
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
```

## 3.6 Migration 5 — land_records

```sql
create table land_records (
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

create unique index uniq_land_record on land_records(
  state, district, taluka, village, survey_number, coalesce(sub_division, '')
);
create index idx_land_records_geo on land_records(state, district, taluka, village, survey_number);

-- Now add the FK on mobile_submissions
alter table mobile_submissions
  add constraint fk_mobile_land_record
  foreign key (land_record_id) references land_records(id);

alter table land_records enable row level security;

create policy "public can read land_records linked to active listings"
  on land_records for select
  using (
    exists (
      select 1 from listings
      where listings.land_record_id = land_records.id
        and listings.status = 'active'
    )
  );

create policy "admins full access - land records"
  on land_records for all
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
```

## 3.7 Migration 6 — agent_listing_links

```sql
create table agent_listing_links (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agent_profiles(id),
  listing_id uuid not null references listings(id) on delete cascade,
  relationship text not null check (relationship in (
    'primary_agent', 'co_broker', 'source_agent', 'seller_agent', 'uploader'
  )),
  is_primary boolean default false,
  source_protected boolean default true,
  commission_expectation text,
  co_broking_terms text,
  added_at timestamptz default now()
);

create unique index uniq_agent_listing_rel on agent_listing_links(agent_id, listing_id, relationship);
create index idx_listing_links_listing on agent_listing_links(listing_id);

alter table agent_listing_links enable row level security;

create policy "public can read primary agent links for active listings"
  on agent_listing_links for select
  using (
    relationship = 'primary_agent'
    and exists (
      select 1 from listings
      where listings.id = agent_listing_links.listing_id
        and listings.status = 'active'
    )
  );

create policy "admins full access - listing links"
  on agent_listing_links for all
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
```

## 3.8 Migration 7 — agent_events

```sql
create table agent_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agent_profiles(id),
  event_type text not null check (event_type in (
    'submission_received', 'submission_parsed',
    'clarification_sent', 'clarification_reply_received',
    'listing_published', 'admin_correction',
    'lead_delivered', 'lead_response',
    'auto_publish_triggered', 'duplicate_detected',
    'price_anomaly_detected', 'agent_suspended'
  )),
  listing_id uuid references listings(id),
  inbox_id uuid references whatsapp_inbox(id),
  mobile_submission_id uuid references mobile_submissions(id),
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_events_agent_time on agent_events(agent_id, created_at desc);
create index idx_events_type on agent_events(event_type);

alter table agent_events enable row level security;

create policy "admins only - events"
  on agent_events for all
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
```

## 3.9 Migration 8 — outbound_messages

```sql
create table outbound_messages (
  id uuid primary key default gen_random_uuid(),
  to_phone text not null,
  agent_id uuid references agent_profiles(id),
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

create index idx_outbound_agent on outbound_messages(agent_id);
create index idx_outbound_status on outbound_messages(status);

alter table outbound_messages enable row level security;

create policy "admins only - outbound"
  on outbound_messages for all
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
```

## 3.10 Migration 9 — listings additions

```sql
alter table listings add column if not exists agent_id uuid references agent_profiles(id);
alter table listings add column if not exists source_type text default 'web' check (source_type in (
  'web', 'whatsapp', 'mobile_app', 'admin_manual', 'bulk'
));
alter table listings add column if not exists inbox_id uuid references whatsapp_inbox(id);
alter table listings add column if not exists mobile_submission_id uuid references mobile_submissions(id);
alter table listings add column if not exists land_record_id uuid references land_records(id);
alter table listings add column if not exists survey_number_clean text;
alter table listings add column if not exists location_visibility text default 'public' check (location_visibility in (
  'public', 'approximate', 'admin_only', 'qualified_buyer_only'
));
alter table listings add column if not exists survey_number_visibility text default 'public' check (survey_number_visibility in (
  'public', 'qualified_buyer_only', 'admin_only', 'hidden'
));

create index if not exists idx_listings_agent on listings(agent_id);
create index if not exists idx_listings_source on listings(source_type);
create index if not exists idx_listings_survey_clean on listings(survey_number_clean);

-- For GPS-proximity duplicate detection, listings need a geom column.
-- If it doesn't already exist:
alter table listings add column if not exists geom geography(point, 4326);

create index if not exists idx_listings_geom on listings using gist(geom);

-- Trigger to populate geom from lat/lng on insert/update if not set
create or replace function listings_set_geom() returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.geom = st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_listings_set_geom on listings;
create trigger trg_listings_set_geom
  before insert or update on listings
  for each row execute function listings_set_geom();
```

## 3.11 Migration 10 — price_benchmarks materialized view

```sql
create materialized view price_benchmarks as
select
  state,
  district,
  taluka,
  land_type,
  count(*)::integer as listing_count,
  percentile_cont(0.5) within group (order by price_per_acre)::bigint as median_price_per_acre,
  percentile_cont(0.25) within group (order by price_per_acre)::bigint as p25_price_per_acre,
  percentile_cont(0.75) within group (order by price_per_acre)::bigint as p75_price_per_acre,
  min(price_per_acre)::bigint as min_price_per_acre,
  max(price_per_acre)::bigint as max_price_per_acre
from listings
where price_per_acre is not null
  and status = 'active'
group by state, district, taluka, land_type
having count(*) >= 5;

create unique index uniq_price_benchmarks on price_benchmarks(
  state, coalesce(district, ''), coalesce(taluka, ''), coalesce(land_type, '')
);

-- Refresh function (called by scheduled job)
create or replace function refresh_price_benchmarks() returns void as $$
begin
  refresh materialized view concurrently price_benchmarks;
end;
$$ language plpgsql;
```

## 3.12 Helper function — is_admin

Many policies reference `profiles.role = 'admin'`. If your existing schema uses a different mechanism, adapt accordingly. Create a helper for clarity:

```sql
create or replace function is_admin() returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
end;
$$ language plpgsql security definer stable;
```

Replace all `exists (select 1 from profiles ...)` policies above with `is_admin()` for readability.

---

# 4. TypeScript types reference

All types live in `app/lib/agent-types.ts`. Import elsewhere from there.

```typescript
// =====================================================
// AGENT TYPES
// =====================================================

export type AgentType =
  | 'village_agent' | 'broker' | 'land_aggregator'
  | 'farm_plot_channel_partner' | 'developer_sales_partner'
  | 'legal_document_consultant' | 'land_consultant' | 'other';

export type VerificationStatus =
  | 'pending_review' | 'phone_verified' | 'id_submitted'
  | 'verified' | 'territory_verified' | 'suspended' | 'rejected';

export type ProfileStatus =
  | 'draft' | 'active' | 'hidden' | 'suspended' | 'archived';

export interface AgentProfile {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  profile_photo_url: string | null;
  city: string | null;
  state: string;
  district: string;
  taluka: string | null;
  languages: string[];
  agent_type: AgentType;
  years_experience: number | null;
  bio: string | null;
  specializations: string[];
  land_types_handled: string[];
  verification_status: VerificationStatus;
  profile_status: ProfileStatus;
  admin_notes: string | null;
  trust_tier: 1 | 2 | 3 | 4 | 5;
  auto_publish_listings: boolean;
  observed_primary_district: string | null;
  observed_primary_taluka: string | null;
  observed_price_min_per_acre: number | null;
  observed_price_max_per_acre: number | null;
  observed_acreage_min: number | null;
  observed_acreage_max: number | null;
  accuracy_score: number;
  recent_submissions_count: number;
  created_at: string;
  updated_at: string;
}

export interface AgentTerritory {
  id: string;
  agent_id: string;
  state: string;
  district: string;
  taluka: string | null;
  villages: string[];
  is_primary: boolean;
  created_at: string;
}

// =====================================================
// WHATSAPP INBOX TYPES
// =====================================================

export type ParsingStatus = 'pending' | 'parsed' | 'parsing_failed' | 'not_a_listing';
export type ParsingConfidence = 'high' | 'medium' | 'low';
export type DuplicateStatus = 'pending' | 'clean' | 'duplicate_suspected' | 'duplicate_confirmed';
export type ProcessedStatus =
  | 'inbox' | 'awaiting_clarification' | 'in_progress'
  | 'listing_drafted' | 'published' | 'rejected'
  | 'duplicate_merged' | 'archived';

export interface WhatsAppInboxRow {
  id: string;
  conversation_id: string;
  sender_phone: string;
  agent_id: string | null;
  raw_message: string;
  voice_note_url: string | null;
  voice_transcript: string | null;
  voice_duration_seconds: number | null;
  media_urls: string[];
  location_lat: number | null;
  location_lng: number | null;
  received_at: string;
  language_detected: string | null;
  parsed_payload: ParsedSubmission | null;
  parsing_status: ParsingStatus;
  parsing_confidence: ParsingConfidence | null;
  parsing_cost_inr: number;
  missing_critical_fields: string[] | null;
  clarification_questions: string[] | null;
  clarification_sent_at: string | null;
  clarification_reply_received: boolean;
  duplicate_check_status: DuplicateStatus;
  duplicate_of_listing_id: string | null;
  similarity_score: number | null;
  price_unusual: boolean;
  district_median_price_per_acre: number | null;
  matched_buyer_requirements: BuyerMatchResult[] | null;
  processed_status: ProcessedStatus;
  resulting_listing_id: string | null;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
}

// =====================================================
// PARSED SUBMISSION TYPES (Claude output schema)
// =====================================================

export type AcreageUnit = 'acres' | 'guntas' | 'cents' | 'ankanam' | 'ground' | 'kuncham';
export type LandType =
  | 'agricultural' | 'farm_plot' | 'farmhouse' | 'large_parcel'
  | 'plantation' | 'warehouse' | 'industrial' | 'other';

export type WaterSource = 'borewell' | 'open_well' | 'river' | 'canal' | 'none' | 'unknown';
export type RoadAccess = 'highway' | 'village_road' | 'kachha' | 'none' | 'unknown';
export type TitleStatus = 'clear' | 'unclear' | 'unknown';
export type ConversionStatus = 'done' | 'pending' | 'not_required' | 'unknown';
export type ElectricityStatus = 'available' | 'not_available' | 'unknown';
export type OwnerConsent = 'unknown' | 'verbal' | 'written' | 'owner_uploaded';

export interface ParsedListing {
  acreage: number | null;
  acreage_unit: AcreageUnit;
  acreage_confidence: ParsingConfidence;
  land_type: LandType;
  location: {
    state: string | null;
    district: string | null;
    taluka: string | null;
    village_or_landmark: string | null;
    survey_number: string | null;
    location_confidence: ParsingConfidence;
  };
  price: {
    total_inr: number | null;
    per_acre_inr: number | null;
    price_confidence: ParsingConfidence;
  };
  features: {
    water: WaterSource;
    road_access: RoadAccess;
    title_status: TitleStatus;
    conversion_status: ConversionStatus;
    electricity: ElectricityStatus;
    fence: boolean | null;
    trees_crops: string | null;
  };
  owner_info: {
    name_mentioned: string | null;
    phone_mentioned: string | null;
    consent_status: OwnerConsent;
  };
  raw_description: string;
  agent_notes_to_admin: string | null;
  missing_critical_fields: string[];
  clarification_questions: string[];
  language_detected: string;
}

export interface ParsedSubmission {
  intent: 'new_listing' | 'status_update' | 'price_change' | 'question' | 'unclear';
  listings: ParsedListing[];
  status_update_details: string | null;
}

// =====================================================
// MATCHING & DUPLICATES
// =====================================================

export interface BuyerMatchResult {
  buyer_interest_id: string;
  match_score: number;
  match_label: 'strong_match' | 'good_match' | 'possible_match';
  match_reasons: string[];
  buyer_phone_masked: string;  // never the full number in payload
}

export interface DuplicateCheckResult {
  is_duplicate_suspected: boolean;
  matched_listing_id: string | null;
  match_type: 'survey_number' | 'gps_proximity' | 'text_similarity' | null;
  similarity_score: number;  // 0.0 to 1.0
  evidence: string;  // human-readable
}

// =====================================================
// LAND RECORDS
// =====================================================

export interface LandRecordRequest {
  state: string;
  district: string;
  taluka: string;
  village: string;
  surveyNumber: string;
  subDivision?: string;
}

export interface LandRecordResult {
  id?: string;
  source: 'manual' | 'landeed' | 'tamilnilam' | 'bhoomi' | 'dharani' |
          'meebhoomi' | 'mahabhulekh' | 'relis' | 'other';
  retrievedAt: string;
  owners: Array<{ name: string; percentage?: number }>;
  extent: { value: number; unit: AcreageUnit | 'sqm' };
  classification: string | null;
  fmbSketchUrl: string | null;
  parentDocument: string | null;
  encumbranceStatus: 'clear' | 'has_encumbrance' | 'unknown' | null;
  rawPayload: object;
  fetchCostInr: number;
}

export interface LandRecordAdapter {
  state: string;
  source: LandRecordResult['source'];
  isAvailable(): boolean;
  fetch(req: LandRecordRequest): Promise<LandRecordResult>;
  costPerFetchInr(): number;
}
```

---

# 5. API contracts

Every API route lives under `app/api/`. All routes use Next.js Route Handlers (`route.ts`). All return JSON. Standard error shape:

```typescript
{ error: { code: string; message: string; details?: unknown } }
```

## 5.1 POST /api/whatsapp/parse

**Purpose:** Send a WhatsApp message to Claude for structured parsing.

**Request body:**
```typescript
{
  text: string;             // the message text (with voice transcript appended if any)
  agent_context?: {         // optional, makes parsing more accurate
    name?: string;
    primary_district?: string;
    primary_taluka?: string;
    land_types_handled?: string[];
    observed_price_min_per_acre?: number;
    observed_price_max_per_acre?: number;
    trust_tier?: number;
  };
}
```

**Response (200):**
```typescript
{
  parsed: ParsedSubmission;
  confidence: 'high' | 'medium' | 'low';
  cost_inr: number;
}
```

**Errors:**
- `400 INVALID_INPUT` — text missing or empty
- `502 CLAUDE_API_ERROR` — upstream Claude API failed
- `500 PARSE_FAILED` — Claude returned malformed JSON

**Implementation notes:**
- Use `claude-haiku-4-5` model
- System prompt: see section 7.1
- Max 3 retries with exponential backoff on 5xx errors
- Cost calculation: `(input_tokens × $1/M + output_tokens × $5/M) × 85` (INR conversion)
- Server-only — never call from client component
- Hard daily spend cap: enforced at Anthropic Console level

## 5.2 POST /api/whatsapp/transcribe

**Request body:**
```typescript
{
  audio_url: string;        // Supabase Storage path or signed URL
  language_hint?: string;   // 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'auto'
}
```

**Response (200):**
```typescript
{
  transcript: string;
  language_detected: string;
  duration_seconds: number;
  cost_inr: number;
}
```

**Errors:**
- `400 INVALID_AUDIO` — couldn't download or audio format unsupported
- `413 AUDIO_TOO_LONG` — exceeds 5 minute cap (cap at 3 min by default; reject above 5)
- `502 WHISPER_API_ERROR`

**Implementation notes:**
- OpenAI Whisper API (`whisper-1`)
- Cost: ~₹0.50/minute, calc as `Math.ceil(duration_minutes) × 0.50`
- If duration > 3 minutes, log warning and only transcribe first 3 minutes
- If duration > 5 minutes, reject

## 5.3 POST /api/whatsapp/clarify

**Purpose:** Generate clarification message text for missing fields and create an outbound_messages row.

**Request body:**
```typescript
{
  inbox_id: string;
  questions: string[];      // from parsed.missing_critical_fields
  agent_name?: string;
}
```

**Response (200):**
```typescript
{
  outbound_id: string;
  message_text: string;     // ready to copy-paste into WhatsApp
}
```

**Implementation notes:**
- Use the clarification template from section 6.2
- Mark inbox row: `processed_status='awaiting_clarification'`, `clarification_sent_at=now()`
- Phase 5: actually send via BSP webhook
- For MVP: just return the text and admin copies it manually

## 5.4 POST /api/whatsapp/inbox-to-listing

**Purpose:** Publish a draft inbox row as a real listing.

**Request body:**
```typescript
{
  inbox_id: string;
  listing_data: {
    title: string;
    description: string;
    land_type: LandType;
    state: string;
    district: string;
    taluka: string;
    village_or_landmark: string;
    survey_number: string | null;
    acreage: number;
    acreage_unit: AcreageUnit;
    price_per_acre: number | null;
    total_price: number | null;
    water_source: WaterSource;
    road_access: RoadAccess;
    title_status: TitleStatus;
    conversion_status: ConversionStatus;
    latitude: number | null;
    longitude: number | null;
    location_visibility: 'public' | 'approximate' | 'admin_only';
    survey_number_visibility: 'public' | 'qualified_buyer_only' | 'admin_only' | 'hidden';
    selected_media_urls: string[];
    land_record_id: string | null;
  };
}
```

**Response (200):**
```typescript
{
  listing_id: string;
  slug: string;
  public_url: string;       // e.g. https://acrehub.com/listing/abc-123
}
```

**Errors:**
- `400 INVALID_DATA` — required fields missing
- `404 INBOX_NOT_FOUND`
- `409 ALREADY_PUBLISHED` — inbox row already has resulting_listing_id

**Implementation notes:**
- Within a single Supabase transaction:
  1. Insert into `listings` (status='active', source_type='whatsapp', inbox_id=...)
  2. Insert into `agent_listing_links` (agent_id=inbox.agent_id, relationship='primary_agent', is_primary=true)
  3. Set `listings.agent_id = inbox.agent_id` (denormalized for query speed)
  4. Update `whatsapp_inbox.processed_status='published'`, `resulting_listing_id=...`, `processed_by=auth.uid()`, `processed_at=now()`
  5. Insert into `agent_events` (event_type='listing_published')
  6. If `inbox.agent_id` is set and `agent.auto_publish_listings=false`: increment `agent.recent_submissions_count`
- Compute `survey_number_clean` from `survey_number` (strip spaces, dashes, uppercase)
- Generate slug from title + location + short id

## 5.5 POST /api/agents/apply

**Request body:**
```typescript
{
  name: string;
  phone: string;            // primary identifier
  whatsapp?: string;
  email?: string;
  state: string;
  district: string;
  taluka?: string;
  agent_type: AgentType;
  bio?: string;
  ethics_acknowledged: true;  // must be true
}
```

**Response (200):**
```typescript
{
  application_id: string;   // agent_profiles.id
  status: 'pending_review';
}
```

**Errors:**
- `400 INVALID_INPUT`
- `400 ETHICS_NOT_ACKNOWLEDGED`
- `409 PHONE_EXISTS` — phone already registered

**Implementation notes:**
- Generate slug from name (kebab-case + short random suffix)
- Set: `profile_status='draft'`, `verification_status='pending_review'`, `trust_tier=1`
- Send admin notification (Phase 1: insert into a `admin_notifications` table or just log; Phase 5: actual notification)

## 5.6 POST /api/land-records/fetch

**Request body:**
```typescript
LandRecordRequest
```

**Response (200):**
```typescript
LandRecordResult
```

**Implementation logic:**
```
1. Look up land_records table by (state, district, taluka, village, survey_number, sub_division)
   If found AND expires_at > now(): return cached
2. Select adapter based on state
   If no adapter or adapter.isAvailable() === false: return source='manual' with empty fields
3. Call adapter.fetch(request)
4. Insert/update land_records row with retrieved_at=now() and expires_at=now()+90 days
5. Return result with id
```

**Errors:**
- `400 INVALID_REQUEST`
- `502 ADAPTER_ERROR` — upstream provider failed
- `404 NOT_FOUND` — adapter returned no record

## 5.7 POST /api/duplicates/check

**Request body:**
```typescript
{
  state: string;
  district: string;
  taluka: string;
  village: string;
  survey_number?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}
```

**Response (200):**
```typescript
DuplicateCheckResult
```

**Implementation logic:** see section 9.2.

## 5.8 POST /api/matching/buyers

**Request body:**
```typescript
{
  listing_draft: {
    state: string;
    district: string;
    taluka: string;
    land_type: LandType;
    acreage: number;
    price_per_acre: number | null;
  };
  limit?: number;            // default 3, max 10
}
```

**Response (200):**
```typescript
{
  matches: BuyerMatchResult[];
}
```

**Implementation logic:** see section 9.1.

---

# 6. Message templates

All outbound messages stored in `app/lib/message-templates.ts`. Each is a function that returns a string.

## 6.1 Listing confirmation (after publish, no buyer match)

```typescript
export function confirmationMessage(opts: {
  agentName: string;
  listingUrl: string;
}): string {
  return `Hi ${opts.agentName}, your listing is live on Acrehub:

${opts.listingUrl}

Share this link with your buyers on WhatsApp. Every click and enquiry will route back to you.

Reply here anytime to update the listing or send more properties.

— Acrehub`;
}
```

## 6.2 Listing confirmation (with strong buyer match)

```typescript
export function confirmationWithMatchMessage(opts: {
  agentName: string;
  listingUrl: string;
  buyerSummary: string;       // e.g. "30 acres in Kanakapura, budget ₹2-3cr"
  buyerPhoneMasked: string;   // e.g. "+91-9XXX-XXX-321"
  referenceId: string;        // for tracking
}): string {
  return `Hi ${opts.agentName}, your listing is live:

${opts.listingUrl}

GOOD NEWS: a buyer in our system already matches.
Looking for: ${opts.buyerSummary}
Buyer phone: ${opts.buyerPhoneMasked}
Mention reference: ${opts.referenceId} when you call.

Share the listing link with your other buyers too — every click routes to you.

— Acrehub`;
}
```

## 6.3 Clarification request

```typescript
export function clarificationMessage(opts: {
  agentName: string;
  questions: string[];        // 1-3 questions
}): string {
  const numbered = opts.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  return `Hi ${opts.agentName}, got your property submission. Quick questions to complete the listing:

${numbered}

Reply with the answers and I'll add them. Thanks!

— Acrehub`;
}
```

## 6.4 Buyer lead delivery (when buyer enquires on agent's listing)

```typescript
export function leadNotificationMessage(opts: {
  agentName: string;
  buyerName: string;
  buyerPhone: string;
  listingTitle: string;
  listingUrl: string;
  message?: string;
}): string {
  return `Hi ${opts.agentName}, new buyer enquiry on your listing:

"${opts.listingTitle}"
${opts.listingUrl}

Buyer: ${opts.buyerName}
Phone: ${opts.buyerPhone}
${opts.message ? `Message: "${opts.message}"\n` : ''}
Call the buyer directly and let us know how it goes.

— Acrehub`;
}
```

## 6.5 Status update acknowledgement

```typescript
export function statusUpdateAck(opts: {
  agentName: string;
  listingTitle: string;
  action: 'marked_sold' | 'price_updated' | 'withdrawn';
  newPrice?: string;
}): string {
  const actionText = {
    marked_sold: `marked as SOLD`,
    price_updated: `price updated to ${opts.newPrice}`,
    withdrawn: `marked as WITHDRAWN`,
  }[opts.action];

  return `Hi ${opts.agentName}, your listing "${opts.listingTitle}" has been ${actionText}. Thanks for keeping it current!

— Acrehub`;
}
```

## 6.6 Buyer requirement broadcast (admin sends to matched agents)

```typescript
export function buyerRequirementBroadcast(opts: {
  agentName: string;
  acreageRange: string;       // "20-40 acres"
  locationDescription: string; // "Hosur or Krishnagiri area"
  landType: string;            // "farm plot land"
  budgetRange: string;         // "₹2-3 crore"
  timeline?: string;
  referenceId: string;
}): string {
  return `Hi ${opts.agentName}, we have a serious buyer looking for land in your area:

Looking for: ${opts.acreageRange} of ${opts.landType}
Where: ${opts.locationDescription}
Budget: ${opts.budgetRange}
${opts.timeline ? `Timeline: ${opts.timeline}\n` : ''}
Reference: ${opts.referenceId}

If you have a matching property, reply YES and send the details. First serious response gets the buyer introduction.

— Acrehub`;
}
```

## 6.7 Application received acknowledgement

```typescript
export function applicationReceivedMessage(opts: {
  agentName: string;
}): string {
  return `Hi ${opts.agentName}, thank you for applying to the Acrehub Agent Network.

Our team will call you within 1-2 working days to complete verification.

In the meantime, you can already start sending properties to this number via WhatsApp — just send the details and photos and we'll create listings for you.

— Acrehub`;
}
```

---

# 7. Claude parsing system prompts

## 7.1 Listing parser system prompt

This is the system prompt used by `/api/whatsapp/parse`. Store it in `app/lib/prompts/listing-parser.ts`.

```typescript
export function buildListingParserPrompt(agentContext?: {
  name?: string;
  primary_district?: string;
  primary_taluka?: string;
  land_types_handled?: string[];
  observed_price_min_per_acre?: number;
  observed_price_max_per_acre?: number;
  trust_tier?: number;
}): string {
  const ctxBlock = agentContext ? `
Context about this agent:
- Name: ${agentContext.name ?? 'unknown'}
- Typical territory: ${agentContext.primary_district ?? 'unknown'}, ${agentContext.primary_taluka ?? 'unknown'}
- Typical land types: ${agentContext.land_types_handled?.join(', ') ?? 'unknown'}
- Typical price range: ${
  agentContext.observed_price_min_per_acre && agentContext.observed_price_max_per_acre
    ? `₹${agentContext.observed_price_min_per_acre.toLocaleString('en-IN')}–₹${agentContext.observed_price_max_per_acre.toLocaleString('en-IN')}/acre`
    : 'unknown'
}
- Trust tier: ${agentContext.trust_tier ?? 1}/5
` : '';

  return `You are a land listing parser for Acrehub, an Indian agricultural land marketplace. The user message is from a land agent describing one or more properties. The message may include a voice note transcript appended in [brackets].
${ctxBlock}
Extract a structured JSON object with this exact shape:

{
  "intent": "new_listing" | "status_update" | "price_change" | "question" | "unclear",
  "listings": [
    {
      "acreage": number | null,
      "acreage_unit": "acres" | "guntas" | "cents" | "ankanam" | "ground" | "kuncham",
      "acreage_confidence": "high" | "medium" | "low",
      "land_type": "agricultural" | "farm_plot" | "farmhouse" | "large_parcel" | "plantation" | "warehouse" | "industrial" | "other",
      "location": {
        "state": string | null,
        "district": string | null,
        "taluka": string | null,
        "village_or_landmark": string | null,
        "survey_number": string | null,
        "location_confidence": "high" | "medium" | "low"
      },
      "price": {
        "total_inr": number | null,
        "per_acre_inr": number | null,
        "price_confidence": "high" | "medium" | "low"
      },
      "features": {
        "water": "borewell" | "open_well" | "river" | "canal" | "none" | "unknown",
        "road_access": "highway" | "village_road" | "kachha" | "none" | "unknown",
        "title_status": "clear" | "unclear" | "unknown",
        "conversion_status": "done" | "pending" | "not_required" | "unknown",
        "electricity": "available" | "not_available" | "unknown",
        "fence": boolean | null,
        "trees_crops": string | null
      },
      "owner_info": {
        "name_mentioned": string | null,
        "phone_mentioned": string | null,
        "consent_status": "unknown" | "verbal" | "written" | "owner_uploaded"
      },
      "raw_description": string,
      "agent_notes_to_admin": string | null,
      "missing_critical_fields": string[],
      "clarification_questions": string[],
      "language_detected": string
    }
  ],
  "status_update_details": string | null
}

UNIT CONVERSIONS:
- 1 lakh = 100,000 (Indian numerical convention)
- 1 crore = 10,000,000
- Karnataka/Andhra/Telangana/Maharashtra: 1 acre = 40 guntas. 1 gunta ≈ 0.025 acre.
- Tamil Nadu/Kerala: 1 acre = 100 cents. 1 cent ≈ 0.01 acre.
- Tamil Nadu urban: 1 ground = 2400 sqft.
- AP/Telangana: 1 ankanam ≈ 72 sqft, 1 kuncham = 121 sq yards.
- For the "acreage" field, always return the value in the unit specified by acreage_unit. Do NOT convert to acres; preserve the agent's original unit.

REGIONAL TERMINOLOGY (recognize and map appropriately):
- "Nanjai" (Tamil Nadu): wetland, agricultural
- "Punjai" (Tamil Nadu): dry land, agricultural
- "DC converted" or "DC done" (Karnataka): conversion_status = "done"
- "Patta", "Chitta", "A-Register" (Tamil Nadu): refer to title documents
- "RTC", "Pahani" (Karnataka): record of tenancy
- "7/12 extract", "Saatbara Utara" (Maharashtra): land record
- "Adangal", "Pahani" (AP/Telangana): land records
- "B-Khata", "A-Khata" (Karnataka): property tax classification
- "B/W": borewell
- "OW": open well
- "FMB": Field Measurement Book

STRICT RULES:
1. If a value is not stated in the message, return null. Never guess.
2. Set confidence to "low" when ambiguity exists. "medium" when implied but not explicit. "high" when explicitly stated.
3. For regional language messages (Hindi/Kannada/Tamil/Telugu/mixed): translate to English in structured fields, preserve the original verbatim in raw_description.
4. If price is described as "asking", "negotiable", "around", "approx": still extract the number but set price_confidence to "medium".
5. If submitted property contradicts the agent's typical pattern (e.g. 200 acres when they usually list 5-20, or in a district they don't normally cover), add a note to agent_notes_to_admin.
6. missing_critical_fields must list keys that are null AND critical. Critical fields are: acreage, district, taluka, price (either total_inr or per_acre_inr).
7. clarification_questions: ≤3 simple WhatsApp-suitable questions to ask the agent for missing critical fields. Use the agent's likely language (English unless message is clearly in another).
8. If the message is a single status update on an existing listing (e.g. "SOLD the Hosur property"), set intent="status_update", listings=[], and populate status_update_details.
9. If the message is multiple properties, return one entry per property in the listings array.
10. Return ONLY the JSON object. No commentary, no markdown fences.`;
}
```

## 7.2 Parsing call wrapper

In `app/lib/whatsapp-parsing.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { buildListingParserPrompt } from './prompts/listing-parser';
import type { ParsedSubmission } from './agent-types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const HAIKU_INPUT_USD_PER_M = 1;
const HAIKU_OUTPUT_USD_PER_M = 5;
const INR_PER_USD = 85;

export async function parseSubmission(
  text: string,
  agentContext?: Parameters<typeof buildListingParserPrompt>[0]
): Promise<{
  parsed: ParsedSubmission;
  confidence: 'high' | 'medium' | 'low';
  cost_inr: number;
  raw_response: string;
}> {
  const systemPrompt = buildListingParserPrompt(agentContext);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: text }],
  });

  const rawText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('\n');

  // Strip any accidental markdown fences
  const cleaned = rawText.replace(/^```(?:json)?\s*|```\s*$/g, '').trim();

  let parsed: ParsedSubmission;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`PARSE_FAILED: Claude returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  // Compute overall confidence as min of all listing-level confidences
  const allConfidences: Array<'high' | 'medium' | 'low'> = [];
  for (const l of parsed.listings) {
    allConfidences.push(l.acreage_confidence, l.location.location_confidence, l.price.price_confidence);
  }
  const confidence: 'high' | 'medium' | 'low' = allConfidences.includes('low')
    ? 'low'
    : allConfidences.includes('medium')
    ? 'medium'
    : 'high';

  // Cost calculation
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const costUsd =
    (inputTokens / 1_000_000) * HAIKU_INPUT_USD_PER_M +
    (outputTokens / 1_000_000) * HAIKU_OUTPUT_USD_PER_M;
  const costInr = Number((costUsd * INR_PER_USD).toFixed(4));

  return { parsed, confidence, cost_inr: costInr, raw_response: rawText };
}
```

---

# 8. Component specifications

The three highest-leverage components, specified in detail.

## 8.1 InboxProcessor (the workhorse)

Path: `app/components/admin/whatsapp/InboxProcessor.tsx`
Used by: `app/admin/whatsapp/inbox/[id]/page.tsx`

**Layout:** three-column split.

```
+------------------+------------------+------------------+
|  LEFT            |  MIDDLE          |  RIGHT           |
|  (incoming)      |  (editable draft)|  (intelligence)  |
|                  |                  |                  |
|  Sender info     |  Listing fields  |  Duplicate check |
|  Raw message     |  with per-field  |  Price sanity    |
|  Voice player    |  confidence dots |  Buyer matches   |
|  Photo gallery   |                  |  Agent context   |
|  Location map    |  Survey# lookup  |                  |
|                  |  with "Fetch     |                  |
|                  |  land record"    |                  |
|                  |  button          |                  |
|                  |                  |                  |
|                  |  Photo selector  |                  |
|                  |  Visibility opts |                  |
+------------------+------------------+------------------+
|  ACTION BAR: Publish | Save Draft | Send Clarification | Reject | Skip |
+--------------------------------------------------------------------+
```

**Props:**
```typescript
interface InboxProcessorProps {
  inbox: WhatsAppInboxRow;
  agent: AgentProfile | null;          // null if unknown sender
  agentLearned: {                       // pre-computed for the right panel
    typical_district?: string;
    typical_price_range?: string;
    accuracy_score?: number;
    recent_count?: number;
  } | null;
  initialDraft: ParsedListing;          // from parsed_payload[0]
  duplicateResult: DuplicateCheckResult | null;
  buyerMatches: BuyerMatchResult[];
  priceBenchmark: {
    median: number;
    p25: number;
    p75: number;
    sample_size: number;
  } | null;
}
```

**State:**
```typescript
const [draft, setDraft] = useState<ParsedListing>(initialDraft);
const [landRecord, setLandRecord] = useState<LandRecordResult | null>(null);
const [selectedPhotoUrls, setSelectedPhotoUrls] = useState<string[]>(inbox.media_urls);
const [locationVisibility, setLocationVisibility] = useState<string>('public');
const [surveyNumberVisibility, setSurveyNumberVisibility] = useState<string>('public');
const [includeBuyerMatch, setIncludeBuyerMatch] = useState<boolean>(buyerMatches.length > 0);
const [submitting, setSubmitting] = useState<boolean>(false);
const [duplicateAction, setDuplicateAction] = useState<'merge' | 'keep_both' | 'reject' | null>(null);
```

**Key behaviors:**

1. **Confidence dot rendering.** Each field shows a small colored dot:
   - 🟢 green = high
   - 🟡 amber = medium
   - 🔴 red = low (also gets a yellow background)

2. **Survey number fetch button.** Clicking calls `/api/land-records/fetch` with the location+survey fields. On success, `landRecord` is set, and a panel below the field shows:
   - Owners (from govt record)
   - Extent (compared to draft acreage — flag if different)
   - Classification
   - FMB sketch thumbnail (if URL present)
   - "Use this data" button to overwrite draft fields

3. **Publish action.**
   - Validates required fields (title, district, taluka, acreage, price)
   - If duplicate flagged and no duplicateAction chosen, requires admin to pick first
   - Calls `/api/whatsapp/inbox-to-listing` with the draft + visibility + selected photos + land_record_id
   - On success: generates confirmation message text (using template 6.1 or 6.2), copies to clipboard, redirects to `/admin/whatsapp/inbox`

4. **Save draft.** Same as publish but `status='draft'`. Inbox row marked `processed_status='listing_drafted'`.

5. **Send clarification.** Calls `/api/whatsapp/clarify` with the questions, generates message text, copies to clipboard, marks inbox `awaiting_clarification`.

6. **Reject.** Prompts for reason (textarea), marks `processed_status='rejected'`, logs event.

**Validation rules:**
- Title min 10 chars
- Description min 30 chars
- Acreage > 0
- Price > 0
- District required
- Taluka required
- If `location_visibility='public'` then latitude/longitude required
- If duplicate flagged and `duplicateAction === null`: cannot publish

## 8.2 InboxList

Path: `app/components/admin/whatsapp/InboxList.tsx`
Used by: `app/admin/whatsapp/inbox/page.tsx`

**Props:**
```typescript
interface InboxListProps {
  rows: Array<WhatsAppInboxRow & { agent_name: string | null }>;
  filters: {
    status: ProcessedStatus | 'all';
    agent_id: string | null;
    has_voice: boolean | null;
    has_duplicate_flag: boolean | null;
  };
}
```

**Layout:** filter bar on top, scrollable table below.

**Columns:**
- Received (relative time, with tooltip showing full timestamp)
- Sender (phone, agent name if known, else "unknown sender" badge)
- Message snippet (first 80 chars of raw_message)
- Media (📷×N if photos, 🎤 if voice, 📍 if location pin)
- Parsing (status + confidence dot)
- Flags (D=duplicate suspected, $=price unusual, ?=needs clarification)
- Status (processed_status badge)
- Action ("Process →" link)

**Sort:** received_at DESC default. Sort options: oldest first, "needs attention" (combines awaiting_clarification + duplicate_suspected).

## 8.3 AgentJoinForm

Path: `app/components/agents/AgentJoinForm.tsx`
Used by: `app/agents/join/page.tsx`

**Fields:**
1. Full name (text, required, 2-100 chars)
2. Phone number (tel input, required, India format validation: +91-XXXXXXXXXX or 10-digit)
3. WhatsApp number (text, optional — assume same as phone if blank)
4. Email (email, optional)
5. Primary state (select, required — list: Karnataka, Tamil Nadu, Andhra Pradesh, Telangana, Maharashtra, Kerala, Gujarat, Madhya Pradesh, Uttar Pradesh, Rajasthan, Others)
6. Primary district (text, required)
7. Primary taluka (text, optional)
8. Agent type (radio buttons, required — list from AgentType enum)
9. Tell us about your work (textarea, optional, 0-500 chars)
10. Ethics acknowledgement (checkbox, required, see full text below)

**Ethics text:**
```
By joining the Acrehub Agent Network, I agree to:
• Only submit genuine land opportunities I have reasonable authority to market.
• Not misrepresent ownership, title, price, access, or legal status of any property.
• Not upload photos I don't have permission to use.
• Respect seller privacy and not share owner contact details without consent.
• Update or withdraw listings that are sold or no longer available.
• Avoid unofficial payments or any illegal facilitation.
• Accept that AcrehubIndia may suspend agents for fake, duplicate, or unethical listings.
```

**On submit:**
- POST to `/api/agents/apply`
- On success: navigate to `/agents/join/thanks` (or render success state inline) showing the application received message (template 6.7)
- On error: render error inline next to the affected field

---

# 9. Algorithm reference

## 9.1 Buyer-requirement matching

Implementation in `app/lib/agent-matching.ts`.

```typescript
import { createServerClient } from '@/lib/supabase-server';
import type { BuyerMatchResult, LandType } from './agent-types';

interface MatchInput {
  state: string;
  district: string;
  taluka: string;
  land_type: LandType;
  acreage: number;
  price_per_acre: number | null;
}

export async function findMatchingBuyers(
  input: MatchInput,
  limit: number = 3
): Promise<BuyerMatchResult[]> {
  const supabase = await createServerClient();

  // Fetch all active buyer requirements in the same state
  const { data: requirements, error } = await supabase
    .from('buyer_interests')
    .select('id, status, state, district, taluka, land_types, acreage_min, acreage_max, budget_min, budget_max, contact_phone')
    .eq('status', 'active')
    .eq('state', input.state)
    .limit(200);

  if (error || !requirements) return [];

  const scored = requirements
    .map((req) => {
      let score = 0;
      const reasons: string[] = [];

      // Geography
      if (req.taluka === input.taluka) {
        score += 30;
        reasons.push('same taluka');
      } else if (req.district === input.district) {
        score += 20;
        reasons.push('same district');
      } else {
        return null; // skip - too far
      }

      // Land type
      if (req.land_types && req.land_types.includes(input.land_type)) {
        score += 20;
        reasons.push('land type match');
      }

      // Acreage
      const acMin = req.acreage_min ?? 0;
      const acMax = req.acreage_max ?? Number.MAX_SAFE_INTEGER;
      if (input.acreage >= acMin && input.acreage <= acMax) {
        score += 15;
        reasons.push('acreage in range');
      } else if (input.acreage >= acMin * 0.7 && input.acreage <= acMax * 1.3) {
        score += 7;
        reasons.push('acreage close to range');
      }

      // Budget
      if (input.price_per_acre && req.budget_min && req.budget_max && input.acreage) {
        const totalPrice = input.price_per_acre * input.acreage;
        if (totalPrice >= req.budget_min && totalPrice <= req.budget_max) {
          score += 15;
          reasons.push('budget in range');
        } else if (totalPrice >= req.budget_min * 0.85 && totalPrice <= req.budget_max * 1.15) {
          score += 7;
          reasons.push('budget close to range');
        }
      }

      const label: BuyerMatchResult['match_label'] =
        score >= 60 ? 'strong_match' : score >= 40 ? 'good_match' : 'possible_match';

      return {
        buyer_interest_id: req.id,
        match_score: score,
        match_label: label,
        match_reasons: reasons,
        buyer_phone_masked: maskPhone(req.contact_phone),
      };
    })
    .filter((r): r is BuyerMatchResult => r !== null && r.match_score >= 40)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);

  return scored;
}

function maskPhone(phone: string | null): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 4) return phone;
  return `+91-${clean.slice(-10, -7)}-XXX-${clean.slice(-3)}`;
}
```

## 9.2 Duplicate detection

Implementation in `app/lib/duplicates.ts`.

```typescript
import { createServerClient } from '@/lib/supabase-server';
import type { DuplicateCheckResult } from './agent-types';

interface DupCheckInput {
  state: string;
  district: string;
  taluka: string;
  village: string;
  survey_number: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
}

const SURVEY_MATCH_THRESHOLD = 1.0;
const GPS_MATCH_DISTANCE_METERS = 200;
const TEXT_SIMILARITY_THRESHOLD = 0.4;

export async function checkDuplicate(input: DupCheckInput): Promise<DuplicateCheckResult> {
  const supabase = await createServerClient();

  // ----- Check 1: Survey number match -----
  if (input.survey_number) {
    const surveyClean = normalizeSurveyNumber(input.survey_number);
    const { data: surveyMatches } = await supabase
      .from('listings')
      .select('id, title')
      .eq('state', input.state)
      .eq('district', input.district)
      .eq('village_or_landmark', input.village)
      .eq('survey_number_clean', surveyClean)
      .eq('status', 'active')
      .limit(1);

    if (surveyMatches && surveyMatches.length > 0) {
      return {
        is_duplicate_suspected: true,
        matched_listing_id: surveyMatches[0].id,
        match_type: 'survey_number',
        similarity_score: SURVEY_MATCH_THRESHOLD,
        evidence: `Same survey number (${surveyClean}) in ${input.village}, ${input.district}: "${surveyMatches[0].title}"`,
      };
    }
  }

  // ----- Check 2: GPS proximity -----
  if (input.latitude && input.longitude) {
    const { data: gpsMatches } = await supabase.rpc('listings_within_distance', {
      lat: input.latitude,
      lng: input.longitude,
      meters: GPS_MATCH_DISTANCE_METERS,
    });

    if (gpsMatches && gpsMatches.length > 0) {
      return {
        is_duplicate_suspected: true,
        matched_listing_id: gpsMatches[0].id,
        match_type: 'gps_proximity',
        similarity_score: 0.7,
        evidence: `Existing listing within ${GPS_MATCH_DISTANCE_METERS}m: "${gpsMatches[0].title}"`,
      };
    }
  }

  // ----- Check 3: Text similarity (trigram) -----
  if (input.description && input.description.length > 30) {
    const { data: textMatches } = await supabase.rpc('listings_text_similar', {
      query_text: input.description,
      query_district: input.district,
      query_taluka: input.taluka,
      threshold: TEXT_SIMILARITY_THRESHOLD,
    });

    if (textMatches && textMatches.length > 0) {
      return {
        is_duplicate_suspected: true,
        matched_listing_id: textMatches[0].id,
        match_type: 'text_similarity',
        similarity_score: textMatches[0].similarity,
        evidence: `Description matches existing listing "${textMatches[0].title}" (${(textMatches[0].similarity * 100).toFixed(0)}% similar)`,
      };
    }
  }

  return {
    is_duplicate_suspected: false,
    matched_listing_id: null,
    match_type: null,
    similarity_score: 0,
    evidence: 'No duplicates found',
  };
}

function normalizeSurveyNumber(s: string): string {
  return s.replace(/[\s\-\/]/g, '').toUpperCase();
}
```

**Required SQL helpers (add to a migration):**

```sql
-- Distance-based listing lookup
create or replace function listings_within_distance(
  lat numeric,
  lng numeric,
  meters numeric
) returns table (id uuid, title text, distance_meters numeric) as $$
  select
    l.id,
    l.title,
    st_distance(l.geom, st_setsrid(st_makepoint(lng, lat), 4326)::geography) as distance_meters
  from listings l
  where l.geom is not null
    and l.status = 'active'
    and st_dwithin(l.geom, st_setsrid(st_makepoint(lng, lat), 4326)::geography, meters)
  order by distance_meters asc
  limit 5;
$$ language sql stable;

-- Trigram similarity for descriptions
create or replace function listings_text_similar(
  query_text text,
  query_district text,
  query_taluka text,
  threshold numeric
) returns table (id uuid, title text, similarity numeric) as $$
  select
    l.id,
    l.title,
    similarity(l.description, query_text) as similarity
  from listings l
  where l.status = 'active'
    and l.district = query_district
    and l.taluka = query_taluka
    and similarity(l.description, query_text) >= threshold
  order by similarity desc
  limit 3;
$$ language sql stable;

create index if not exists idx_listings_description_trgm
  on listings using gin (description gin_trgm_ops);
```

## 9.3 Price sanity check

Implementation in `app/lib/price-benchmarks.ts`.

```typescript
import { createServerClient } from '@/lib/supabase-server';

interface PriceSanityResult {
  is_unusual: boolean;
  median_price_per_acre: number | null;
  p25_price_per_acre: number | null;
  p75_price_per_acre: number | null;
  sample_size: number;
  z_score_label: string | null;
}

export async function checkPriceSanity(
  state: string,
  district: string,
  taluka: string,
  land_type: string,
  price_per_acre: number
): Promise<PriceSanityResult> {
  const supabase = await createServerClient();

  const { data: benchmark } = await supabase
    .from('price_benchmarks')
    .select('*')
    .eq('state', state)
    .eq('district', district)
    .eq('taluka', taluka)
    .eq('land_type', land_type)
    .single();

  if (!benchmark || benchmark.listing_count < 10) {
    return {
      is_unusual: false,
      median_price_per_acre: benchmark?.median_price_per_acre ?? null,
      p25_price_per_acre: benchmark?.p25_price_per_acre ?? null,
      p75_price_per_acre: benchmark?.p75_price_per_acre ?? null,
      sample_size: benchmark?.listing_count ?? 0,
      z_score_label: null,
    };
  }

  const median = benchmark.median_price_per_acre;
  const ratio = price_per_acre / median;

  let isUnusual = false;
  let label: string | null = null;

  if (ratio > 1.5) {
    isUnusual = true;
    label = `${Math.round((ratio - 1) * 100)}% above district median`;
  } else if (ratio < 0.5) {
    isUnusual = true;
    label = `${Math.round((1 - ratio) * 100)}% below district median`;
  }

  return {
    is_unusual: isUnusual,
    median_price_per_acre: median,
    p25_price_per_acre: benchmark.p25_price_per_acre,
    p75_price_per_acre: benchmark.p75_price_per_acre,
    sample_size: benchmark.listing_count,
    z_score_label: label,
  };
}
```

## 9.4 Agent learning recalculation

Run as a daily scheduled job (Supabase pg_cron or scheduled function).

```sql
create or replace function recompute_agent_observed_attributes(p_agent_id uuid)
returns void as $$
declare
  v_district text;
  v_taluka text;
  v_price_min bigint;
  v_price_max bigint;
  v_acreage_min numeric;
  v_acreage_max numeric;
  v_accuracy numeric;
  v_recent_count integer;
begin
  -- Most common district from listings in last 90 days
  select district into v_district
  from listings
  where agent_id = p_agent_id
    and created_at > now() - interval '90 days'
  group by district
  order by count(*) desc
  limit 1;

  select taluka into v_taluka
  from listings
  where agent_id = p_agent_id
    and created_at > now() - interval '90 days'
  group by taluka
  order by count(*) desc
  limit 1;

  -- Price range (p10 to p90) from listings
  select
    percentile_cont(0.1) within group (order by price_per_acre)::bigint,
    percentile_cont(0.9) within group (order by price_per_acre)::bigint
  into v_price_min, v_price_max
  from listings
  where agent_id = p_agent_id
    and price_per_acre is not null;

  -- Acreage range
  select min(acreage), max(acreage)
  into v_acreage_min, v_acreage_max
  from listings
  where agent_id = p_agent_id;

  -- Accuracy: ratio of inbox rows that became listings without admin correction
  with stats as (
    select
      count(*) filter (where event_type = 'listing_published') as published,
      count(*) filter (where event_type = 'admin_correction') as corrected
    from agent_events
    where agent_id = p_agent_id
      and created_at > now() - interval '90 days'
  )
  select
    case
      when published > 0 then greatest(0.0, 1.0 - (corrected::numeric / published))
      else 0.5
    end
  into v_accuracy
  from stats;

  -- Recent submission count
  select count(*) into v_recent_count
  from whatsapp_inbox
  where agent_id = p_agent_id
    and received_at > now() - interval '30 days';

  -- Update profile
  update agent_profiles
  set
    observed_primary_district = v_district,
    observed_primary_taluka = v_taluka,
    observed_price_min_per_acre = v_price_min,
    observed_price_max_per_acre = v_price_max,
    observed_acreage_min = v_acreage_min,
    observed_acreage_max = v_acreage_max,
    accuracy_score = v_accuracy,
    recent_submissions_count = v_recent_count
  where id = p_agent_id;
end;
$$ language plpgsql;

-- Run for all agents nightly
create or replace function recompute_all_agent_attributes() returns void as $$
declare
  r record;
begin
  for r in select id from agent_profiles where profile_status = 'active' loop
    perform recompute_agent_observed_attributes(r.id);
  end loop;
end;
$$ language plpgsql;
```

## 9.5 Auto-publish decision

A listing draft auto-publishes (skipping admin review) if and only if **ALL** of these are true:

- `agent.auto_publish_listings = true`
- `agent.trust_tier >= 4`
- `agent.accuracy_score >= 0.85`
- `inbox.parsing_confidence = 'high'`
- `inbox.duplicate_check_status = 'clean'`
- `inbox.price_unusual = false`
- All required fields present

If any condition fails: stays in admin review queue.

Implement as a server function `shouldAutoPublish(inbox: WhatsAppInboxRow, agent: AgentProfile): boolean`.

---

# 10. Phase 1 build prompts

**Goal of Phase 1:** Get the basic WhatsApp pipeline working end-to-end with manual admin operation. No intelligence layer yet.

**Estimated duration:** 4 weeks.

**Prerequisites:** Existing AcrehubIndia codebase functional. PowerShell two-window setup working. Branch created: `feature/agent-network-phase-1`.

---

## Prompt 1.1 — Database migrations

```
Read docs/agent-network-spec.md sections 3 and 9.

Create one Supabase migration file at supabase/migrations/{timestamp}_agent_network_phase_1.sql that contains, in order:

1. The extension enablement (pgcrypto, pg_trgm, postgis) from section 3.1.

2. The is_admin() helper function from section 3.12.

3. All table creations from sections 3.2 through 3.9 (agent_profiles, agent_territories, whatsapp_inbox, mobile_submissions, land_records, agent_listing_links, agent_events, outbound_messages).

4. The listings table alterations from section 3.10.

5. The set_updated_at() trigger function (used by agent_profiles).

6. The listings_set_geom() trigger function (used by listings).

7. The SQL helper functions listings_within_distance() and listings_text_similar() from section 9.2.

8. The trigram index on listings.description from section 9.2.

Note: skip the price_benchmarks materialized view and recompute_agent_observed_attributes() function — those come in Phase 2.

Apply the migration locally using `npx supabase db reset` or `npx supabase db push`, depending on the current convention in this project.

DEFINITION OF DONE:
- Migration file exists and runs without errors.
- All 8 new tables visible in Supabase Studio.
- The 4 new columns visible on the listings table.
- RLS is enabled on all new tables.
- I can manually insert a test agent_profile row via Supabase Studio.
- The geom column on listings populates correctly when I insert a test row with lat/lng.

DO NOT proceed to other prompts. Stop after the migration is verified.

Commit message: "Phase 1.1: agent network database schema"
```

---

## Prompt 1.2 — TypeScript types and Anthropic SDK setup

```
Read docs/agent-network-spec.md section 4.

1. Install the Anthropic SDK if not already installed: `npm install @anthropic-ai/sdk`.

2. Create app/lib/agent-types.ts with the complete TypeScript types from section 4. Export everything.

3. Verify that .env.local contains:
   - ANTHROPIC_API_KEY=...
   If missing, prompt me to add it before continuing.

4. Create a minimal test file at app/lib/__tests__/agent-types.test.ts that:
   - Imports all types
   - Has a trivial assertion that AgentType enum includes 'village_agent'
   This is just to verify the types file compiles.

5. Run `npx tsc --noEmit` and confirm no type errors anywhere in the project.

DEFINITION OF DONE:
- app/lib/agent-types.ts exists with all exports from section 4.
- `npx tsc --noEmit` passes with zero errors.
- @anthropic-ai/sdk is in package.json dependencies.
- ANTHROPIC_API_KEY env var is set.

Commit message: "Phase 1.2: agent network types and SDK setup"
```

---

## Prompt 1.3 — Claude parsing service

```
Read docs/agent-network-spec.md sections 5.1, 7.1, and 7.2.

1. Create app/lib/prompts/listing-parser.ts with the exported function buildListingParserPrompt() exactly as specified in section 7.1.

2. Create app/lib/whatsapp-parsing.ts with the parseSubmission() function exactly as specified in section 7.2.

3. Create app/api/whatsapp/parse/route.ts implementing the API contract from section 5.1:
   - POST handler accepting { text, agent_context? }
   - Calls parseSubmission()
   - Returns { parsed, confidence, cost_inr }
   - Proper error handling with standard error shape { error: { code, message } }
   - Authenticates that the caller is an admin (check is_admin via Supabase auth)
   - Logs cost to console for debugging

4. Test it manually:
   - Send a POST to /api/whatsapp/parse with body:
     {
       "text": "40 acre agricultural land near Channapatna, Karnataka. 25 lakh per acre. Borewell, road access, DC converted. Owner ready. - Rajesh"
     }
   - Verify response includes a parsed.listings[0] with acreage=40, district mentioning Bangalore Rural or similar, price_per_acre=2500000.
   - Try a Tamil example: "30 cent farm plot near Hosur. 5 lakh per cent. Patta available. Road access good."

DEFINITION OF DONE:
- Both files created and exported correctly.
- /api/whatsapp/parse responds 200 to a valid request.
- Sample English message returns parsed.listings with reasonable values.
- Sample Tamil-Nadu message returns acreage_unit='cents' and recognizes "Patta".
- Cost is logged and returned in INR.
- Unauthorized callers get 401.

Commit message: "Phase 1.3: Claude parsing service"
```

---

## Prompt 1.4 — Admin inbox list page

```
Read docs/agent-network-spec.md section 8.2.

1. Create app/admin/whatsapp/inbox/page.tsx as a server component that:
   - Verifies the current user is an admin (redirects to /login if not)
   - Reads filter query params: status (default 'inbox'), agent_id (optional)
   - Queries whatsapp_inbox with filters, joining to agent_profiles for agent_name
   - Renders the InboxList component with the rows and filters

2. Create app/components/admin/whatsapp/InboxList.tsx as a client component implementing the spec in section 8.2:
   - Filter bar at top: status select (inbox/awaiting_clarification/in_progress/published/rejected/all), agent search, "has voice" toggle, "has flags" toggle
   - Filters update URL params (use Next.js useRouter)
   - Table below with the 8 columns specified
   - Each row links to /admin/whatsapp/inbox/{id}
   - Default sort: received_at DESC

3. Reuse existing admin layout/styles from app/admin/page.tsx. Don't introduce new design language.

4. Add a link to this page from the main admin dashboard.

DEFINITION OF DONE:
- /admin/whatsapp/inbox loads and shows a table (empty for now is fine).
- Filter bar works — changing the status filter updates the URL and re-renders the list.
- I can manually insert an inbox row in Supabase Studio and it appears in the list.
- Non-admin users get redirected to login.

Commit message: "Phase 1.4: admin inbox list page"
```

---

## Prompt 1.5 — Manual paste-in form

```
Read docs/agent-network-spec.md sections 3.4 and 8.

1. Create app/admin/whatsapp/inbox/new/page.tsx as a client component with a form containing:
   - Sender phone (text, required, validate India format)
   - Message text (textarea, required, min 5 chars)
   - Voice note upload (file input, optional, accept audio/* )
   - Photo upload (file input, multiple, optional, accept image/*)
   - Location pin (two optional number inputs: lat, lng, with a small map preview via Leaflet)
   - Submit button

2. On submit:
   - Upload voice note (if present) to Supabase Storage at: whatsapp_voice_notes/{conversation_id}/{filename}
   - Upload photos (if present) to: whatsapp_media/{conversation_id}/{filename}
   - Look up agent_profiles by sender_phone (case insensitive, normalize to +91 format)
   - Insert a whatsapp_inbox row:
     - conversation_id: gen_random_uuid() (Supabase default)
     - sender_phone
     - agent_id (null if no match)
     - raw_message (the typed text)
     - voice_note_url (storage path)
     - media_urls (array of storage paths)
     - location_lat, location_lng
     - processed_status='inbox'
   - Auto-trigger the parse: call /api/whatsapp/parse with the message text + agent context (if found)
   - Update the inbox row with parsed_payload, parsing_status, parsing_confidence, parsing_cost_inr
   - Redirect to /admin/whatsapp/inbox/{new_id}

3. Phone number normalization helper at app/lib/phone-utils.ts:
   - normalizePhone(input: string): string — returns +91-XXXXXXXXXX format
   - Handle various inputs: "9876543210", "+919876543210", "+91-9876543210", "91-9876543210"

DEFINITION OF DONE:
- /admin/whatsapp/inbox/new loads the form.
- I can submit a test message with photos and a voice file; both upload to Storage.
- The inbox row is created with all fields populated.
- The parse runs automatically and populates parsed_payload.
- I get redirected to the processor page.

Commit message: "Phase 1.5: manual paste-in form for WhatsApp messages"
```

---

## Prompt 1.6 — Inbox processor page (Part 1: left panel and middle panel)

```
Read docs/agent-network-spec.md section 8.1 carefully. Focus only on the LEFT panel and MIDDLE panel for this prompt. Skip the right panel (intelligence) — it goes in prompt 1.7.

1. Create app/admin/whatsapp/inbox/[id]/page.tsx as a server component that:
   - Verifies admin auth
   - Fetches the inbox row by id (404 if not found)
   - Fetches the agent (if agent_id is set)
   - Passes data to the InboxProcessor client component

2. Create app/components/admin/whatsapp/InboxProcessor.tsx as a client component:
   - For now, render only the left and middle panels (right panel is a placeholder).
   - LEFT panel:
     - Sender phone with agent badge ("✓ Rajesh Kumar (Bangalore Rural)" or "⚠ Unknown sender — Add as agent")
     - Raw message in a styled <pre> or <p> with proper word-wrapping
     - Voice note: if voice_note_url is set, show an <audio controls> tag with src=getSignedUrl(voice_note_url). Below it, show "Transcript: ..." if voice_transcript is present (otherwise "Voice transcription pending — Phase 2 feature").
     - Photo gallery: render each media_urls entry as a thumbnail. Click opens full-size in a modal.
     - Location pin: if location_lat/lng, render a small Leaflet map centered there with a marker.
     - Received timestamp, language detected.
   - MIDDLE panel:
     - Section header: "Draft Listing (editable)"
     - All ParsedListing fields from inbox.parsed_payload.listings[0] as editable form fields.
     - Each field labeled, with a small colored dot showing its confidence (green/amber/red).
     - Title field (auto-generate suggestion from acreage + land_type + village)
     - Description field (initialize with parsed.raw_description)
     - Acreage + unit (number + select)
     - Land type (select)
     - State, district, taluka, village_or_landmark (text inputs; state is a select)
     - Survey number (text) + a "Fetch land record" button that's disabled in Phase 1 (tooltip: "Available in Phase 3")
     - Price per acre + total price (auto-compute one from the other when acreage changes)
     - Water source, road access, title status, conversion status, electricity (each is a select)
     - Latitude/Longitude (number inputs, auto-filled from inbox.location_lat/lng)
     - Photo selector: thumbnails of inbox.media_urls with checkboxes. Default: all checked.
     - Location visibility (select: public/approximate/admin_only)
     - Survey number visibility (select: public/qualified_buyer_only/admin_only/hidden)
   - State management: useState<ParsedListing>(draftFromInbox)
   - Validation function that checks all required fields

3. Action bar (bottom of page, sticky):
   - "Publish" button (disabled until validation passes)
   - "Save Draft" button
   - "Send Clarification" button (disabled in Phase 1)
   - "Reject" button (opens a modal asking for a reason)
   - "Skip for now" button (returns to inbox list)

4. Implement the Publish action:
   - POST to /api/whatsapp/inbox-to-listing (you'll build that endpoint in Prompt 1.7)
   - For now, the button can just console.log the payload to verify it's correct.

5. Implement the Reject action:
   - Modal with a textarea for reason
   - Confirm calls Supabase to update the inbox row: processed_status='rejected', admin_notes=reason, processed_by=auth.uid(), processed_at=now()
   - Insert agent_events row
   - Redirect to /admin/whatsapp/inbox

DEFINITION OF DONE:
- /admin/whatsapp/inbox/{id} loads for a real inbox row.
- All left-panel content renders correctly: phone, raw message, photos open in modal, voice player works if voice URL is present, map renders if location is set.
- All middle-panel form fields are editable and pre-filled from parsed_payload.
- Confidence dots show correct colors per field.
- Validation prevents Publish when required fields are missing.
- Reject works end-to-end and redirects.

Commit message: "Phase 1.6: inbox processor left+middle panels"
```

---

## Prompt 1.7 — Publish API and inbox-to-listing flow

```
Read docs/agent-network-spec.md section 5.4 carefully.

1. Create app/api/whatsapp/inbox-to-listing/route.ts implementing the contract in section 5.4:
   - Verify admin auth
   - Validate the request body shape
   - Open a Supabase transaction (use RPC if needed for transactionality; or do best-effort with rollback handling)
   - Insert into listings table with:
     - title, description, state, district, taluka, village_or_landmark, survey_number, acreage, acreage_unit, price_per_acre, total_price, water_source, road_access, title_status, conversion_status, latitude, longitude
     - status='active'
     - source_type='whatsapp'
     - inbox_id=request.inbox_id
     - agent_id=inbox.agent_id
     - survey_number_clean = normalized survey_number
     - location_visibility, survey_number_visibility from request
     - land_record_id (null in Phase 1)
     - media_urls = the selected photos
   - Generate slug: kebab-case(title) + "-" + 6-char-id
   - Insert into agent_listing_links: agent_id=inbox.agent_id, listing_id=new_listing.id, relationship='primary_agent', is_primary=true, source_protected=true
   - Update whatsapp_inbox: processed_status='published', resulting_listing_id=new_listing.id, processed_by, processed_at
   - Insert agent_events row: event_type='listing_published'
   - Return { listing_id, slug, public_url: https://acrehub.com/listing/{slug} }

2. Wire the Publish button in InboxProcessor to this endpoint:
   - On success:
     a. Generate confirmation message text using template 6.1 from section 6 (no buyer match in Phase 1).
     b. Copy the text to clipboard.
     c. Show a toast: "Listing published. Confirmation message copied to clipboard."
     d. Redirect to /admin/whatsapp/inbox.

3. Also implement the Save Draft action:
   - Same as Publish but listings.status='draft'.
   - Update inbox.processed_status='listing_drafted'.
   - No confirmation message generated.

4. Create app/lib/message-templates.ts with the templates from section 6. Export each as a named function.

DEFINITION OF DONE:
- Publishing an inbox row creates a real listing visible at /listing/{slug}.
- The listing has agent_id set, source_type='whatsapp', inbox_id set.
- agent_listing_links has the primary_agent row.
- whatsapp_inbox.processed_status is 'published'.
- agent_events has a 'listing_published' row.
- Confirmation message text is correctly generated and copied to clipboard.
- Save Draft creates a draft listing without copying any message.

Commit message: "Phase 1.7: publish API and inbox-to-listing flow"
```

---

## Prompt 1.8 — Agent join form and applications admin

```
Read docs/agent-network-spec.md sections 5.5, 6.7, and 8.3.

1. Create app/agents/join/page.tsx as a client component rendering AgentJoinForm.

2. Create app/components/agents/AgentJoinForm.tsx implementing the spec in section 8.3:
   - All 10 fields with correct validation.
   - On submit: POST to /api/agents/apply.
   - On success: render the application-received message (template 6.7) inline. Optionally redirect to /agents/join/thanks.
   - On error: show inline errors.

3. Create app/api/agents/apply/route.ts implementing section 5.5:
   - Validate input (use Zod if already in project; otherwise manual).
   - Generate slug from name.
   - Insert agent_profiles row with profile_status='draft', verification_status='pending_review'.
   - Return { application_id, status: 'pending_review' }.

4. Create app/admin/agents/applications/page.tsx — server component listing all agent_profiles where verification_status='pending_review'. Show name, phone, district, agent_type, applied_at. Each row links to /admin/agents/{id}.

5. Create app/admin/agents/[id]/page.tsx — agent detail page:
   - Show all profile fields.
   - Editable: verification_status, profile_status, trust_tier, auto_publish_listings, admin_notes.
   - "Save" button updates the row.
   - Show that agent's listings (paginated) and their inbox history (last 20 rows).
   - Buttons: "Verify", "Suspend", "Reject" (each just updates verification_status).

6. Create app/admin/agents/page.tsx — list view of all agents with filters by state/district/verification_status. Similar table style to inbox list.

DEFINITION OF DONE:
- /agents/join renders the form.
- Submitting creates a draft agent_profile.
- /admin/agents/applications shows it.
- /admin/agents/{id} lets me verify the agent.
- After verification, the agent appears in /admin/agents with the right status.
- Validation works: ethics checkbox required, phone format enforced.

Commit message: "Phase 1.8: agent join form and admin agent management"
```

---

## Prompt 1.9 — Public agent pages

```
Read the existing app/listings/ pages and the existing /listing/[id]/page.tsx for patterns.

1. Create app/agents/page.tsx (server component) — directory of active verified agents:
   - Query: agent_profiles where profile_status='active' and verification_status in ('verified', 'territory_verified').
   - Render as a grid of agent cards (use new AgentProfileCard component).
   - Filter bar: state, district, agent_type.
   - Pagination: 24 per page.

2. Create app/components/agents/AgentProfileCard.tsx — small card showing photo, name, district/taluka, agent_type, number of active listings, "View profile →" link.

3. Create app/agents/[slug]/page.tsx (server component) — public agent profile:
   - 404 if not found or profile_status != 'active'.
   - Render AgentPublicProfile component with: name, photo, district, agent_type, specializations, languages, bio, years_experience, listings count, "Contact via WhatsApp" CTA (uses agent.whatsapp or agent.phone).
   - Below: agent's active listings (use existing ListingCard component).
   - Set OpenGraph metadata: og:title, og:description, og:image (agent photo).
   - JSON-LD structured data: type=Person.

4. Create app/agents/[state]/page.tsx, app/agents/[state]/[district]/page.tsx, app/agents/[state]/[district]/[taluka]/page.tsx — SEO directory pages. Same component as /agents/page.tsx but pre-filtered. Each should set unique title/meta tags.

5. Create app/agents/how-it-works/page.tsx — static content explaining the WhatsApp-first workflow. Include the Acrehub WhatsApp number prominently (from env: NEXT_PUBLIC_ACREHUB_WHATSAPP_NUMBER).

6. Add public agent URLs to app/sitemap.ts.

DEFINITION OF DONE:
- /agents loads with the directory.
- /agents/[slug] renders correctly for a verified agent.
- "Contact via WhatsApp" opens WhatsApp with the agent's number.
- /agents/karnataka, /agents/karnataka/bangalore-rural pages render with correct filtering.
- /agents/how-it-works renders with the WhatsApp number visible.
- Sitemap includes the new public routes.
- All pages render correctly on mobile.

Commit message: "Phase 1.9: public agent directory and profiles"
```

---

## Prompt 1.10 — Listing integration

```
Read the existing app/listing/[id]/page.tsx and app/components/ListingCard.tsx.

1. Modify app/listing/[id]/page.tsx:
   - Fetch agent_listing_links + agent_profile for this listing.
   - Below the existing listing info, render a new AgentManagedCard component (create at app/components/agents/AgentManagedCard.tsx):
     - "Managed by [Agent Name]"
     - Agent badge (verified/territory_verified)
     - Link to /agents/[slug]
     - "Contact agent on WhatsApp" CTA
   - If listings.location_visibility = 'approximate', show a notice: "Approximate location shown. Exact details available after contact."
   - If listings.survey_number_visibility != 'public', hide the survey number from public view (only show "Available on request").

2. Modify app/components/ListingCard.tsx:
   - If listing.agent_id is set, show a small "Agent" pill in the card.
   - Pill is clickable to /agents/{agent.slug} (pass agent slug in props).

3. Update the listings query in /listings (or wherever listing cards are rendered) to also fetch the agent's slug and name when agent_id is set.

4. Add a section to the home page (app/page.tsx):
   - "Are you a land agent?" with a CTA to /agents/join
   - Place it in an appropriate location (after primary content, before footer).

DEFINITION OF DONE:
- An agent-managed listing shows the agent card on its detail page.
- Public listing cards show the "Agent" pill when applicable.
- Survey number visibility settings are respected publicly.
- Approximate-location listings show the notice.
- Home page has the agent recruitment section.
- Existing listings (without agent_id) render unchanged.

Commit message: "Phase 1.10: listing integration with agent network"
```

---

## End of Phase 1

After all 10 prompts pass their definition-of-done checks:

```
git status                     # confirm clean tree
git log --oneline -15           # verify 10 commits look right
git push origin feature/agent-network-phase-1
```

Then test the full end-to-end flow manually:
1. Submit an agent application at /agents/join
2. Verify the agent in /admin/agents
3. Manually create a WhatsApp message via /admin/whatsapp/inbox/new
4. Open the inbox row in the processor
5. Edit fields and publish
6. Verify the listing appears at /listing/{slug} with agent card
7. Verify the public agent profile shows the listing

Once this flow works, you have a functional WhatsApp pipeline (manual mode). Time to onboard the first 5 agents from the network manually.

---

# 11. Phase 2 build prompts

**Goal:** Add the intelligence layer — voice transcription, duplicate detection, price sanity, buyer matching, clarification dialogue, agent learning.

**Estimated duration:** 5 weeks.

**Prerequisites:** Phase 1 merged and operating in production. At least 5 real agents onboarded. At least 20 real listings ingested via the WhatsApp manual flow. This baseline is necessary to validate the intelligence features.

---

## Prompt 2.1 — Voice transcription with Whisper

```
Read docs/agent-network-spec.md section 5.2.

1. Confirm OPENAI_API_KEY is set in .env.local. If not, prompt me to add it.

2. Install the OpenAI SDK if not already: `npm install openai`.

3. Create app/lib/whatsapp-transcribe.ts with:
   - export async function transcribeVoiceNote(audioUrl: string, languageHint?: string): Promise<{ transcript: string; language_detected: string; duration_seconds: number; cost_inr: number }>
   - Download the audio from Supabase Storage signed URL.
   - Cap duration at 3 minutes (use ffprobe if available, or check the file size as a rough proxy).
   - Call OpenAI Whisper API (whisper-1 model, response_format='verbose_json').
   - Compute cost: Math.ceil(duration_seconds / 60) × 0.50 INR.
   - Return result.

4. Create app/api/whatsapp/transcribe/route.ts implementing section 5.2.

5. Modify the manual paste-in form (app/admin/whatsapp/inbox/new/page.tsx):
   - After voice upload, automatically call /api/whatsapp/transcribe.
   - Update the inbox row with voice_transcript, voice_duration_seconds, language_detected.
   - Append the transcript to raw_message in the format: "{original_text}\n\n[voice transcript: {transcript}]"
   - Then trigger re-parse with the updated text.

6. Modify the inbox processor (InboxProcessor.tsx):
   - In the left panel voice section, show the transcript prominently below the audio player when present.
   - Add a "Re-transcribe" button (admin-only) for cases where the original was poor.

DEFINITION OF DONE:
- Uploading a voice note in /admin/whatsapp/inbox/new triggers transcription.
- Transcript appears in the inbox row's voice_transcript field.
- Transcript is visible in the processor's left panel.
- Cost is logged and stored in parsing_cost_inr (combined with parse cost).
- Whisper API errors are handled gracefully (transcription marked as failed, but inbox row still usable).

Commit message: "Phase 2.1: voice transcription with Whisper"
```

---

## Prompt 2.2 — Duplicate detection

```
Read docs/agent-network-spec.md sections 5.7 and 9.2.

1. Create app/lib/duplicates.ts with the checkDuplicate() function exactly as specified in section 9.2.

2. Create app/api/duplicates/check/route.ts implementing section 5.7.

3. Modify the inbox creation flow (in the manual paste-in form):
   - After parsing completes, automatically call /api/duplicates/check with the parsed location and description.
   - Update the inbox row with duplicate_check_status, duplicate_of_listing_id, similarity_score.

4. Modify the inbox processor right panel:
   - Add a "Duplicate check" section.
   - If duplicate_check_status='clean': show "✓ No duplicates detected" in green.
   - If duplicate_check_status='duplicate_suspected':
     - Show the matched listing in a card (title, location, view link).
     - Show the evidence string.
     - Three action buttons:
       a. "Merge — add as co-broker" → opens a confirmation dialog. On confirm: insert agent_listing_links row with relationship='co_broker' linking the new agent to the EXISTING listing. Mark inbox.processed_status='duplicate_merged'. Send agent a confirmation message explaining this.
       b. "Keep both" → marks duplicate_check_status='clean'. Admin proceeds to publish normally.
       c. "Reject as duplicate" → marks inbox.processed_status='rejected' with admin_notes='Confirmed duplicate of [listing_id]'.

5. Create a "Duplicates queue" page at app/admin/whatsapp/duplicates/page.tsx — lists all inbox rows with duplicate_check_status='duplicate_suspected' that haven't been resolved.

DEFINITION OF DONE:
- Submitting a property with a survey number that matches an existing listing flags as duplicate.
- Submitting a property within 200m of an existing listing flags as duplicate.
- Submitting a property with very similar description (in the same taluka) flags as duplicate.
- The processor right panel shows the duplicate info correctly.
- Merge action correctly adds the new agent as co_broker on the existing listing.
- Reject action correctly marks the inbox row.

Commit message: "Phase 2.2: duplicate detection"
```

---

## Prompt 2.3 — Price benchmarks and sanity check

```
Read docs/agent-network-spec.md sections 3.11 and 9.3.

1. Create a new migration supabase/migrations/{ts}_price_benchmarks.sql that:
   - Creates the price_benchmarks materialized view from section 3.11.
   - Creates the refresh_price_benchmarks() function.

2. Set up a scheduled job to refresh nightly:
   - If pg_cron is available in this Supabase instance: schedule via SQL.
   - Otherwise: create app/api/cron/refresh-price-benchmarks/route.ts that calls the SQL function, and configure Vercel Cron in vercel.json to hit it at 02:00 IST daily.

3. Create app/lib/price-benchmarks.ts with the checkPriceSanity() function from section 9.3.

4. Modify the inbox creation flow:
   - After parsing, call checkPriceSanity() if price_per_acre is parsed.
   - Update inbox row: price_unusual, district_median_price_per_acre.

5. Modify the inbox processor right panel:
   - Add a "Price sanity" section.
   - If sample_size >= 10:
     - Show the district median, p25, p75 range.
     - Show submitted price vs median.
     - If price_unusual: show a yellow warning with the z_score_label.
   - If sample_size < 10: show "Not enough comparable listings yet" (no warning).

DEFINITION OF DONE:
- Materialized view exists and populates with at least one row (you may need to insert test listings first).
- Refresh function works manually.
- Cron is configured.
- Price sanity check runs on new inbox rows.
- Right panel shows price benchmark info correctly.
- A submission 60%+ above median shows a warning.

Commit message: "Phase 2.3: price benchmarks and sanity check"
```

---

## Prompt 2.4 — Buyer-requirement matching at ingestion

```
Read docs/agent-network-spec.md sections 5.8 and 9.1.

1. Create app/lib/agent-matching.ts with findMatchingBuyers() exactly as in section 9.1.

2. Create app/api/matching/buyers/route.ts implementing section 5.8.

3. Modify the inbox creation flow:
   - After parsing succeeds, call findMatchingBuyers() with the listing draft.
   - Save top 3 results to inbox.matched_buyer_requirements.

4. Modify the inbox processor right panel:
   - Add a "Buyer matches" section.
   - For each match, show:
     - Match label (Strong/Good/Possible) with color
     - Buyer name (mask: first name only or "Buyer #1")
     - Buyer phone (masked)
     - Acreage and budget range from the requirement
     - Match reasons as small tags
     - A toggle: "Include in confirmation message" (checked by default for strong_match)

5. Modify the Publish action:
   - If any buyer match has include=true: use template 6.2 (confirmationWithMatchMessage) with the buyer details.
   - Otherwise: use template 6.1 (confirmationMessage).
   - The reference ID format: "AC-" + 6 chars from listing.id.

DEFINITION OF DONE:
- New inbox rows have matched_buyer_requirements populated.
- Right panel shows the matches correctly with confidence levels.
- Toggling "include in confirmation" works.
- Publishing with a strong match generates the WITH MATCH confirmation message.
- Publishing without matches generates the standard message.
- Buyer phones are correctly masked in the UI (only last 3 digits visible).

Commit message: "Phase 2.4: buyer requirement matching at ingestion"
```

---

## Prompt 2.5 — Active clarification dialogue

```
Read docs/agent-network-spec.md sections 5.3 and 6.3.

1. Create app/lib/whatsapp-clarify.ts with:
   - export async function generateClarificationMessage(inbox: WhatsAppInboxRow, agentName: string): Promise<{ message_text: string }>
   - Uses clarificationMessage() from message-templates.
   - The questions come from inbox.clarification_questions (set by Claude during parsing).

2. Create app/api/whatsapp/clarify/route.ts implementing section 5.3:
   - Generates the message text.
   - Inserts outbound_messages row: channel='whatsapp', context={ type: 'clarification', inbox_id }, status='pending'.
   - Updates whatsapp_inbox: processed_status='awaiting_clarification', clarification_sent_at=now(), clarification_questions=[the questions sent].
   - Logs agent_events: event_type='clarification_sent'.
   - Returns { outbound_id, message_text }.

3. Modify the inbox processor:
   - The "Send Clarification" button is enabled when inbox.missing_critical_fields.length > 0.
   - On click: shows a modal with the proposed questions (editable). Admin can adjust.
   - On confirm: calls /api/whatsapp/clarify, copies message to clipboard, shows a toast, marks button as sent.

4. Implement the "reply matching" logic:
   - When a new message arrives at /admin/whatsapp/inbox/new from the same sender phone within 24 hours AND there's an existing inbox row with processed_status='awaiting_clarification' for that sender:
     - Auto-link by setting conversation_id of the new row to the existing one.
     - Mark the existing row's clarification_reply_received=true.
     - Append the new message text to the original raw_message: "{original}\n\n[clarification reply: {new_text}]"
     - Re-parse the combined text.
     - Move the existing row's processed_status from 'awaiting_clarification' back to 'inbox' (or 'in_progress').
     - Mark the NEW row as processed_status='archived' (it's a reply, not a fresh submission).
     - Insert agent_events: event_type='clarification_reply_received'.

5. Create app/admin/whatsapp/clarifications/page.tsx — list of inbox rows where processed_status='awaiting_clarification'. Sorted by clarification_sent_at oldest first. Show "overdue" tag if >48h since sent.

DEFINITION OF DONE:
- Submitting a property with missing critical fields auto-populates clarification_questions.
- "Send Clarification" button generates the right message and copies to clipboard.
- Inbox row marks as awaiting_clarification.
- When the same agent sends a new message within 24h, it gets matched and the original re-parses.
- The clarifications queue page lists pending ones.
- Events are logged correctly.

Commit message: "Phase 2.5: active clarification dialogue"
```

---

## Prompt 2.6 — Agent learning recalculation

```
Read docs/agent-network-spec.md section 9.4.

1. Create a migration with the SQL functions recompute_agent_observed_attributes() and recompute_all_agent_attributes() from section 9.4.

2. Schedule the recompute_all_agent_attributes() function to run nightly:
   - Use pg_cron if available, OR
   - Create app/api/cron/recompute-agent-attributes/route.ts that calls it, schedule via Vercel Cron at 03:00 IST.

3. Modify app/admin/agents/[id]/page.tsx to display the learned attributes:
   - Add a section "Learned attributes (auto-computed)":
     - Typical district: observed_primary_district
     - Typical taluka: observed_primary_taluka
     - Typical price range: ₹X to ₹Y per acre
     - Typical acreage range: X to Y
     - Accuracy score: percentage with color (>=85% green, 70-85% amber, <70% red)
     - Recent submissions (30d): count

4. Modify the parse API call in inbox creation:
   - When fetching agent for context, also include observed_primary_district, observed_primary_taluka, land_types_handled, observed_price_min_per_acre, observed_price_max_per_acre, trust_tier.
   - Pass these to buildListingParserPrompt as agent_context.

5. Test the auto-publish logic:
   - Add app/lib/auto-publish.ts with the shouldAutoPublish() function from section 9.5.
   - In the inbox creation flow, AFTER all checks (parse, duplicate, price, matching), if shouldAutoPublish() returns true: automatically call /api/whatsapp/inbox-to-listing with the parsed payload.
   - For now, only enable this for a small test set — gate it behind a feature flag in env: NEXT_PUBLIC_AUTO_PUBLISH_ENABLED.
   - Insert agent_events: event_type='auto_publish_triggered'.

DEFINITION OF DONE:
- Running the recompute function for an agent updates their profile attributes.
- Cron runs nightly.
- Agent admin page shows the learned attributes.
- Agent context is now included in parse calls (verify by inspecting Claude responses for context-aware adjustments).
- Auto-publish works when manually enabled and triggers correctly.

Commit message: "Phase 2.6: agent learning and auto-publish foundation"
```

---

## Prompt 2.7 — Regional terminology dictionary

```
1. Create docs/regional-land-terms.md with the dictionary from spec section "Regional terminology" in v2 spec (Part B). Use the same content. Cover at minimum: Karnataka, Tamil Nadu, Telangana, Andhra Pradesh, Maharashtra, Kerala. Include unit conversions, terminology, classifications.

2. Modify app/lib/prompts/listing-parser.ts:
   - Read the dictionary at server startup (use Node's fs.readFileSync).
   - Inject the dictionary content into the system prompt under a "REGIONAL TERMINOLOGY REFERENCE" section, after the existing REGIONAL TERMINOLOGY block.
   - Cache the dictionary in memory; don't read it on every parse.

3. Test with at least 3 messages in different regional languages/terminologies:
   - Karnataka: "20 gunta land Bommasandra near Bangalore. DC done. 50 lakh."
   - Tamil Nadu: "30 cent Nanjai land Hosur. Patta available."
   - Maharashtra: "2 hectare farmland Pune district, 7/12 clear, 80 lakh per hectare."

4. Verify parse accuracy improves vs the previous version (track in agent_events; mark improvements vs baseline).

DEFINITION OF DONE:
- docs/regional-land-terms.md exists with comprehensive content per state.
- Dictionary is loaded into the parser at startup.
- Regional terms like "Nanjai", "DC done", "7/12 clear" are correctly interpreted.
- Parse cost stays within ±20% of baseline (the longer system prompt should not blow up cost significantly).

Commit message: "Phase 2.7: regional terminology dictionary"
```

---

## End of Phase 2

After all 7 prompts pass, push the branch.

Test the full intelligent flow:
1. Send a Kannada voice note → transcription works
2. Send a property with a duplicate survey number → flagged correctly
3. Send a property at 5x district median price → flagged correctly
4. Send a property that matches an existing buyer requirement → match shown
5. Send a property missing critical info → clarification message generated
6. Verify learned attributes appear on agent admin page after the daily cron runs

This is now a smart agent ingestion system.

---

# 12. Phase 3 build prompts

**Goal:** Land record API integration. Listings backed by government records show a strong trust signal.

**Estimated duration:** 3 weeks.

---

## Prompt 3.1 — Land record adapter abstraction + manual adapter

```
Read docs/agent-network-spec.md section 4 (LandRecordAdapter types) and section 5.6.

1. Create directory app/lib/land-records/.

2. Create app/lib/land-records/types.ts re-exporting LandRecordRequest, LandRecordResult, LandRecordAdapter from agent-types.ts. (Or define them here and import from here going forward.)

3. Create app/lib/land-records/adapter-manual.ts:
   - export class ManualAdapter implements LandRecordAdapter
   - state = '*' (matches any)
   - source = 'manual'
   - isAvailable() returns true
   - fetch(req): looks up the land_records table by the request keys. If a manual record exists, returns it. Otherwise throws NOT_FOUND.
   - costPerFetchInr() returns 0.

4. Create app/lib/land-records/cache.ts:
   - export async function getCachedRecord(req: LandRecordRequest): Promise<LandRecordResult | null>
   - export async function setCachedRecord(result: LandRecordResult, req: LandRecordRequest, ttlDays: number = 90): Promise<LandRecordResult>
   - Both interact with the land_records table.

5. Create app/lib/land-records/registry.ts:
   - A simple registry mapping state codes to adapter instances.
   - export function getAdapter(state: string): LandRecordAdapter
   - For now, only registers ManualAdapter for all states.

6. Create app/api/land-records/fetch/route.ts implementing section 5.6:
   - First check cache.
   - If miss, call adapter.fetch().
   - On success, write to cache.
   - Return the result.

7. Create app/admin/land-records/page.tsx — search interface:
   - Form: state/district/taluka/village/survey_number/sub_division.
   - On submit: hits /api/land-records/fetch.
   - If found: displays the record with all fields.
   - If not found: shows a "Add manually" button → opens a form to insert into land_records.

DEFINITION OF DONE:
- ManualAdapter compiles and works.
- /admin/land-records page lets me search.
- I can manually create a record and it shows up on subsequent searches (cached).
- The fetch API returns 404 cleanly when no record exists.

Commit message: "Phase 3.1: land record adapter abstraction with manual adapter"
```

---

## Prompt 3.2 — Wire fetch button into inbox processor

```
Read docs/agent-network-spec.md section 8.1 (survey number section).

1. Enable the "Fetch land record" button in InboxProcessor.tsx:
   - Button is enabled when: survey_number is non-empty AND state, district, taluka, village are filled in.
   - On click: calls /api/land-records/fetch with the relevant fields.

2. Display the result inline below the button:
   - If 404: show "No record found. [Add manually]" button that opens a modal.
   - If found:
     - Source badge: "From [source]" (e.g. "Manual entry by admin", "TamilNilam Geo-Info")
     - Retrieved at timestamp
     - Owners list (each with name and percentage if available)
     - Extent value + unit (highlighted in red if it doesn't match the draft acreage by >5%)
     - Classification
     - FMB sketch thumbnail (if URL present) — click for full view
     - Encumbrance status
     - "Use this data" button → overwrites the draft fields with the record values.
     - "Attach to listing" toggle (default on) → on publish, link this land_record_id to the listing.

3. Modify the Publish action:
   - If land_record_id is set in the draft state, include it in the listing creation payload.

DEFINITION OF DONE:
- "Fetch land record" button works when survey + location are filled.
- A previously-cached record appears instantly on subsequent fetches.
- The "Use this data" button correctly overwrites draft fields.
- Mismatched extent shows the warning.
- Published listing has land_record_id set.

Commit message: "Phase 3.2: land record fetch in inbox processor"
```

---

## Prompt 3.3 — Public listing detail integration

```
1. Modify app/listing/[id]/page.tsx:
   - If listings.land_record_id is set, fetch the land_record.
   - Render a new LandRecordViewer component (create at app/components/agents/LandRecordViewer.tsx):
     - "✓ Verified via [source] on [date]" prominent badge
     - Owners (public — these are public govt records)
     - Extent
     - Classification
     - FMB sketch embedded (use an <img> for now; PDF support can come later)
     - Disclaimer: "Government land record data shown is for informational purposes. It reflects the official record at the time of fetch and may have changed. Always verify directly with the relevant Taluk office before any transaction."

2. The owner name from the land record is publicly displayed. But owner phone numbers from inbox are NEVER displayed publicly — verify this in your code.

3. Add an OpenGraph image preview that includes the "Verified" badge for listings with land_record_id. (Use the existing OG image generation if available; otherwise just static text.)

DEFINITION OF DONE:
- A listing with a linked land record shows the verification badge prominently.
- FMB sketch image renders if URL is set.
- Disclaimer is shown.
- Owner phone is never visible on the public page.

Commit message: "Phase 3.3: public listing verification badge"
```

---

## Prompt 3.4 — Landeed adapter scaffold (placeholder for future)

```
1. Create app/lib/land-records/adapter-landeed.ts as a STUB:
   - export class LandeedAdapter implements LandRecordAdapter
   - state = '*'
   - source = 'landeed'
   - isAvailable() returns false  // not yet integrated
   - fetch(req) throws "Not implemented — Landeed API not yet integrated"
   - costPerFetchInr() returns 100  // placeholder

2. Add a comment block at the top explaining: "Replace these stubs once Landeed (or another aggregator) provides API access. Add LANDEED_API_KEY to .env, fill in fetch() to call their endpoint, and update isAvailable() to check env."

3. Do NOT register LandeedAdapter in the registry yet — that happens after a real integration agreement.

DEFINITION OF DONE:
- File exists as a placeholder.
- TypeScript compiles.
- Manual adapter remains the only registered adapter.

Commit message: "Phase 3.4: Landeed adapter scaffold (stub)"
```

---

# 13. Phase 4 build prompts

**Goal:** Mobile app via PWA.

**Estimated duration:** 4 weeks.

I'll provide these prompts at the start of Phase 4 — they depend on what we learn from Phases 1-3. Expect:

- 4.1: PWA manifest, service worker, install prompt
- 4.2: Mobile-optimized layouts for existing pages
- 4.3: Mobile "Add Property" wizard with land record auto-fetch
- 4.4: Mobile auth flow (phone OTP)
- 4.5: Mobile leads list with click-to-call
- 4.6: Mobile submissions API and admin queue
- 4.7: App store submission preparation (TWA for Play Store)

---

# 14. Phase 5 build prompts

**Goal:** BSP integration + auto-publish + weekly summaries.

**Estimated duration:** 3 weeks.

Trigger: 50+ active agents, 30+ messages/day sustained for 4 weeks.

Prompts will cover:
- 5.1: BSP provider selection and signup (Gupshup recommended)
- 5.2: Webhook endpoint at /api/whatsapp/inbound
- 5.3: Automated outbound message sending
- 5.4: Template approval workflow (WhatsApp policy)
- 5.5: Auto-publish for trusted agents (enabling at scale)
- 5.6: Weekly summary message scheduler
- 5.7: Status update parsing (SOLD, PRICE CHANGE, WITHDRAWN)

---

# 15. Operational runbook

For the AcrehubIndia team. Lives at `docs/operations-runbook.md` after Phase 1 ships.

## 15.1 Daily

Morning (one hour):
- Open `/admin/whatsapp/inbox`. Process all rows from the last 24 hours.
- Open `/admin/whatsapp/clarifications`. Follow up on any overdue (>48h) clarifications via WhatsApp.
- Open `/admin/whatsapp/duplicates`. Resolve any pending duplicate-suspected rows.

Evening (15 minutes):
- Quick scan of `/admin/agents/applications` for new applications.
- Quick scan of `/admin/listings/pending` for any drafts.

## 15.2 Weekly

Monday:
- Review all agents in `/admin/agents` who submitted >5 listings in the past week.
- Consider promoting trust_tier or toggling auto_publish_listings for high performers.
- Send any backlog buyer-requirement broadcasts (template 6.6).

Friday:
- Review the API spend dashboard (Anthropic console + OpenAI dashboard).
- If spend exceeds weekly budget by >20%, investigate which agents/days drove it.

## 15.3 Monthly

First Monday:
- Recompute agent attributes if cron has failed (manual trigger via Supabase).
- Lawyer review any new copy or workflows added that month.
- Review the duplicate-detection false-positive rate.
- Refresh the regional-terminology dictionary if new state-specific terms have emerged.

## 15.4 When something breaks

**Claude API down or rate-limited:**
- Parsing falls back to manual: admin reads the message and fills the draft form directly.
- The system should still create inbox rows and let admins work on them.

**Whisper API down:**
- Voice notes upload but transcription fails. Admin can listen to the audio player directly and type the transcript manually in the field.

**Supabase down:**
- The whole site is down. Wait it out (Supabase has SLAs).
- Have a paper backup of agent phone numbers in case you need to reach them.

**Cost spike:**
- Check Anthropic Console for usage spike.
- Check the spending cap — adjust if a legitimate spike, investigate if not.
- Inspect agent_events for unusual patterns (one phone sending hundreds of messages).

---

# 16. Compliance and disclaimers

Reproduce on every relevant page.

## 16.1 On /agents/join (ethics acknowledgement)

Exact text in section 8.3.

## 16.2 On every listing detail page (buyer disclaimer)

```
This property is listed by a local Acrehub agent based on information provided to us. Please independently verify ownership, title, documents, land use, access, and legal status before any payment or agreement. Acrehub does not guarantee the accuracy of agent-provided information.
```

## 16.3 On listing detail pages with land_record_id

```
Government land record data shown is for informational purposes. It reflects the official record at the time of fetch and may have changed. Always verify directly with the relevant Taluk office before any transaction.
```

## 16.4 Voice transcription consent

When an agent first sends a voice note, the initial reply should include:

```
Voice notes are transcribed by software to help create your listing. The transcript is stored alongside your submission and used only for processing your property.
```

## 16.5 Pre-launch lawyer review

The following must be reviewed and signed off by a lawyer before Phase 1 ships:

- Ethics acknowledgement text (section 8.3)
- Buyer disclaimer text (16.2)
- Land record disclaimer text (16.3)
- The home page "Are you a land agent?" copy
- The /agents/how-it-works page
- The full agent join flow (verification, suspension, account closure policies)

---

*end of build-ready spec*
