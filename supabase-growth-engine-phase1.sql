-- =====================================================================
-- Growth Engine — Phase 1.1 foundation  (REVISED per review)
-- Spec: docs/growth-engine-spec-aggressive-v2.md (sections 3, 5, 6, 9)
-- Apply MANUALLY in the Supabase SQL Editor (repo convention: flat
-- root-level supabase-*.sql, not supabase/migrations/).
--
-- v1 NOTE: the referenced "v1" spec is absent from the repo. The 7
-- foundational tables are reconstructed from v2 usage + reviewer revisions.
--
-- STATE NOTE: listings has NO `state` column (only district/taluka/village).
-- The on_listing_published trigger derives state via the district_to_state
-- lookup table (seeded from agent_profiles). Unknown districts → state NULL;
-- admin adds the mapping later. The auto-distribute function (deferred, not
-- attached) routes on district + land_type only; Phase 2.1 finalizes state.
--
-- PRICE NOTE: listings has a single `price` (numeric) + `price_basis` text
-- ('total' | 'per_acre' | 'per_guntha' | 'per_sqft') — NOT price_per_acre/
-- total_price. price_text is built with format_inr_price() + a basis suffix.
--
-- is_admin() already exists (supabase-setup.sql). Referenced, not redefined.
-- =====================================================================

-- Reusable updated_at trigger (self-contained; mirrors agent_set_updated_at).
create or replace function public.growth_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ---------------------------------------------------------------------
-- 0. district_to_state — small lookup so growth_assets/state can be filled.
--    Seeded from agent_profiles; admin maintains gaps via admin UI later.
-- ---------------------------------------------------------------------
create table if not exists public.district_to_state (
  district text primary key,
  state text not null
);

insert into public.district_to_state (district, state)
select distinct district, state
  from public.agent_profiles
 where district is not null and state is not null
on conflict (district) do nothing;

-- Explicit seed for districts that currently have listings but no agent-derived
-- mapping (verified against live data 2026-06; spellings match listings.district).
insert into public.district_to_state (district, state) values
  ('Bengaluru Urban', 'Karnataka'),
  ('Krishnagiri',     'Tamil Nadu'),
  ('Mandya',          'Karnataka'),
  ('Mysuru',          'Karnataka'),
  ('Pune',            'Maharashtra')
on conflict (district) do nothing;

alter table public.district_to_state enable row level security;

drop policy if exists "public read district_to_state" on public.district_to_state;
create policy "public read district_to_state"
  on public.district_to_state for select using (true);

drop policy if exists "admins write district_to_state" on public.district_to_state;
create policy "admins write district_to_state"
  on public.district_to_state for all using (is_admin()) with check (is_admin());


-- ---------------------------------------------------------------------
-- Helper: format a rupee amount with Indian lakh/crore conventions.
-- ---------------------------------------------------------------------
create or replace function public.format_inr_price(amount bigint) returns text as $$
begin
  if amount is null then return null;
  elsif amount >= 10000000 then
    return '₹' || round((amount::numeric / 10000000), 2)::text || 'cr';
  elsif amount >= 100000 then
    return '₹' || round((amount::numeric / 100000), 1)::text || 'L';
  else
    return '₹' || amount::text;
  end if;
end;
$$ language plpgsql immutable;


-- ---------------------------------------------------------------------
-- 1. growth_assets
-- ---------------------------------------------------------------------
create table if not exists public.growth_assets (
  id uuid primary key default gen_random_uuid(),
  asset_type text not null check (asset_type in (
    'listing', 'agent', 'requirement', 'co_buy', 'guide', 'channel'
  )),
  entity_id uuid not null,
  title text,
  public_url text not null,
  short_description text,
  state text,
  district text,
  taluka text,
  land_type text,
  price_text text,
  trust_label text,
  image_url text,
  status text default 'ready' check (status in (
    'draft', 'ready', 'distributed', 'paused', 'archived'
  )),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (asset_type, entity_id)
);

create index if not exists idx_growth_assets_type on public.growth_assets(asset_type);
create index if not exists idx_growth_assets_status on public.growth_assets(status);
create index if not exists idx_growth_assets_geo on public.growth_assets(state, district, taluka);

