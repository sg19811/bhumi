-- ============================================================================
-- AcreHub — SAFETY NET: ensure the buyer funnel can write
-- ----------------------------------------------------------------------------
-- WHY: the core write actions below must work for the funnel to function. If an
-- INSERT policy is missing, the action fails silently (no inquiry saved, no
-- search logged). This file guarantees them idempotently — safe to run anytime,
-- safe to re-run, and it does NOT remove any existing policies you may have.
--
-- Run if: inquiries aren't reaching the dashboard, searches aren't logged, or
-- anonymous buyer requirements don't save. Supabase -> SQL Editor -> Run.
-- ============================================================================

-- Inquiries: anyone (incl. anonymous buyers) can submit an inquiry on a listing.
alter table public.inquiries enable row level security;
drop policy if exists "anyone can submit an inquiry" on public.inquiries;
create policy "anyone can submit an inquiry" on public.inquiries
  for insert to public with check (true);

-- Search logs: anyone can write a search (founder-intelligence data capture).
alter table public.search_logs enable row level security;
drop policy if exists "anyone can log a search" on public.search_logs;
create policy "anyone can log a search" on public.search_logs
  for insert to public with check (true);

-- Buyer interests: anonymous-friendly — anyone can post a requirement.
alter table public.buyer_interests enable row level security;
drop policy if exists "anyone can post a requirement" on public.buyer_interests;
create policy "anyone can post a requirement" on public.buyer_interests
  for insert to public with check (true);

-- Saved listings: signed-in users manage their own watchlist.
alter table public.saved_listings enable row level security;
drop policy if exists "users manage own saved listings" on public.saved_listings;
create policy "users manage own saved listings" on public.saved_listings
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
