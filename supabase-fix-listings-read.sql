-- ============================================================================
-- AcreHub — FIX: make pending listings visible to admins & their owners
-- ----------------------------------------------------------------------------
-- WHY: the only SELECT policy on `listings` is the public "active only" one, so
-- pending listings are hidden from EVERYONE via the app — including the admin
-- dashboard, so they can never be approved. These two policies (OR-ed with the
-- existing public one by RLS) let admins read every listing and owners read
-- their own, without exposing pending listings to the public.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.
-- ============================================================================

drop policy if exists "admins read all listings" on public.listings;
create policy "admins read all listings" on public.listings
  for select to authenticated using (public.is_admin());

drop policy if exists "owners read own listings" on public.listings;
create policy "owners read own listings" on public.listings
  for select to authenticated using (auth.uid() = owner_user_id);

notify pgrst, 'reload schema';
