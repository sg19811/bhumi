# Acrehub Growth Engine — Build-Ready Spec (Aggressive v2)

**Status:** Build-ready. Aggressive growth posture.
**Replaces:** growth-engine-spec-build-ready.md (v1)
**Build approach:** Phased over ~15 weeks. Phase 1 is ~4 weeks.
**Posture:** Maximum aggression within legal and platform limits. AcreHub owns and operates a *lot* of channels; agents are weaponized as legitimate forwarders into their existing networks; SEO is built broad early; every action generates attribution.

---

## What this version changes from v1

Same compliance floor; much more aggressive ceiling. Specifically:

**Pushed forward (now Phase 1 or 2 instead of Phase 3):**
- Programmatic SEO state/district landing pages — building early because content compounds
- Agent forwarding toolkit — rich workflows so each agent multiplies your reach into village/broker/family WhatsApp groups they're already in
- Multiple AcreHub-owned Telegram channels (state + district + land-type) — set up day one, not as an afterthought

**New strategic posture:**
- "Default-on" distribution — every new listing auto-posts to all relevant AcreHub-owned channels, admin opts out per listing if needed (instead of opt-in per post)
- AcreHub Telegram channel proliferation — 30+ channels across state/district/land-type/NRI/farm-plot dimensions, all owned, all auto-posted
- Agent referral attribution on every share — agents earn credit for buyer clicks/conversions regardless of channel
- Community-builder strategy: AcreHub creates and recruits members into its own WhatsApp Communities and Telegram channels rather than trying to post into others' (cheaper, more durable, and legal)

**Unchanged from v1:**
- Section on Compliance & Ethics. These are load-bearing rules — they protect the business from account bans, legal exposure, and DPDP violations. They are not legal padding; they are part of the technical design.

**Why the compliance section stays:**

Auto-posting to channels where AcreHub's bot isn't admin is not technically possible via the Telegram Bot API (which is what serious products use); the alternatives (Telethon, Pyrogram, farmed accounts) trigger account bans, violate Telegram ToS, and on India's IT Act side, qualify as unauthorized access. The same logic applies to WhatsApp Group auto-posting — Meta bans business numbers for high spam-report rates, and the bans are non-appealable. The cost of finding out you got it wrong is account loss + lawsuits, and recovery is slow and expensive.

The aggression in this spec lives in:
1. Owning lots of channels
2. Weaponizing agent reach (agents have legitimate access to groups; AcreHub provides high-converting copy + tracking)
3. Maxing out every legal multiplier (referrals, SEO, opt-in broadcasts, communities)

That posture beats "spam more aggressively" on every metric except short-term volume — and short-term volume buys you bans, not buyers.

---

# Table of Contents

