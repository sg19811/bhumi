-- Let admins read every profile (so the admin dashboard can list users by type).
-- Run once in the Supabase SQL Editor. Non-admins still only read their own row.
drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles
  for select to authenticated using (public.is_admin());
