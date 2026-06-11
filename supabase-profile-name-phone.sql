-- Capture name + phone in profiles. The table already has `full_name` + `phone`;
-- earlier code/migration wrongly used `name`, so writes failed. This fixes the
-- signup trigger + backfill to use the real `full_name` column.
-- Run once in the Supabase SQL Editor.

-- 1) Save full_name + phone on every new signup, from the data the signup form sends.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, role, full_name, phone)
  values (
    new.id,
    'user',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end; $$;

-- 2) Backfill existing profiles from whatever signup metadata is available.
update public.profiles p
set full_name = coalesce(p.full_name, u.raw_user_meta_data->>'full_name'),
    phone     = coalesce(p.phone,     u.raw_user_meta_data->>'phone')
from auth.users u
where u.id = p.user_id;

-- 3) Optional cleanup: the earlier migration added a redundant, unused `name`
-- column. Once the app is deployed with the full_name fix, you can drop it:
-- alter table public.profiles drop column if exists name;