1. [Strategic context](#1-strategic-context)
2. [The growth multiplier framework](#2-the-growth-multiplier-framework)
3. [AcreHub channel architecture](#3-acrehub-channel-architecture)
4. [Architecture overview](#4-architecture-overview)
5. [Compliance and ethics rules](#5-compliance-and-ethics-rules)
6. [Complete database schema](#6-complete-database-schema)
7. [TypeScript types reference](#7-typescript-types-reference)
8. [API contracts](#8-api-contracts)
9. [Content templates](#9-content-templates)
10. [Component specifications](#10-component-specifications)
11. [Algorithm reference](#11-algorithm-reference)
12. [Phase 1 build prompts](#12-phase-1-build-prompts)
13. [Phase 2 build prompts](#13-phase-2-build-prompts)
14. [Phase 3 build prompts](#14-phase-3-build-prompts)
15. [Phase 4 build prompts](#15-phase-4-build-prompts)
16. [Operational runbook](#16-operational-runbook)

---

# 1. Strategic context

The Acrehub Growth Engine turns every meaningful asset in the marketplace into a trackable, shareable, distributable growth surface. The goal is that AcreHub doesn't wait for users to find the site; it pushes fresh supply and demand into the channels where Indian land buyers and agents already live (WhatsApp, Telegram, broker groups, village networks, NRI circles, offline posters with QR codes).

**Five hard rules carry across all phases. Read section 5 before starting any build.**

---

# 2. The growth multiplier framework

The growth engine works on four multipliers operating in parallel. Each one is independently legal and compounds with the others.

## 2.1 Multiplier 1 — AcreHub-owned channels

**Tactic:** Create and operate a large number of Telegram channels, WhatsApp Communities, and email lists, all branded AcreHub. Every new listing auto-posts to the relevant 5-10 of them. Every buyer requirement auto-broadcasts. Every farm plot project gets its launch announcement.

**Why this is the strongest play:**
- No platform risk — AcreHub owns the channel, sets the rules, can't be banned for using its own channel.
- Network compounds — every channel member who joins is a future broadcast recipient forever.
- Cross-posting is free — one listing's effort populates ten channels.
- SEO bleed — channel names rank for "AcreHub Karnataka land" type queries.

**Channel proliferation map (target by end of Phase 2):**

Telegram:
- 1 state channel per major state (Karnataka, Tamil Nadu, AP, Telangana, Maharashtra, Kerala) = 6 channels
- 1 district channel per high-priority district (Bangalore Rural, Mysuru, Tumkur, Mandya, Krishnagiri, Hosur, Salem, Chennai, Pune, Nashik, Hyderabad surrounds) = ~12 channels
- 1 land-type channel each (Farm Plots, Large Land Parcels, Farmhouses, Warehouse Land, Plantation Land) = 5 channels
- 1 specialised audience channel each (NRI Buyers, Co-Buy Opportunities, Verified Listings Only) = 3 channels
- **Total ~26 AcreHub Telegram channels**

WhatsApp Communities (Meta's "Communities" feature, where one admin can run a Community with multiple sub-groups):
- 1 AcreHub Karnataka Community with sub-groups for Bangalore Rural, Mandya, Mysuru, etc.
- 1 AcreHub Tamil Nadu Community with sub-groups by district
- 1 NRI AcreHub Community
- 1 AcreHub Farm Plot Buyers Community
- 1 AcreHub Co-Buy Circle Community

Email:
- One newsletter list per major state + one master "Acrehub Weekly"

Each channel/community gets:
- A landing page on acrehub.com explaining what it covers and how to join
- A QR code for offline distribution
- A clear value prop: "Get every new [district] land listing in your inbox/phone"

## 2.2 Multiplier 2 — Agent forwarders

**Tactic:** Make every Acrehub agent the most effective forwarder of AcreHub content into the WhatsApp groups, broker WhatsApp circles, family chats, and village networks that *they* are members of. Agents have legitimate access to those networks. AcreHub provides them with high-converting copy, professional preview cards, and tracking so they get credit.

**Why this works:**
- The agent's forward looks like a personal recommendation, not a bot post. Trust transfers.
- Agents are intrinsically motivated — buyer leads are their income. They want to forward.
- 100 agents each forwarding to 5 groups = reach into 500 groups, all legitimately.
- Tracking attributes clicks back to the agent for ranking and (later) reward.

**Agent forwarding toolkit (Phase 1):**
- One-tap "Share this listing to my WhatsApp" button on every listing detail, generating wa.me link with templated text + the agent's attribution code
- "Forward to my 5 buyer groups" wizard — admin can save the agent's frequent groups as labels (no actual integration, just labels — agent still has to manually open each group and paste); the wizard generates 5 distinct wa.me links pre-filled with text variations
- Agent-branded preview card — listing's OG preview includes "Shared by [Agent Name] — Acrehub Verified Agent" when accessed via their attribution link
- "My share leaderboard" — agents can see which of their forwards generated the most clicks/leads. Friendly competition drives more forwards.
- Daily push: every morning, top 3 listings in the agent's territory pre-written and ready to forward with one tap

## 2.3 Multiplier 3 — Programmatic SEO

**Tactic:** Build hundreds of SEO landing pages mapped to real search intent — `/land/karnataka/bangalore-rural/kanakapura`, `/farm-plots/krishnagiri`, `/warehouse-land/bangalore`, etc. — each one populated with real listings, real agents, real buyer demand, and useful local content. Index everything.

**Why this works:**
- Indian rural land searches are long-tail and underserved on Google. "agricultural land kanakapura" gets searched but the SERP is junk-tier portals and forum threads.
- A real page with 10 active listings, 3 verified agents, a legal checklist, and a price benchmark immediately outranks the junk.
- This compounds for years — pages built today rank for buyers in 2027.

**Page proliferation target (by end of Phase 2):**
- 6 state pages
- 50 district pages (the ones with at least one listing OR strategic interest)
- 200+ taluka pages (those with listings)
- Land-type combos: `/farm-plots/{district}`, `/farmhouses/{district}`, `/warehouse-land/{district}` — auto-generated where data exists
- Legal guide pages per state (1 per state)
- Price guide pages per district (where benchmark data is sufficient)

**Total: 300-500 indexable pages by Phase 2 completion.** Doubles or triples by Phase 3.

## 2.4 Multiplier 4 — Universal referral attribution

**Tactic:** Every user has a referral code. Every shared link carries it. Every meaningful action (signup, listing creation, requirement submission, enquiry, co-buy interest) attributes back to the referrer. Build leaderboards. Compound the loops.

**Why this works:**
- Existing users have natural distribution into networks AcreHub can't access directly.
- Attribution creates a measurable, optimisable loop.
- Even without explicit payouts (deferred to Phase 5), recognition + future credit-promise is enough to drive sharing.

**Referral attribution becomes pervasive in Phase 1:**
- Every share link auto-includes the sharer's referral code if logged in
- Every signup checks the `ref` cookie and attributes
- Every listing creation, requirement, enquiry attributes
- Per-user "your impact" dashboard (clicks generated, signups attributed, listings credited)

---

# 3. AcreHub channel architecture

This section describes the channel network AcreHub operates, and how content flows through it.

## 3.1 Channel taxonomy

```
                        Acrehub Owned Channels
                        ──────────────────────────

   Telegram Channels (read-only broadcast):
   ┌──────────────────────────────────────────────────────────┐
   │  STATE: AcrehubKarnataka, AcrehubTamilNadu, …            │
   │  DISTRICT: AcrehubBangaloreRural, AcrehubKrishnagiri, …  │
   │  LAND-TYPE: AcrehubFarmPlots, AcrehubWarehouseLand, …    │
   │  AUDIENCE: AcrehubNRI, AcrehubCoBuy, AcrehubVerified     │
   └──────────────────────────────────────────────────────────┘

   Telegram Groups (conversational, moderated):
   ┌──────────────────────────────────────────────────────────┐
   │  AcrehubBangaloreBuyers, AcrehubAgentNetwork, …          │
   └──────────────────────────────────────────────────────────┘

   WhatsApp Communities (Meta's Communities feature):
   ┌──────────────────────────────────────────────────────────┐
   │  AcrehubKarnataka Community ─ sub-groups by district     │
   │  AcrehubTamilNadu Community ─ sub-groups by district     │
   │  AcrehubNRI Community                                    │
   │  AcrehubFarmPlot Community                               │
   └──────────────────────────────────────────────────────────┘

   Email lists:
   ┌──────────────────────────────────────────────────────────┐
   │  AcrehubKarnataka weekly                                 │
   │  AcrehubTamilNadu weekly                                 │
   │  AcrehubVerifiedOnly                                     │
   │  AcrehubCoBuy                                            │
   │  Acrehub master                                          │
   └──────────────────────────────────────────────────────────┘
```

## 3.2 Default-on distribution

When a new listing is published, the system **automatically creates draft distribution_posts for all matching AcreHub-owned channels** (instead of waiting for admin to manually create them). Admin only needs to review and approve, not compose from scratch.

Matching rules:
- Listing's state → state Telegram channel
- Listing's district → district Telegram channel (if exists)
- Listing's land_type → land-type Telegram channel
- Listing's NRI-friendly flag → NRI channel
- Listing's verified status → verified-only channel
- Listing's co-buy eligibility → co-buy channel

**A single listing typically auto-creates 4-7 distribution_posts.** Admin can approve all with one click ("Approve all and publish"), or unselect channels. By default everything goes out. The friction is set so admin has to actively *prevent* distribution, not actively *cause* it.

## 3.3 Cross-posting and scheduling

- Posts to multiple AcreHub channels are scheduled with 30-second gaps to avoid Telegram rate limits.
- Identical text across channels is fine on Telegram (each channel has different members).
- Posts to AcreHub WhatsApp Communities go via the official WhatsApp Business API (Phase 5) or by manual broadcast helper (Phase 2).
- Each channel has a content schedule that adds non-listing content (legal guides, price reports, agent introductions, market updates) on rest days.

## 3.4 Channel recruitment

**Telegram channels grow by:**
- Channel link in every listing's WhatsApp share text ("Get every new [district] listing here: t.me/AcrehubKrishnagiri")
- Channel link in agent share cards
- Channel link in the site footer
- A `/channels` page that lists all AcreHub channels with member counts and join CTAs
- QR codes per channel for offline distribution (Phase 4)

**WhatsApp Communities grow by:**
- Community invite link in the same locations
- Opt-in checkbox on buyer requirement and agent application forms ("Join the AcreHub WhatsApp Community for your state")
- Manual outreach: when an agent applies, after verification, the team adds them to the relevant agent Community (with their consent)

**Email lists grow by:**
- Opt-in on agent application
- Opt-in on buyer requirement submission
- Footer signup
- Lead-magnet downloads (legal checklists, price reports — Phase 3)

---

# 4. Architecture overview

## 4.1 The 12 submodules

```
                        ┌─────────────────────────────────┐
                        │       GROWTH ASSETS             │
                        │   (listings, requirements,      │
                        │    agents, guides, etc.)        │
                        └────────────┬────────────────────┘
                                     │
                ┌────────────────────┴────────────────────┐
                │                                         │
       ┌────────▼────────┐                      ┌─────────▼─────────┐
       │  Share Card     │                      │  Auto-Distribution│
       │  Engine         │                      │  Engine           │
       │  (text + OG)    │                      │  (default-on push)│
       └────────┬────────┘                      └─────────┬─────────┘
                │                                         │
       ┌────────▼─────────────────────────────────────────▼─────────┐
       │            Tracked Share Links + UTM + Referrals          │
       │              /go/[shortCode] redirect                      │
       └────────┬───────────────────────────────────────────────────┘
                │
   ┌────────────┼─────────────┬──────────────┬──────────────┬─────────────┐
   │            │             │              │              │             │
┌──▼──┐   ┌─────▼─────┐  ┌────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐ ┌─────▼─────┐
│SEO  │   │ AcreHub   │  │ AcreHub  │  │  Agent    │  │ Offline   │ │  Referral │
│Pages│   │ Telegram  │  │ WhatsApp │  │  Forward  │  │ QR        │ │  Engine   │
│(300+│   │ Network   │  │ Comms.   │  │  Toolkit  │  │ Campaigns │ │  (univ.)  │
└─────┘   └───────────┘  └──────────┘  └───────────┘  └───────────┘ └───────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Growth Events     │
                          │   + Attribution     │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  Founder Growth     │
                          │  Intelligence       │
                          │  Dashboards         │
                          └─────────────────────┘
```

## 4.2 Tech stack

Same as v1: Next.js 16, TypeScript, Tailwind, Supabase, Vercel, Resend, Anthropic Claude API, OpenAI Whisper API, Twilio.

**New dependencies (require approval):**
- Direct Telegram Bot API via `fetch` — no npm package needed
- `qrcode` library (Phase 4)
- `@vercel/og` for dynamic OG cards (Phase 3 — moved earlier to enable agent-branded preview cards)

## 4.3 Module-level file architecture

Same as v1 (see that file for the full tree). Three additions:

```
app/
├── channels/                            [NEW - Phase 2]
│   └── page.tsx                         (public list of all AcreHub channels)
│
├── land/                                [Phase 1 - moved up from Phase 3]
│   ├── [state]/page.tsx
│   ├── [state]/[district]/page.tsx
│   └── [state]/[district]/[taluka]/page.tsx
│
└── lib/
    └── channel-router.ts                [NEW - auto-match listing to channels]
```

---

# 5. Compliance and ethics rules

**These are unchanged from v1 and are non-negotiable.** They are not legal padding — they prevent account bans, DPDP penalties, and reputational damage that would set back growth far more than these rules cost.

## 5.1 Consent before any automated messaging

- No automated message to a phone, email, or Telegram handle without an opt-in row in `contact_preferences`.
- Opt-in source must be recorded.
- Opt-out immediately sets `opt_out_at` and stops all automated channels.

## 5.2 Channel control

- AcreHub auto-publishes only to Telegram channels/groups where AcreHub's bot is admin.
- WhatsApp Channels: no third-party API for posting exists as of 2026; build only manual workflows or use the official WhatsApp Business API (Phase 5).
- Auto-posting to ANY WhatsApp/Telegram group AcreHub doesn't own/admin is prohibited. This is a Meta/Telegram ToS rule with hard enforcement (account bans, IP blocks). Agents may *manually* forward AcreHub content into groups they personally belong to — that's their access, not AcreHub's.

## 5.3 Mandatory disclaimers

Every distributed asset must include:
- The trust label (verified / agent-managed / owner-listed / pending)
- A condensed version of the buyer-verification disclaimer; full text on the destination page.

## 5.4 Privacy

- Owner phone/email NEVER in share text or cards.
- Agent phone only with agent opt-in.
- Approximate-location listings: share card uses district/taluka only.

## 5.5 Misleading claims

- No "guaranteed returns" copy.
- No "investment grade" claim unless legally reviewed.
- No fake urgency unless genuinely true.
- Lawyer reviews seed content templates before Phase 1 launch.

---

# 6. Complete database schema

The schema is the same as v1 with a few enrichments. I'll show only the changes; refer to v1 for the unchanged definitions.

## 6.1 New: `acrehub_owned_channels`

A first-class registry of every channel AcreHub operates, with auto-distribution routing rules.

```sql
create table acrehub_owned_channels (
  id uuid primary key default gen_random_uuid(),
  channel_kind text not null check (channel_kind in (
    'telegram_channel', 'telegram_group',
    'whatsapp_community', 'whatsapp_community_subgroup',
    'email_list'
  )),
  name text not null,
  slug text unique not null,
  description text,
  public_join_url text,                    -- e.g. t.me/AcrehubKarnataka
  internal_id text,                        -- e.g. Telegram channel_id, WA community id
  bot_token_env_var text,                  -- for Telegram, server-only

  -- Routing dimensions — what listings auto-post here?
  target_state text,
  target_district text,
  target_taluka text,
  target_land_types text[] default array[]::text[],
  target_audience text,                    -- 'nri' | 'co_buy' | 'verified_only' | 'general' | ...

  -- Behaviour
  auto_publish_enabled boolean default true,
  approval_required boolean default true,  -- if false, posts publish without admin click
  daily_post_limit integer default 5,      -- protect from over-posting
  status text default 'active' check (status in ('active', 'paused', 'archived')),
  member_count integer default 0,
  last_member_count_refresh timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_owned_channels_kind on acrehub_owned_channels(channel_kind);
create index idx_owned_channels_state on acrehub_owned_channels(target_state);
create index idx_owned_channels_district on acrehub_owned_channels(target_district);
create index idx_owned_channels_status on acrehub_owned_channels(status);

create trigger trg_owned_channels_updated_at
  before update on acrehub_owned_channels
  for each row execute function set_updated_at();

alter table acrehub_owned_channels enable row level security;

create policy "public read active channels"
  on acrehub_owned_channels for select
  using (status = 'active');

create policy "admins manage channels"
  on acrehub_owned_channels for all
  using (is_admin());
```

## 6.2 New: `agent_share_groups`

Lets agents save labels for the WhatsApp groups they're personally members of, so the forwarding wizard can produce multiple pre-filled wa.me links in one go. **These are LABELS only — AcreHub never gets access to the groups themselves.** The agent still manually opens each group and pastes.

```sql
create table agent_share_groups (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agent_profiles(id) on delete cascade,
  label text not null,                     -- "Hosur Brokers WhatsApp" — for the agent's own reference
  notes text,
  created_at timestamptz default now()
);

create index idx_agent_share_groups_agent on agent_share_groups(agent_id);

alter table agent_share_groups enable row level security;

create policy "agents manage their own share groups"
  on agent_share_groups for all
  using (
    agent_id in (select id from agent_profiles where user_id = auth.uid())
  );

create policy "admins read all share groups"
  on agent_share_groups for select
  using (is_admin());
```

## 6.3 All other tables: same as v1

`growth_assets`, `share_links`, `referral_codes`, `referral_events`, `growth_events`, `contact_preferences`, `content_templates`, `distribution_channels`, `distribution_campaigns`, `distribution_posts`, `telegram_channels` (legacy — now superseded by `acrehub_owned_channels` for new development), `whatsapp_segments`, `community_circles`, `community_members`, `qr_campaigns`, `crm_tasks` — all unchanged.

## 6.4 New trigger: auto-create distribution drafts on listing publish

When a listing is published, automatically draft distribution_posts for every matching `acrehub_owned_channels` row. Admin only needs to approve.

```sql
create or replace function on_listing_auto_distribute() returns trigger as $$
declare
  v_asset_id uuid;
  v_channel record;
  v_short_code text;
  v_short_url text;
begin
  -- Only act on transitions to active
  if NEW.status != 'active' or (OLD.status = 'active' and OLD.status is not null) then
    return NEW;
  end if;

  -- Look up the growth_asset we just created (via the on_listing_published trigger)
  select id into v_asset_id from growth_assets
    where asset_type = 'listing' and entity_id = NEW.id
    order by created_at desc limit 1;

  if v_asset_id is null then return NEW; end if;

  -- For each matching active owned channel, draft a distribution_post
  for v_channel in
    select * from acrehub_owned_channels
    where status = 'active'
      and auto_publish_enabled = true
      and (target_state is null or target_state = NEW.state)
      and (target_district is null or target_district = NEW.district)
      and (target_land_types = array[]::text[] or NEW.land_type = any(target_land_types))
  loop
    insert into distribution_posts (
      asset_id, channel_id, post_text, status, created_at
    ) values (
      v_asset_id, null,  -- channel_id reserved for legacy distribution_channels rows
      null,              -- post_text generated at publish time via template
      case when v_channel.approval_required then 'pending_approval' else 'ready_to_publish' end,
      now()
    );
  end loop;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_listing_auto_distribute on listings;
create trigger trg_listing_auto_distribute
  after insert or update on listings
  for each row execute function on_listing_auto_distribute();
```

Note: this requires modifying `distribution_posts` to add an `owned_channel_id` column referencing `acrehub_owned_channels`. Add in the same migration.

```sql
alter table distribution_posts add column if not exists owned_channel_id uuid references acrehub_owned_channels(id);
create index if not exists idx_posts_owned_channel on distribution_posts(owned_channel_id);
```

---

# 7. TypeScript types reference

All types from v1, plus:

```typescript
// =====================================================
// OWNED CHANNELS
// =====================================================

export type ChannelKind =
  | 'telegram_channel' | 'telegram_group'
  | 'whatsapp_community' | 'whatsapp_community_subgroup'
  | 'email_list';

export type ChannelAudience =
  | 'nri' | 'co_buy' | 'verified_only' | 'farm_plot'
  | 'warehouse' | 'general';

export interface AcrehubOwnedChannel {
  id: string;
  channel_kind: ChannelKind;
  name: string;
  slug: string;
  description: string | null;
  public_join_url: string | null;
  internal_id: string | null;
  bot_token_env_var: string | null;
  target_state: string | null;
  target_district: string | null;
  target_taluka: string | null;
  target_land_types: string[];
  target_audience: ChannelAudience | null;
  auto_publish_enabled: boolean;
  approval_required: boolean;
  daily_post_limit: number;
  status: 'active' | 'paused' | 'archived';
  member_count: number;
  last_member_count_refresh: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentShareGroup {
  id: string;
  agent_id: string;
  label: string;
  notes: string | null;
  created_at: string;
}
```

---

# 8. API contracts

Same as v1, plus:

## 8.1 POST /api/growth/auto-distribute

**Purpose:** programmatically trigger the auto-distribution flow for a listing (used by triggers + manually by admin for re-distribution).

**Request body:**
```typescript
{
  listing_id: string;
  override_auto_publish?: boolean;   // if true, ignore channel-level approval_required and force pending_approval
}
```

**Response (200):**
```typescript
{
  drafted_posts: number;            // how many distribution_posts were created
  matched_channel_ids: string[];
}
```

## 8.2 POST /api/growth/channels/publish-batch

**Purpose:** admin approves and publishes a batch of distribution_posts.

**Request body:**
```typescript
{
  post_ids: string[];
}
```

**Response (200):**
```typescript
{
  published: Array<{ post_id: string; external_post_id: string }>;
  failed: Array<{ post_id: string; error: string }>;
}
```

**Implementation:**
- For each post, look up the owned_channel + asset + template.
- Render post_text from the channel-appropriate template.
- For Telegram channels: call Telegram Bot API to publish.
- For WhatsApp Communities: log as "pending manual send" (no API in Phase 1-2; admin uses copy button).
- For email lists: log as "queued for next digest."
- 30-second delay between posts to the same Telegram bot.
- Return success/failure per post.

## 8.3 POST /api/growth/agents/forward-helper

**Purpose:** generate multiple pre-filled wa.me links for an agent's saved share groups.

**Request body:**
```typescript
{
  listing_id: string;
  share_group_ids: string[];        // agent_share_groups.id values
}
```

**Response (200):**
```typescript
{
  shares: Array<{
    share_group_label: string;
    wa_me_url: string;              // pre-filled, agent taps and sends manually
    short_url: string;              // the tracked URL inside the message
  }>;
}
```

**Implementation:**
- Each share gets its own short_link (different utm_content so we can tell apart clicks from "Hosur Brokers Group" vs "Family WhatsApp")
- All attributed to the agent's referral code
- Returns the list; client-side renders as a list of "Tap to send" buttons

---

# 9. Content templates

Same template structure as v1, with **more aggressive variants** added.

## 9.1 Aggressive listing share text (English)

```
🌾 New on Acrehub: {{title}}

📍 {{location}}
📐 {{acreage}}
💰 {{price_per_acre}}/acre
{{features_top3}}

✅ {{trust_label}}

➡️ Full details + photos: {{tracked_url}}

🔔 Want every new listing in {{district}}?
Join the AcreHub channel: {{district_channel_url}}
```

The last two lines are the funnel-builder. Every listing share recruits the recipient into an AcreHub-owned channel.

## 9.2 Agent forward template

```
Found this on Acrehub — looks like a fit for someone here.

{{title}}
📍 {{location}}
📐 {{acreage}} @ {{price_per_acre}}/acre
{{trust_label}}

Details: {{tracked_url}}

(Forwarded by {{agent_name}} — message me if interested. — Acrehub)
```

Notice the personal voice. This isn't a marketing blast; it's an agent's recommendation. Higher trust = higher conversion.

## 9.3 Telegram channel post (per channel)

State channel:
```
🌾 *New listing in {{district}}, {{state}}*

*{{title}}*
{{location}} · {{acreage}} · {{price_per_acre}}/acre

{{features_summary}}

{{trust_label}}

[View on Acrehub]({{tracked_url}})
```

District channel (more focused, more frequent):
```
*New listing*

*{{title}}*
📍 {{village}} · {{acreage}} · {{price_per_acre}}/acre
🚰 {{water}} · 🛣 {{road_access}} · 📜 {{title_status}}
{{trust_label}}

{{tracked_url}}
```

Land-type channel (focused on the land use):
```
*Farm plot — {{location}}*

{{acreage}} @ {{price_per_acre}}/acre
{{features_top3}}
{{trust_label}}

{{tracked_url}}
```

## 9.4 Channel recruitment template (footer of every share)

Always append one of these to listing share text:

For listings being shared to general buyers:
```
🔔 Want every new {{district}} listing automatically?
Join: {{district_channel_url}}
```

For listings being shared to agents:
```
🔔 Earn commissions on AcreHub buyer matches in your area.
Join the Acrehub agent network: {{agent_network_url}}
```

For listings being shared to NRI audience:
```
🔔 NRI looking for land in India? Get vetted opportunities first.
Join: {{nri_channel_url}}
```

The recruitment-to-channel is the key compounding move — every share is also a member-acquisition event.

---

# 10. Component specifications

Same as v1, with these new/expanded components:

## 10.1 AgentForwardingWizard

Path: `app/components/growth/AgentForwardingWizard.tsx`
Used by: agent dashboard, listing detail (when agent is viewing their own listing)

**Behavior:**
- Shows the listing's preview text.
- Lists the agent's saved `agent_share_groups` as checkboxes ("Hosur Brokers WhatsApp", "Family Group", "Bangalore Investors Circle", etc.). Plus an "Add new group label" button.
- Below: an editable text area pre-filled with the agent forward template (section 9.2). Agent can tweak per group if they want, or leave default.
- "Generate share links" button calls `/api/growth/agents/forward-helper`.
- Returns a list of "Tap to open in WhatsApp →" buttons, one per selected group. Each opens wa.me with the text pre-filled. Agent taps the right contact/group in WhatsApp and sends.
- Each click is tracked separately so the agent's "share leaderboard" can show which of their groups converted best.

## 10.2 ChannelPublishingDashboard

Path: `app/admin/growth/channels/publish/page.tsx`

**Behavior:**
- Lists all `distribution_posts` with status `pending_approval` or `ready_to_publish`, grouped by listing.
- For each listing, shows the 5-7 channels it would post to with checkboxes (all checked by default).
- One "Approve all and publish" button publishes to every selected channel with a 30-second spacing.
- "Edit text" lets admin tweak per-channel text before publishing.
- After publish: shows the resulting Telegram message_ids and a link to view each post in the channel.

This is the "default-on" UX in action — admin sees what's about to go out, can edit or remove channels, but the path of least resistance is "approve all."

## 10.3 OwnedChannelsManager

Path: `app/admin/growth/channels/owned/page.tsx`

**Behavior:**
- Lists all `acrehub_owned_channels`.
- "Add new channel" form: name, kind (Telegram channel / WhatsApp Community / etc.), routing rules (state/district/taluka/land_type/audience), join URL, internal ID.
- For Telegram channels: verifies the bot can post by sending a test message.
- For WhatsApp Communities: stores the invite link; member count is manually updated by admin (WhatsApp doesn't expose this via API).

## 10.4 AgentShareLeaderboard

Path: `app/agents/dashboard/share-tools/leaderboard/page.tsx` (visible to the agent themselves)

**Behavior:**
- Shows the agent's last 30 days of shares: which listings they shared, which channels/groups, click counts, leads generated.
- Subtle gamification: a small badge for "Top sharer this week in your district" if applicable. No public leaderboard ranking other agents — keeps things friendly.

---

# 11. Algorithm reference

Same as v1. Plus:

## 11.1 Listing → channel routing

```typescript
// app/lib/channel-router.ts
import { createServerClient } from '@/lib/supabase-server';
import type { AcrehubOwnedChannel } from './growth-types';

export async function findMatchingChannels(listing: {
  state: string;
  district: string;
  taluka?: string;
  land_type: string;
  nri_friendly?: boolean;
  verified?: boolean;
  co_buy_eligible?: boolean;
}): Promise<AcrehubOwnedChannel[]> {
  const supabase = await createServerClient();
  const { data: channels } = await supabase
    .from('acrehub_owned_channels')
    .select('*')
    .eq('status', 'active')
    .eq('auto_publish_enabled', true);

  if (!channels) return [];

  return channels.filter((c) => {
    // State match (or no state filter = all states)
    if (c.target_state && c.target_state !== listing.state) return false;
    // District match
    if (c.target_district && c.target_district !== listing.district) return false;
    // Taluka match
    if (c.target_taluka && c.target_taluka !== listing.taluka) return false;
    // Land type match (if channel filters by land types)
    if (c.target_land_types?.length > 0 && !c.target_land_types.includes(listing.land_type)) return false;
    // Audience match
    if (c.target_audience === 'nri' && !listing.nri_friendly) return false;
    if (c.target_audience === 'verified_only' && !listing.verified) return false;
    if (c.target_audience === 'co_buy' && !listing.co_buy_eligible) return false;
    return true;
  });
}
```

A typical Karnataka farm plot listing matches roughly:
- AcrehubKarnataka (state)
- AcrehubBangaloreRural (district)
- AcrehubFarmPlots (land type)
- AcrehubVerified (if verified)

≈ 4 channels per listing. With ~26 owned channels, the average reach per listing is 4-7 channels.

## 11.2 Telegram publish via Bot API

```typescript
// app/lib/telegram-publisher.ts
export async function publishToTelegram(opts: {
  channelInternalId: string;            // e.g. @AcrehubKarnataka or -1001234567890
  botTokenEnvVar: string;
  text: string;
  parseMode?: 'Markdown' | 'HTML' | 'MarkdownV2';
}): Promise<{ message_id: number; success: boolean; error?: string }> {
  const token = process.env[opts.botTokenEnvVar];
  if (!token) {
    return { message_id: 0, success: false, error: `Bot token env var ${opts.botTokenEnvVar} not set` };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: opts.channelInternalId,
      text: opts.text,
      parse_mode: opts.parseMode ?? 'Markdown',
      disable_web_page_preview: false,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    return { message_id: 0, success: false, error: data.description ?? 'Unknown Telegram API error' };
  }

  return { message_id: data.result.message_id, success: true };
}

export async function publishBatch(
  posts: Array<{
    channelInternalId: string;
    botTokenEnvVar: string;
    text: string;
  }>,
  delayMs: number = 30000
): Promise<Array<{ success: boolean; message_id?: number; error?: string }>> {
  const results = [];
  for (const post of posts) {
    const r = await publishToTelegram(post);
    results.push(r);
    if (post !== posts[posts.length - 1]) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}
```

---

# 12. Phase 1 build prompts

**Goal:** Foundation + early SEO + agent forwarding toolkit + universal referral attribution.

**Duration:** ~4 weeks.

**Prerequisites:**
- Agent Network operating with 10+ active agents and 50+ published listings
- Lawyer has reviewed the seed content templates (sections 6.2 of v1 + 9 of this spec)
- At least 2 AcreHub Telegram channels manually created (state + a major district) for testing

---

## Prompt 1.1 — Database migrations (Phase 1)

```
Read docs/growth-engine-spec.md sections 3, 5, and 6.

Create ONE migration at supabase/migrations/{timestamp}_growth_engine_phase_1.sql with:

1. All 7 v1 tables from section 6 of growth-engine-spec.md: growth_assets, share_links, referral_codes, referral_events, growth_events, contact_preferences, content_templates.

2. The NEW Phase 1 tables from section 6 of this aggressive spec:
   - acrehub_owned_channels (full DDL from section 6.1)
   - agent_share_groups (full DDL from section 6.2)

3. All indexes and RLS policies.

4. The triggers and helper functions:
   - set_updated_at on all updatable tables
   - increment_share_link_clicks SQL function
   - on_listing_published trigger (creates growth_assets row)
   - on_listing_auto_distribute trigger (creates distribution_posts drafts) — note this depends on distribution_posts existing, which lives in Phase 2 tables. For Phase 1, create only the function; DO NOT attach the trigger yet. Trigger attachment happens in Prompt 2.1.

5. Seed content_templates with the 8 templates from section 9 of this spec PLUS the original 6 from v1 (total 14 templates).

6. Seed acrehub_owned_channels with 3 initial rows for testing (you'll need me to provide the actual Telegram channel IDs and bot tokens before Prompt 2.1).

DEFINITION OF DONE:
- Migration applies cleanly
- 9 new tables exist
- 14 content templates seeded
- Insert listing → growth_assets row appears via trigger
- I can manually insert and edit acrehub_owned_channels rows
- TypeScript compiles after types are added in 1.2

Commit message: "Phase 1.1: aggressive growth engine database foundation"
```

---

## Prompt 1.2 — TypeScript types

```
Read docs/growth-engine-spec.md sections 4 of v1 and section 7 of this spec.

1. Create app/lib/growth-types.ts with ALL types from section 4 of v1 PLUS the new ones in section 7 of this spec (AcrehubOwnedChannel, AgentShareGroup, ChannelKind, ChannelAudience).

2. Create app/lib/share-links.ts, app/lib/utm.ts, app/lib/content-templates.ts, app/lib/growth-events.ts as in v1 prompt 1.2.

3. NEW: Create app/lib/channel-router.ts with the findMatchingChannels() function from section 11.1.

4. NEW: Create app/lib/telegram-publisher.ts with publishToTelegram() and publishBatch() from section 11.2.

5. Run `npx tsc --noEmit` and confirm zero errors.

DEFINITION OF DONE: all files exist, types are exported, TypeScript clean.
Commit message: "Phase 1.2: growth engine TypeScript foundation"
```

---

## Prompt 1.3 — Short link API + redirect handler + tracking

Same as v1 prompts 1.3 and 1.4 combined.

```
Implement app/api/growth/share-link/route.ts, app/go/[shortCode]/route.ts, app/api/growth/track-event/route.ts per docs/growth-engine-spec.md sections 8 of v1 (5.1, 5.2, 5.3).

DEFINITION OF DONE: short links create, redirect, log events. Click counts increment.
Commit message: "Phase 1.3: tracked share links and event tracking"
```

---

## Prompt 1.4 — Referral system (now with multi-action attribution)

```
Read docs/growth-engine-spec.md section 5.4 of v1 and section 8.2 of v1.

1. Create app/api/growth/referrals/create/route.ts (idempotent).

2. Create app/ref/[code]/page.tsx (sets cookie, logs event, redirects).

3. NEW (more aggressive): hook attribution into MULTIPLE existing flows, not just signup:
   - When a new agent applies (/api/agents/apply): write a referral_events row with event_type='agent_joined' if ref cookie present
   - When a buyer requirement is submitted: write event_type='requirement_submitted'
   - When an enquiry is sent on a listing: write event_type='enquiry_submitted'
   - When a co-buy interest is registered: write event_type='co_buy_interest'

4. NEW: When any user is created with auth.signUp(), automatically generate a referral_code for them. Same for agent_profiles. Their referral URL becomes part of their profile by default — no opt-in step.

DEFINITION OF DONE: every new user and agent gets an auto-generated referral code. Visiting /ref/[code] attributes any subsequent action in the session.
Commit message: "Phase 1.4: universal referral attribution"
```

---

## Prompt 1.5 — ShareButtonGroup with default referral attribution

```
Implement app/components/growth/ShareButtonGroup.tsx per section 7.1 of v1.

NEW: by default, if the viewing user has a referral_code, it's automatically appended to the shared URL. No opt-in. No separate "share with my referral" button — every share is a referral share.

Integrate into:
- app/listing/[id]/page.tsx
- app/agents/[slug]/page.tsx
- buyer requirement detail pages
- co-buy opportunity pages (when those exist)

DEFINITION OF DONE: every public asset page has share buttons. Logged-in users' shares auto-include their referral code.
Commit message: "Phase 1.5: share buttons with default referral attribution"
```

---

## Prompt 1.6 — Agent forwarding wizard

```
Read docs/growth-engine-spec.md sections 8.3 and 10.1 of this spec.

1. Create app/api/growth/agents/forward-helper/route.ts (section 8.3).

2. Create app/components/growth/AgentForwardingWizard.tsx (section 10.1).

3. Add the wizard to:
   - app/agents/dashboard/share-tools/page.tsx (the agent's main share screen)
   - app/listing/[id]/page.tsx (visible to the agent who owns the listing)

4. Create app/agents/dashboard/share-tools/groups/page.tsx where agents manage their saved group labels (CRUD for agent_share_groups).

5. Pre-populate every new agent with 3 default group labels: "My Buyer WhatsApp Group", "Local Brokers Group", "Family/Friends". Agent can rename or delete.

DEFINITION OF DONE: agent can save group labels, generate 5 distinct wa.me links for a listing in one click, each with unique tracking.
Commit message: "Phase 1.6: agent forwarding wizard with group labels"
```

---

## Prompt 1.7 — Programmatic SEO pages (state + district)

```
Read docs/growth-engine-spec.md section 2.3 of this spec.

1. Create app/land/[state]/page.tsx — server component:
   - For each state, render a hero + breadcrumbs
   - List the top 10 active listings in the state
   - List the top agents in the state (from agent_profiles)
   - Show district breakdown with counts ("Bangalore Rural: 47 listings, Mandya: 23 listings ...")
   - Include the buyer demand list (recent buyer_interests in the state)
   - Include a "Get listing alerts for [state]" CTA → join the state Telegram channel + email opt-in
   - Set rich og:title, og:description, structured data (Place schema)

2. Create app/land/[state]/[district]/page.tsx — same pattern but district-specific.

3. Build a generateStaticParams that pre-renders all state pages and the top 50 districts (by listing count).

4. Update app/sitemap.ts to include:
   - All state pages
   - All district pages with at least 1 listing
   - All public growth_assets (listings, agent profiles)

5. Add internal linking:
   - Footer links to /land/[state] for all 6 major states
   - District badges on listing detail pages link back to /land/[state]/[district]
   - Agent profiles link to /land/[state]/[district] for their primary district

DEFINITION OF DONE: /land/karnataka renders with real listings. /land/karnataka/bangalore-rural renders with real listings. Sitemap.xml lists them. Pages have good SEO metadata.
Commit message: "Phase 1.7: programmatic SEO state and district pages"
```

---

## Prompt 1.8 — Channel recruitment widgets

```
1. Create app/components/growth/ChannelRecruitmentCard.tsx — a compact card that shows:
   - Channel name + icon (Telegram/WhatsApp)
   - Brief description
   - Member count (from acrehub_owned_channels.member_count)
   - "Join" button → goes to public_join_url

2. Add ChannelRecruitmentCard to:
   - Listing detail page (matching channels for the listing's state/district/land_type)
   - District SEO page (state and district channels)
   - Home page footer
   - Agent join thanks page (agent network channel + state channel)
   - Buyer requirement confirmation page (state buyer channel)

3. Create app/channels/page.tsx — public list of all active AcreHub channels, grouped by kind (Telegram, WhatsApp Community, Email). Each entry has the recruitment card.

DEFINITION OF DONE: every relevant page surfaces 1-3 AcreHub-owned channels for the visitor to join. The /channels page is a clean directory.
Commit message: "Phase 1.8: channel recruitment surfaces"
```

---

## Prompt 1.9 — Contact preferences + opt-in capture

Same as v1 prompt 1.9.

```
Implement opt-in capture in agent join + buyer requirement forms; create /account/preferences for management; honor opt-out everywhere.

DEFINITION OF DONE: opt-ins are recorded with source. Unsubscribe works.
Commit message: "Phase 1.9: contact preferences and opt-in capture"
```

---

## Prompt 1.10 — Admin Growth dashboard (basic)

```
Same as v1 prompt 1.8, plus:

NEW: A "Channel growth" card on the dashboard showing acrehub_owned_channels with their member counts, post counts in last 7 days, and click-through rates.

NEW: A "Top sharers" leaderboard showing the top 10 agents by clicks generated from their forwards in the last 30 days.

DEFINITION OF DONE: /admin/growth shows overview, channel growth, top sharers.
Commit message: "Phase 1.10: admin growth dashboard"
```

---

## End of Phase 1

Test the full Phase 1 flow:
1. Anonymous visitor lands on `/land/karnataka` from Google → sees real listings + AcreHub channel recruitment → joins the Telegram channel
2. Visitor signs up via agent application → auto-gets a referral_code → opt-in to WhatsApp updates
3. Agent goes to dashboard, configures their 3 group labels, generates wa.me links for a listing → tracking captures each click separately
4. Admin sees the channel growth and top sharers on /admin/growth
5. Sitemap.xml includes hundreds of new pages

This is a working, aggressive growth foundation.

---

# 13. Phase 2 build prompts

**Goal:** Auto-distribution to AcreHub Telegram channels + admin batch publishing + WhatsApp Community recruitment.

**Duration:** ~4 weeks.

**Prerequisites:** Phase 1 in production. At least 5 AcreHub Telegram channels created with bot as admin. WhatsApp Business app set up on a dedicated number.

---

## Prompt 2.1 — Distribution tables + attach trigger

```
1. Create migration with distribution_channels, distribution_campaigns, distribution_posts, telegram_channels (legacy compat), whatsapp_segments tables from v1 section 3.2.

2. Add the owned_channel_id column to distribution_posts (from section 6.4 of this spec).

3. Attach the on_listing_auto_distribute trigger (function was created in Phase 1, but trigger attachment requires distribution_posts to exist).

DEFINITION OF DONE: publishing a listing now auto-creates draft distribution_posts for all matching owned channels.
Commit message: "Phase 2.1: distribution tables and auto-distribute trigger"
```

---

## Prompt 2.2 — Channel publishing dashboard (the workhorse)

```
Read docs/growth-engine-spec.md section 10.2.

1. Create app/admin/growth/channels/publish/page.tsx implementing the ChannelPublishingDashboard:
   - Lists all distribution_posts with status pending_approval, grouped by listing
   - For each listing, shows the 5-7 matching channels with checkboxes (all checked default)
   - "Approve all and publish" button for batch publishing
   - Per-post edit text option
   - Live preview of rendered Markdown for Telegram posts

2. Create app/api/growth/channels/publish-batch/route.ts implementing section 8.2:
   - Admin auth required
   - For each post: render text via template, call publishToTelegram(), update post status + external_post_id
   - 30-second delay between Telegram posts
   - Return success/failure summary

3. Create app/admin/growth/channels/owned/page.tsx — manage acrehub_owned_channels rows (the OwnedChannelsManager from section 10.3).

DEFINITION OF DONE: I can approve a batch of distribution_posts, watch them publish to multiple Telegram channels with 30s gaps, and see message_ids returned for each.
Commit message: "Phase 2.2: channel batch publishing dashboard"
```

---

## Prompt 2.3 — WhatsApp segment broadcast helper

```
1. Create app/admin/growth/whatsapp/segments/page.tsx — list whatsapp_segments and members count.

2. Create app/admin/growth/whatsapp/broadcast/page.tsx — compose broadcast:
   - Admin selects a segment (e.g. "Karnataka NRI buyers, opted-in")
   - Selects a template (or writes custom text)
   - Renders text per recipient (variables substituted)
   - Shows N recipients with wa.me links generated for each
   - "Mark all as sent" after admin has manually clicked through

3. The system tracks each link click separately to attribute conversions to the broadcast campaign.

DEFINITION OF DONE: admin can select a segment, generate per-recipient wa.me links, and the analytics show per-broadcast performance.
Commit message: "Phase 2.3: WhatsApp segmented broadcast helper"
```

---

## Prompt 2.4 — Daily agent push (top 3 listings to share)

```
1. Create a Vercel cron job that runs every morning at 7am IST.

2. For each active agent, the cron:
   - Identifies the top 3 listings in their territory (most matches with buyer_interests, most recent, highest quality)
   - Generates a pre-rendered share-pack: agent forward text for each listing, plus their tracked URLs
   - Stores in a new table agent_daily_picks (id, agent_id, listing_ids[], generated_at, viewed_at)

3. The agent dashboard shows a "Today's listings to share" card linking to the agent forwarding wizard pre-populated with the 3 listings.

4. Optional: send each agent a WhatsApp message (manual through admin in Phase 2; automated through BSP in Phase 5) with the 3 listing URLs.

DEFINITION OF DONE: every morning, every active agent has 3 fresh listings ready to forward with one tap.
Commit message: "Phase 2.4: daily agent push"
```

---

## Prompt 2.5 — Content template editor + cross-language stubs

```
Same as v1 prompt 2.5 (template editor at /admin/growth/content-templates) plus:

NEW: For each template, support multiple language variants (en, hi, kn, ta, te, mr — initially only en is filled). The schema already has a `language` column; editor lets admin add variants. The template rendering function selects the matching language based on the recipient's preferred_language from contact_preferences.

DEFINITION OF DONE: admin can edit any template, add language variants, see live preview.
Commit message: "Phase 2.5: content template editor with language variants"
```

---

# 14. Phase 3 build prompts

**Goal:** Communities, programmatic SEO at taluka level, dynamic OG cards.

**Duration:** ~4 weeks.

(Detailed prompts follow the same pattern. Outline:)

- 3.1 — community_circles + community_members migration
- 3.2 — Public community landing pages (`/communities`, `/communities/[slug]`)
- 3.3 — Admin community manager
- 3.4 — Programmatic taluka pages (`/land/[state]/[district]/[taluka]`) and land-type pages (`/farm-plots/[district]`, etc.)
- 3.5 — Dynamic OG card generation with @vercel/og (listing cards, agent cards, channel join cards)
- 3.6 — Lead-magnet page templates (legal checklists, price guides) for SEO + email opt-in capture

---

# 15. Phase 4 build prompts

**Goal:** QR campaigns, CRM tasks, weekly email digest.

**Duration:** ~3 weeks.

(Outline:)

- 4.1 — qr_campaigns + crm_tasks migration
- 4.2 — QR generation with `qrcode` library + campaign manager
- 4.3 — Auto-create CRM tasks on high-intent events (e.g. user views same listing 3+ times → "call this buyer")
- 4.4 — Admin CRM task board
- 4.5 — Weekly email digest composer + scheduler (Resend)
- 4.6 — Advanced analytics dashboards (channel ROI, district growth, top viral assets)

---

# 16. Operational runbook

For the AcrehubIndia team.

## 16.1 Daily

- Open `/admin/growth/channels/publish` — approve the day's batch of new-listing posts (typically 5-15 minutes)
- Check `/admin/growth` for unusual drops or spikes
- Confirm Telegram bot is online (test with a manual post if no auto-publishes happened that day)
- Review and respond to any DM the AcreHub bot received

## 16.2 Weekly

- Review channel member growth — channels with <5% week-on-week growth need attention (better recruitment placement, better content)
- Review agent share leaderboard — congratulate top sharers, follow up with inactive agents
- Generate and send the weekly email digest
- Spot-check 5 random shared links for correct attribution

## 16.3 Monthly

- Audit content templates — refresh any that are underperforming
- Review opt-out rates per source — if any source >5% opt-out, fix the source
- Add 2-3 new AcreHub Telegram channels if growth is healthy (new district, new land-type, new audience)
- Lawyer reviews any new templates added that month

## 16.4 Quarterly

- Review the whole growth dashboard for trends
- Decide which Phase 5 items to spec
- Audit referral codes — deactivate any unused for 90+ days
- Review channel proliferation strategy — consolidate underperforming channels

---

# 17. Phase 5+ (future, post-validation)

Same as v1: AI content, multi-language template auto-translation, WhatsApp Business API automation, predictive lead scoring, affiliate payouts, paid ads, YouTube/Reels content, village ambassador program.

---

*end of aggressive build-ready growth engine spec*
