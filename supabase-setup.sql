-- ============================================================
-- Bhūmi — full database setup
-- Run in Supabase → SQL Editor (your project) → Run.
-- Safe to run as-is and safe to re-run (idempotent).
-- After running, make yourself admin: see the bottom of this file.
-- ============================================================

-- 0) Admin check used by policies below (reads profiles.role).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin');
$$;

-- 1) Auto-create a profile row on signup, and backfill existing users.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, role) values (new.id, 'user');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (user_id, role)
select u.id, 'user'
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

-- 2) Listings: columns the app writes to.
alter table public.listings add column if not exists contact_email text;
alter table public.listings add column if not exists videos text[] not null default '{}'::text[];

-- 2a) Anyone (signed in or not) can CREATE a listing.
drop policy if exists "anyone can create a listing" on public.listings;
create policy "anyone can create a listing" on public.listings
  for insert to public
  with check (owner_user_id is null or auth.uid() = owner_user_id);

-- 2b) Admins can verify (update) and remove (delete) any listing.
drop policy if exists "admins update listings" on public.listings;
create policy "admins update listings" on public.listings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete listings" on public.listings;
create policy "admins delete listings" on public.listings
  for delete to authenticated using (public.is_admin());

-- 3) Storage: allow uploads + reads on the "Listings" bucket (photos + videos).
drop policy if exists "public upload to Listings" on storage.objects;
create policy "public upload to Listings" on storage.objects
  for insert to public with check (bucket_id = 'Listings');

drop policy if exists "public read Listings" on storage.objects;
create policy "public read Listings" on storage.objects
  for select to public using (bucket_id = 'Listings');

-- 4) Profiles: one row per user; a user can read and update their own row.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_user_id_unique') then
    alter table public.profiles add constraint profiles_user_id_unique unique (user_id);
  end if;
end $$;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5) Inquiries: lead status + read/update policies.
alter table public.inquiries add column if not exists lead_status text not null default 'new';

drop policy if exists "admins read inquiries" on public.inquiries;
create policy "admins read inquiries" on public.inquiries
  for select to authenticated using (public.is_admin());

drop policy if exists "owners read inquiries on their listings" on public.inquiries;
create policy "owners read inquiries on their listings" on public.inquiries
  for select to authenticated
  using (exists (select 1 from public.listings l where l.id = inquiries.listing_id and l.owner_user_id = auth.uid()));

-- Owners (agents) can update the lead status of inquiries on their listings.
drop policy if exists "owners update inquiries on their listings" on public.inquiries;
create policy "owners update inquiries on their listings" on public.inquiries
  for update to authenticated
  using (exists (select 1 from public.listings l where l.id = inquiries.listing_id and l.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.listings l where l.id = inquiries.listing_id and l.owner_user_id = auth.uid()));

-- 6) Buyer requirements + search logs: admins read.
drop policy if exists "admins read buyer_interests" on public.buyer_interests;
create policy "admins read buyer_interests" on public.buyer_interests
  for select to authenticated using (public.is_admin());

drop policy if exists "admins read search_logs" on public.search_logs;
create policy "admins read search_logs" on public.search_logs
  for select to authenticated using (public.is_admin());

-- 7) Saved searches (powers search alerts).
create table if not exists public.saved_searches (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  label            text,
  query            text not null,
  created_at       timestamptz not null default now(),
  last_notified_at timestamptz,
  unique (user_id, query)
);
create index if not exists saved_searches_user_id_idx on public.saved_searches (user_id);
alter table public.saved_searches enable row level security;
drop policy if exists "own saved searches" on public.saved_searches;
create policy "own saved searches" on public.saved_searches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 8) Collections.
create table if not exists public.collections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);
create index if not exists collections_user_id_idx on public.collections (user_id);