drop trigger if exists trg_growth_assets_updated_at on public.growth_assets;
create trigger trg_growth_assets_updated_at
  before update on public.growth_assets
  for each row execute function public.growth_set_updated_at();

alter table public.growth_assets enable row level security;

drop policy if exists "public read distributable assets" on public.growth_assets;
create policy "public read distributable assets"
  on public.growth_assets for select
  using (status in ('ready', 'distributed'));

drop policy if exists "admins manage growth assets" on public.growth_assets;
create policy "admins manage growth assets"
  on public.growth_assets for all using (is_admin()) with check (is_admin());


-- ---------------------------------------------------------------------
-- 2. referral_codes
-- ---------------------------------------------------------------------
create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  agent_id uuid references public.agent_profiles(id) on delete cascade,
  referral_type text not null default 'buyer' check (referral_type in (
    'buyer', 'seller', 'agent', 'developer', 'aggregator', 'internal'
  )),
  status text default 'active' check (status in ('active', 'paused', 'blocked')),
  created_at timestamptz default now()
);

create index if not exists idx_referral_codes_user on public.referral_codes(user_id);
create index if not exists idx_referral_codes_agent on public.referral_codes(agent_id);

alter table public.referral_codes enable row level security;

drop policy if exists "users read own referral code" on public.referral_codes;
create policy "users read own referral code"
  on public.referral_codes for select using (user_id = auth.uid());

drop policy if exists "admins manage referral codes" on public.referral_codes;
create policy "admins manage referral codes"
  on public.referral_codes for all using (is_admin()) with check (is_admin());


-- ---------------------------------------------------------------------
-- 3. referral_events
-- ---------------------------------------------------------------------
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referral_code text,
  referrer_user_id uuid references auth.users(id) on delete set null,
  referred_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in (
    'signup', 'agent_joined', 'requirement_submitted',
    'enquiry_submitted', 'co_buy_interest', 'listing_created', 'click'
  )),
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_referral_events_code on public.referral_events(referral_code);
create index if not exists idx_referral_events_referrer on public.referral_events(referrer_user_id);
create index if not exists idx_referral_events_type on public.referral_events(event_type);

alter table public.referral_events enable row level security;

drop policy if exists "admins manage referral events" on public.referral_events;
create policy "admins manage referral events"
  on public.referral_events for all using (is_admin()) with check (is_admin());
-- (Inserts happen via service-role API routes, which bypass RLS.)


-- ---------------------------------------------------------------------
-- 4. share_links
-- ---------------------------------------------------------------------
create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  short_code text unique not null,
  target_url text not null,
  asset_id uuid references public.growth_assets(id) on delete set null,
  entity_type text,
  entity_id uuid,
  referral_code text,
  channel text check (channel in (
    'whatsapp', 'telegram', 'email', 'sms', 'qr',
    'agent_share', 'direct', 'seo', 'referral'
  )),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  created_by uuid references auth.users(id) on delete set null,
  click_count integer default 0,
  last_clicked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_share_links_code on public.share_links(short_code);
create index if not exists idx_share_links_asset on public.share_links(asset_id);
create index if not exists idx_share_links_creator on public.share_links(created_by);
create index if not exists idx_share_links_channel on public.share_links(channel);
create index if not exists idx_share_links_campaign on public.share_links(utm_campaign);

drop trigger if exists trg_share_links_updated_at on public.share_links;
create trigger trg_share_links_updated_at
  before update on public.share_links
  for each row execute function public.growth_set_updated_at();

alter table public.share_links enable row level security;

drop policy if exists "public read share links" on public.share_links;
create policy "public read share links"
  on public.share_links for select using (true);

drop policy if exists "authenticated create own share links" on public.share_links;
create policy "authenticated create own share links"
  on public.share_links for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "admins manage share links" on public.share_links;
create policy "admins manage share links"
  on public.share_links for all using (is_admin()) with check (is_admin());


-- ---------------------------------------------------------------------
-- 5. growth_events  (event_type intentionally free text — no CHECK)
-- ---------------------------------------------------------------------
create table if not exists public.growth_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  asset_id uuid references public.growth_assets(id) on delete set null,
  share_link_id uuid references public.share_links(id) on delete set null,
  referral_code text,
  entity_type text,
  entity_id uuid,
  channel text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  state text,
  district text,
  taluka text,
  land_type text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_growth_events_user on public.growth_events(user_id);
