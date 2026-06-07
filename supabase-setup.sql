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

-- 4) Profiles: a user can read their own row (for the role check).
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (auth.uid() = user_id);

-- 5) Inquiries: admins read all; owners read inquiries for their own listings.
drop policy if exists "admins read inquiries" on public.inquiries;
create policy "admins read inquiries" on public.inquiries
  for select to authenticated using (public.is_admin());

drop policy if exists "owners read inquiries on their listings" on public.inquiries;
create policy "owners read inquiries on their listings" on public.inquiries
  for select to authenticated
  using (exists (select 1 from public.listings l where l.id = inquiries.listing_id and l.owner_user_id = auth.uid()));

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

-- 9) Refresh the API schema cache.
notify pgrst, 'reload schema';

-- ============================================================
-- Make yourself an admin (run separately, with your login email):
--
--   update public.profiles set role = 'admin'
--   where user_id = (select id from auth.users where email = 'YOUR-LOGIN-EMAIL');
--
-- Also confirm the Storage bucket is named exactly "Listings" and is Public.
-- ============================================================
