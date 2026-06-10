-- Acrehub Buying Circles — Phase 1 migration
-- Run once in the Supabase SQL Editor. Defensive (IF NOT EXISTS) so re-running is safe.
-- Companion: docs/buying-circles-spec.md (section 3).

-- 1. Mark listings as co-buy eligible
alter table listings add column if not exists is_co_buy_eligible boolean default false;
create index if not exists listings_co_buy_eligible_idx on listings(is_co_buy_eligible)
  where is_co_buy_eligible = true;

-- 2. Co-buy opportunities (one per eligible listing, manually curated by admin)
create table if not exists co_buy_opportunities (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  slug text unique not null,
  title text not null,
  summary text,
  status text not null default 'draft',
    -- 'draft' | 'legal_screening' | 'open_for_interest' | 'forming_circle'
    -- | 'paused' | 'closed' | 'cancelled'
  total_area_value numeric,
  total_area_unit text,                                      -- 'acre' | 'guntha' | 'cent'
  total_price bigint,                                        -- rupees stored as bigint
  estimated_all_in_cost bigint,
  price_per_acre bigint,
  min_contribution bigint,
  suggested_contribution bigint,
  max_members integer,
  target_members integer,
  current_interest_count integer default 0,                  -- denormalized count, updated by admin/trigger
  current_soft_commitment_amount bigint default 0,           -- single field, no per-buyer commitment system
  legal_caution_level text default 'standard',               -- 'standard' | 'elevated' | 'high'
  is_nri_allowed boolean default false,
  site_visit_dates jsonb default '[]',                       -- array of ISO date strings; read-only display
  service_layer_enabled boolean default true,
  public_disclaimer text,                                    -- per-opportunity disclaimer override
  internal_notes text,                                       -- admin-only
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_opps_listing_id_idx on co_buy_opportunities(listing_id);
create index if not exists co_buy_opps_status_idx on co_buy_opportunities(status);
create index if not exists co_buy_opps_slug_idx on co_buy_opportunities(slug);

-- 3. Buyer interest submissions
create table if not exists co_buy_interests (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references co_buy_opportunities(id) on delete cascade,
  user_id uuid references auth.users(id),                    -- nullable; anonymous interest allowed
  buyer_type text,                                           -- 'indian_resident' | 'nri_oci' | 'company_llp' | 'family_group' | 'farmer' | 'investor' | 'other'
  name text not null,
  phone text not null,
  whatsapp text,
  email text,
  city text,
  budget_min bigint,
  budget_max bigint,
  desired_share_label text,                                  -- '0.5_acre' | '1_acre' | '2_acre' | '5_acre' | 'percentage' | 'budget_based' | 'not_sure'
  desired_contribution bigint,
  purpose text[],                                            -- purpose tags from form
  timeline text,                                             -- 'immediate' | '1_month' | '3_months' | '6_months' | 'exploring'
  coownership_comfort text,                                  -- 'demarcated_portion' | 'undivided_ok' | 'explain_first' | 'wants_call' | 'lawyer_review_first'
  site_visit_interest boolean default false,
  service_interests text[],                                  -- multi-select from service categories
  preferred_call_time text,
  notes text,
  ack_expression_only boolean not null,
  ack_no_legal_advice boolean not null,
  ack_no_ownership_until_registration boolean not null,
  ack_lawyer_review_required boolean not null,
  ack_state_eligibility_varies boolean not null,
  ack_nri_special_review boolean not null,
  ack_service_fees_separate boolean not null,
  ack_consent_to_contact boolean not null,
  status text not null default 'new',
    -- 'new' | 'call_pending' | 'contacted' | 'qualified' | 'not_qualified'
    -- | 'nri_legal_review' | 'added_to_circle' | 'dropped' | 'follow_up_later'
  qualification_notes text,                                  -- admin-only
  assigned_to uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists co_buy_interests_opp_id_idx on co_buy_interests(opportunity_id);
create index if not exists co_buy_interests_status_idx on co_buy_interests(status);
create index if not exists co_buy_interests_user_id_idx on co_buy_interests(user_id)
  where user_id is not null;

-- RLS: co_buy_opportunities ---------------------------------------------------
alter table co_buy_opportunities enable row level security;

drop policy if exists "public reads open opportunities" on co_buy_opportunities;
create policy "public reads open opportunities" on co_buy_opportunities for select
  using (status in ('open_for_interest', 'forming_circle'));

drop policy if exists "admin reads all opportunities" on co_buy_opportunities;
create policy "admin reads all opportunities" on co_buy_opportunities for select to authenticated
  using (is_admin());

drop policy if exists "admin writes opportunities" on co_buy_opportunities;
create policy "admin writes opportunities" on co_buy_opportunities for all to authenticated
  using (is_admin())
  with check (is_admin());

-- RLS: co_buy_interests -------------------------------------------------------
-- No public-insert policy: all inserts go through a server route using the
-- service-role client, which validates the 8 acknowledgement booleans and that
-- the opportunity is open before inserting (see app/api/co-buy/interest).
alter table co_buy_interests enable row level security;

drop policy if exists "authenticated reads own interest" on co_buy_interests;
create policy "authenticated reads own interest" on co_buy_interests for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "admin reads all interests" on co_buy_interests;
create policy "admin reads all interests" on co_buy_interests for select to authenticated
  using (is_admin());

drop policy if exists "admin writes interests" on co_buy_interests;
create policy "admin writes interests" on co_buy_interests for all to authenticated
  using (is_admin())
  with check (is_admin());