create index if not exists idx_growth_events_session on public.growth_events(session_id);
create index if not exists idx_growth_events_asset on public.growth_events(asset_id);
create index if not exists idx_growth_events_referral on public.growth_events(referral_code);
create index if not exists idx_growth_events_campaign on public.growth_events(utm_campaign);
create index if not exists idx_growth_events_created on public.growth_events(created_at desc);
create index if not exists idx_growth_events_geo on public.growth_events(state, district, taluka);

alter table public.growth_events enable row level security;

-- Anonymous + authenticated may log a fixed allow-list of low-risk events.
drop policy if exists "anon insert allowed growth events" on public.growth_events;
create policy "anon insert allowed growth events"
  on public.growth_events for insert to anon, authenticated
  with check (event_type in (
    'page_view', 'listing_view', 'listing_share_clicked',
    'whatsapp_share_clicked', 'telegram_post_clicked', 'referral_link_clicked',
    'qr_scanned', 'short_link_clicked', 'saved_listing', 'compare_used'
  ));

drop policy if exists "admins read growth events" on public.growth_events;
create policy "admins read growth events"
  on public.growth_events for select using (is_admin());
-- (Server-side service-role writes bypass RLS for any other event_type.)


-- ---------------------------------------------------------------------
-- 6. contact_preferences  (one row per user; booleans per channel)
-- ---------------------------------------------------------------------
create table if not exists public.contact_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  phone text,
  whatsapp text,
  email text,
  opt_in_whatsapp boolean default false,
  opt_in_email boolean default false,
  opt_in_sms boolean default false,
  opt_in_telegram boolean default false,
  opt_in_source text,
  opt_in_at timestamptz,
  opt_out_at timestamptz,
  preferred_language text default 'en',
  preferred_states text[] default array[]::text[],
  preferred_districts text[] default array[]::text[],
  preferred_land_types text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists uniq_contact_prefs_user
  on public.contact_preferences(user_id) where user_id is not null;
create unique index if not exists uniq_contact_prefs_email_anon
  on public.contact_preferences(email) where user_id is null and email is not null;
create index if not exists idx_contact_prefs_optins
  on public.contact_preferences(opt_in_whatsapp, opt_in_email, opt_in_telegram);

drop trigger if exists trg_contact_prefs_updated_at on public.contact_preferences;
create trigger trg_contact_prefs_updated_at
  before update on public.contact_preferences
  for each row execute function public.growth_set_updated_at();

alter table public.contact_preferences enable row level security;

drop policy if exists "users manage own contact preferences" on public.contact_preferences;
create policy "users manage own contact preferences"
  on public.contact_preferences for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "admins read contact preferences" on public.contact_preferences;
create policy "admins read contact preferences"
  on public.contact_preferences for select using (is_admin());


-- ---------------------------------------------------------------------
-- 7. content_templates
-- ---------------------------------------------------------------------
create table if not exists public.content_templates (
  id uuid primary key default gen_random_uuid(),
  template_name text not null,
  template_type text not null check (template_type in (
    'whatsapp', 'telegram', 'email', 'sms', 'social', 'poster',
    'listing_card', 'agent_card'
  )),
  language text default 'en',
  template_body text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (template_name, language)
);

create index if not exists idx_content_templates_name on public.content_templates(template_name);

drop trigger if exists trg_content_templates_updated_at on public.content_templates;
create trigger trg_content_templates_updated_at
  before update on public.content_templates
  for each row execute function public.growth_set_updated_at();

alter table public.content_templates enable row level security;

drop policy if exists "public read active templates" on public.content_templates;
create policy "public read active templates"
  on public.content_templates for select using (is_active = true);

drop policy if exists "admins manage content templates" on public.content_templates;
create policy "admins manage content templates"
  on public.content_templates for all using (is_admin()) with check (is_admin());


