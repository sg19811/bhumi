-- Capture name + phone in profiles reliably. Run once in the Supabase SQL Editor.
-- 1) add the columns; 2) make the signup trigger save name/phone from the data the
-- signup form sends (works even when email confirmation is on, since the trigger
-- runs server-side at user creation); 3) backfill existing users from auth metadata.

alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, role, name, phone)
  values (
    new.id,
    'user',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (user_id) do update
    set name  = coalesce(public.profiles.name,  excluded.name),
        phone = coalesce(public.profiles.phone, excluded.phone);
  return new;
end; $$;

-- Backfill existing profiles from whatever signup metadata is available.
update public.profiles p
set name  = coalesce(p.name,  u.raw_user_meta_data->>'full_name'),
    phone = coalesce(p.phone, u.raw_user_meta_data->>'phone')
from auth.users u
where u.id = p.user_id;