create table if not exists public.collection_listings (
  collection_id uuid not null references public.collections (id) on delete cascade,
  listing_id    uuid not null references public.listings (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (collection_id, listing_id)
);
create index if not exists collection_listings_listing_id_idx on public.collection_listings (listing_id);

alter table public.collections enable row level security;
alter table public.collection_listings enable row level security;

drop policy if exists "own collections" on public.collections;
create policy "own collections" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own collection items" on public.collection_listings;
create policy "own collection items" on public.collection_listings
  for all
  using (exists (select 1 from public.collections c where c.id = collection_listings.collection_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.collections c where c.id = collection_listings.collection_id and c.user_id = auth.uid()));

-- 9) Deals — private sale price + commission per listing (agent CRM).
--    Kept separate from the public "listings" table so financials never leak.
create table if not exists public.deals (
  id                uuid primary key default gen_random_uuid(),
  listing_id        uuid not null unique references public.listings (id) on delete cascade,
  agent_user_id     uuid not null references auth.users (id) on delete cascade,
  sale_price        numeric,
  commission_amount numeric,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists deals_agent_idx on public.deals (agent_user_id);
alter table public.deals enable row level security;

drop policy if exists "agents manage own deals" on public.deals;
create policy "agents manage own deals" on public.deals
  for all to authenticated using (auth.uid() = agent_user_id) with check (auth.uid() = agent_user_id);

drop policy if exists "admins read deals" on public.deals;
create policy "admins read deals" on public.deals
  for select to authenticated using (public.is_admin());

-- 11) Verification requests — sellers submit ownership docs; admins review.
--     Create a PRIVATE storage bucket named "verification" (Public OFF) in the
--     dashboard; the policies below allow uploads + admin-only reads.
create table if not exists public.verification_requests (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings (id) on delete cascade,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  documents     text[] not null default '{}',   -- storage paths in the "verification" bucket
  status        text not null default 'pending', -- pending | approved | rejected
  note          text,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);
create index if not exists verification_status_idx on public.verification_requests (status);
create index if not exists verification_owner_idx on public.verification_requests (owner_user_id);
alter table public.verification_requests enable row level security;

drop policy if exists "owners manage own verification" on public.verification_requests;
create policy "owners manage own verification" on public.verification_requests
  for all to authenticated using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists "admins read verification" on public.verification_requests;
create policy "admins read verification" on public.verification_requests
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update verification" on public.verification_requests;
create policy "admins update verification" on public.verification_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Private "verification" bucket: authenticated users upload; only admins read.
drop policy if exists "auth upload verification docs" on storage.objects;
create policy "auth upload verification docs" on storage.objects
  for insert to authenticated with check (bucket_id = 'verification');

drop policy if exists "admins read verification docs" on storage.objects;
create policy "admins read verification docs" on storage.objects
  for select to authenticated using (bucket_id = 'verification' and public.is_admin());

-- 12) Listing view counter — anon can increment via a SECURITY DEFINER function
--     (so it never needs broad UPDATE rights on listings).
alter table public.listings add column if not exists views integer not null default 0;

create or replace function public.increment_listing_views(lid uuid)
returns void language sql security definer set search_path = public as $$
  update public.listings set views = views + 1 where id = lid;
$$;
grant execute on function public.increment_listing_views(uuid) to anon, authenticated;

-- 13) Reports — anyone can flag a listing; admins review.
create table if not exists public.reports (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now(),
  resolved   boolean not null default false
);
create index if not exists reports_resolved_idx on public.reports (resolved);
alter table public.reports enable row level security;

drop policy if exists "anyone can report" on public.reports;
create policy "anyone can report" on public.reports for insert to public with check (true);

drop policy if exists "admins read reports" on public.reports;
create policy "admins read reports" on public.reports for select to authenticated using (public.is_admin());

drop policy if exists "admins update reports" on public.reports;
create policy "admins update reports" on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 14) Price-drop tracking (set on edit when the price decreases).
alter table public.listings add column if not exists previous_price numeric;
alter table public.listings add column if not exists price_changed_at timestamptz;

-- 15) Refresh the API schema cache.
notify pgrst, 'reload schema';

-- ============================================================
-- Make yourself an admin (run separately, with your login email):
--
--   update public.profiles set role = 'admin'
--   where user_id = (select id from auth.users where email = 'YOUR-LOGIN-EMAIL');
--
-- Also confirm the Storage bucket is named exactly "Listings" and is Public.
-- ============================================================