-- ---------------------------------------------------------------------
-- 8. acrehub_owned_channels  (verbatim from spec 6.1)
-- ---------------------------------------------------------------------
create table if not exists public.acrehub_owned_channels (
  id uuid primary key default gen_random_uuid(),
  channel_kind text not null check (channel_kind in (
    'telegram_channel', 'telegram_group',
    'whatsapp_community', 'whatsapp_community_subgroup',
    'email_list'
  )),
  name text not null,
  slug text unique not null,
  description text,
  public_join_url text,
  internal_id text,
  bot_token_env_var text,
  target_state text,
  target_district text,
  target_taluka text,
  target_land_types text[] default array[]::text[],
  target_audience text,
  auto_publish_enabled boolean default true,
  approval_required boolean default true,
  daily_post_limit integer default 5,
  status text default 'active' check (status in ('active', 'paused', 'archived')),
  member_count integer default 0,
  last_member_count_refresh timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_owned_channels_kind on public.acrehub_owned_channels(channel_kind);
create index if not exists idx_owned_channels_state on public.acrehub_owned_channels(target_state);
create index if not exists idx_owned_channels_district on public.acrehub_owned_channels(target_district);
create index if not exists idx_owned_channels_status on public.acrehub_owned_channels(status);

drop trigger if exists trg_owned_channels_updated_at on public.acrehub_owned_channels;
create trigger trg_owned_channels_updated_at
  before update on public.acrehub_owned_channels
  for each row execute function public.growth_set_updated_at();

alter table public.acrehub_owned_channels enable row level security;

drop policy if exists "public read active channels" on public.acrehub_owned_channels;
create policy "public read active channels"
  on public.acrehub_owned_channels for select using (status = 'active');

drop policy if exists "admins manage channels" on public.acrehub_owned_channels;
create policy "admins manage channels"
  on public.acrehub_owned_channels for all using (is_admin()) with check (is_admin());


-- ---------------------------------------------------------------------
-- 9. agent_share_groups  (spec 6.2 — LABELS only)
-- AUTH MODEL: in this project the "agent" who logs in and forwards listings is
-- an AUTH USER (profiles.user_type='agent'). The /agent dashboard already scopes
-- to auth.uid() (listings.owner_user_id, deals.agent_user_id). agent_profiles is
-- a SEPARATE admin-managed directory with no auth link, so share groups are NOT
-- tied to it — they belong to the auth user, keyed by agent_user_id (mirrors
-- deals.agent_user_id). This makes the spec's self-service RLS work as intended.
-- ---------------------------------------------------------------------
-- Drop+recreate: an earlier partial run may have created this table with the old
-- agent_id (→agent_profiles) column. It's brand-new and empty, so this is safe
-- and makes the migration re-runnable to the correct shape.
drop table if exists public.agent_share_groups cascade;
create table public.agent_share_groups (
  id uuid primary key default gen_random_uuid(),
  agent_user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_agent_share_groups_user on public.agent_share_groups(agent_user_id);

alter table public.agent_share_groups enable row level security;

-- (drop any legacy policy names from earlier iterations before recreating)
drop policy if exists "agents manage their own share groups" on public.agent_share_groups;
drop policy if exists "admins read all share groups" on public.agent_share_groups;
drop policy if exists "admins manage share groups" on public.agent_share_groups;

create policy "agents manage their own share groups"
  on public.agent_share_groups for all
  using (agent_user_id = auth.uid()) with check (agent_user_id = auth.uid());

create policy "admins read all share groups"
  on public.agent_share_groups for select using (is_admin());


-- ---------------------------------------------------------------------
-- Helper: atomic click increment for share_links.
-- ---------------------------------------------------------------------
create or replace function public.increment_share_link_clicks(p_short_code text)
returns void as $$
  update public.share_links
     set click_count = click_count + 1,
         last_clicked_at = now()
   where short_code = p_short_code;
$$ language sql;


-- ---------------------------------------------------------------------
-- Trigger fn: on_listing_published — snapshot an active listing into
-- growth_assets. Fires only on transitions INTO active.
--   state      ← district_to_state lookup (NULL if district unmapped)
--   price_text ← format_inr_price(price) + suffix from price_basis
--   trust_label← is_verified ? 'Verified' : 'Owner-listed'
--   image_url  ← first photo
-- ---------------------------------------------------------------------
create or replace function public.on_listing_published() returns trigger as $$
declare
  v_state text;
  v_price_text text;
begin
  if NEW.status = 'active'
     and (OLD.status is null or OLD.status is distinct from 'active') then

    select state into v_state
      from public.district_to_state
     where district = NEW.district;

    v_price_text := case
      when NEW.price is null then null
      when NEW.price_basis = 'per_acre'   then public.format_inr_price(NEW.price::bigint) || '/acre'
      when NEW.price_basis = 'per_guntha' then public.format_inr_price(NEW.price::bigint) || '/guntha'
      when NEW.price_basis = 'per_sqft'   then public.format_inr_price(NEW.price::bigint) || '/sq ft'
      else public.format_inr_price(NEW.price::bigint)
    end;

    insert into public.growth_assets (
      asset_type, entity_id, public_url, title, short_description,
      state, district, taluka, land_type, price_text, trust_label, image_url, status
    ) values (
      'listing',
      NEW.id,
      'https://acrehubindia.com/listing/' || NEW.id,
      NEW.title,
      left(NEW.description, 200),
      v_state,
      NEW.district,
      NEW.taluka,
      NEW.land_type,
      v_price_text,
      case when NEW.is_verified then 'Verified' else 'Owner-listed' end,
      (NEW.photos)[1],
      'ready'
    )
    on conflict (asset_type, entity_id) do update set
      public_url        = excluded.public_url,
      title             = excluded.title,
      short_description = excluded.short_description,
      state             = excluded.state,
      district          = excluded.district,
      taluka            = excluded.taluka,
      land_type         = excluded.land_type,
      price_text        = excluded.price_text,
      trust_label       = excluded.trust_label,
      image_url         = excluded.image_url,
      updated_at        = now();
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_listing_published on public.listings;
create trigger trg_listing_published
  after insert or update on public.listings
  for each row execute function public.on_listing_published();


-- ---------------------------------------------------------------------
-- Trigger fn: on_listing_auto_distribute — drafts distribution_posts for
-- matching owned channels. CREATED here but NOT ATTACHED — Phase 2.1 attaches
-- it once distribution_posts exists. Routes on district + land_type (no state
-- column on listings yet). Safe to create: plpgsql bodies aren't resolved
-- against table existence until first execution.
-- ---------------------------------------------------------------------
create or replace function public.on_listing_auto_distribute() returns trigger as $$
declare
  v_asset_id uuid;
  v_channel  record;
begin
  if NEW.status != 'active'
     or (OLD.status is not null and OLD.status = 'active') then
    return NEW;
  end if;

  select id into v_asset_id from public.growth_assets
   where asset_type = 'listing' and entity_id = NEW.id
   order by created_at desc limit 1;
  if v_asset_id is null then return NEW; end if;

  for v_channel in
    select * from public.acrehub_owned_channels
     where status = 'active'
       and auto_publish_enabled = true
       and (target_district is null or target_district = NEW.district)
       and (target_land_types = array[]::text[] or NEW.land_type = any(target_land_types))
  loop
    insert into public.distribution_posts (asset_id, owned_channel_id, post_text, status, created_at)
    values (
      v_asset_id, v_channel.id, null,
      case when v_channel.approval_required then 'pending_approval' else 'ready_to_publish' end,
      now()
    );
  end loop;

  return NEW;
end;
$$ language plpgsql;
-- NOTE: trigger attachment intentionally omitted until Phase 2.1.


-- ---------------------------------------------------------------------
-- Seed: content templates from spec section 9 (English).
-- v1's original 6 templates are pending reconciliation (v1 spec absent).
-- Lawyer-review before any public send (spec 5.5).
-- ---------------------------------------------------------------------
insert into public.content_templates (template_name, template_type, language, template_body, description) values
('listing_share', 'whatsapp', 'en',
$tpl$🌾 New on Acrehub: {{title}}

📍 {{location}}
📐 {{acreage}}
💰 {{price_per_acre}}/acre
{{features_top3}}

✅ {{trust_label}}

➡️ Full details + photos: {{tracked_url}}

🔔 Want every new listing in {{district}}?
Join the AcreHub channel: {{district_channel_url}}$tpl$,
'Aggressive listing share text (WhatsApp), spec 9.1'),

('agent_forward', 'whatsapp', 'en',
$tpl$Found this on Acrehub — looks like a fit for someone here.

{{title}}
📍 {{location}}
📐 {{acreage}} @ {{price_per_acre}}/acre
{{trust_label}}

Details: {{tracked_url}}

(Forwarded by {{agent_name}} — message me if interested. — Acrehub)$tpl$,
'Agent forward template, spec 9.2'),

('tg_state', 'telegram', 'en',
$tpl$🌾 *New listing in {{district}}, {{state}}*

*{{title}}*
{{location}} · {{acreage}} · {{price_per_acre}}/acre

{{features_summary}}

{{trust_label}}

[View on Acrehub]({{tracked_url}})$tpl$,
'Telegram state channel post, spec 9.3'),

('tg_district', 'telegram', 'en',
$tpl$*New listing*

*{{title}}*
📍 {{village}} · {{acreage}} · {{price_per_acre}}/acre
🚰 {{water}} · 🛣 {{road_access}} · 📜 {{title_status}}
{{trust_label}}

{{tracked_url}}$tpl$,
'Telegram district channel post, spec 9.3'),

('tg_land_type', 'telegram', 'en',
$tpl$*Farm plot — {{location}}*

{{acreage}} @ {{price_per_acre}}/acre
{{features_top3}}
{{trust_label}}

{{tracked_url}}$tpl$,
'Telegram land-type channel post, spec 9.3'),

('recruit_general', 'whatsapp', 'en',
$tpl$🔔 Want every new {{district}} listing automatically?
Join: {{district_channel_url}}$tpl$,
'Channel recruitment footer — general buyers, spec 9.4'),

('recruit_agent', 'whatsapp', 'en',
$tpl$🔔 Earn commissions on AcreHub buyer matches in your area.
Join the Acrehub agent network: {{agent_network_url}}$tpl$,
'Channel recruitment footer — agents, spec 9.4'),

('recruit_nri', 'whatsapp', 'en',
$tpl$🔔 NRI looking for land in India? Get vetted opportunities first.
Join: {{nri_channel_url}}$tpl$,
'Channel recruitment footer — NRI, spec 9.4')
on conflict (template_name, language) do nothing;


-- ---------------------------------------------------------------------
-- One-time backfill: snapshot EXISTING active listings into growth_assets.
-- The trigger only fires on transitions INTO active, so pre-existing active
-- listings need this. Idempotent (on conflict do nothing); replays the exact
-- trigger logic via format_inr_price() + the district_to_state join.
-- ---------------------------------------------------------------------
insert into public.growth_assets (
  asset_type, entity_id, public_url, title, short_description,
  state, district, taluka, land_type, price_text, trust_label, image_url, status)
select 'listing', l.id, 'https://acrehubindia.com/listing/' || l.id,
  l.title, left(l.description, 200),
  d.state, l.district, l.taluka, l.land_type,
  case when l.price is null then null
       when l.price_basis = 'per_acre'   then public.format_inr_price(l.price::bigint) || '/acre'
       when l.price_basis = 'per_guntha' then public.format_inr_price(l.price::bigint) || '/guntha'
       when l.price_basis = 'per_sqft'   then public.format_inr_price(l.price::bigint) || '/sq ft'
       else public.format_inr_price(l.price::bigint) end,
  case when l.is_verified then 'Verified' else 'Owner-listed' end,
  (l.photos)[1], 'ready'
from public.listings l
left join public.district_to_state d on d.district = l.district
where l.status = 'active'
on conflict (asset_type, entity_id) do nothing;


-- =====================================================================
-- DEFINITION OF DONE (spec Prompt 1.1):
--  [x] 9 tables exist with revised columns
--  [x] 8 content templates seeded (template_name/template_type/template_body)
--  [x] insert active listing → growth_assets snapshot row (trg_listing_published)
--  [x] on_listing_auto_distribute() created but NOT attached (Phase 2.1)
--  [ ] seed real acrehub_owned_channels rows: needs Telegram channel IDs +
--      bot token env vars before Phase 2 publishing works.
-- =====================================================================
