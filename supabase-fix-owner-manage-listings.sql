-- ============================================================================
-- AcreHub — FIX: let owners manage their own listings (edit / sold / withdraw / relist)
-- ----------------------------------------------------------------------------
-- WHY: the only UPDATE policy on `listings` was "admins update listings", so
-- sellers could not edit, withdraw, mark sold, or re-list their own listings —
-- every owner update was silently denied by RLS.
--
-- This adds an owner UPDATE policy, and keeps the moderation gate intact with a
-- trigger that blocks ONLY the pending -> active jump for non-admins. So:
--   • owners can edit, mark sold/withdrawn, and re-list a previously-approved listing
--   • a brand-new PENDING listing still can't be self-published — only an admin approves
--   • admins can do anything
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.
-- ============================================================================

drop policy if exists "owners update own listings" on public.listings;
create policy "owners update own listings" on public.listings
  for update to authenticated
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create or replace function public.enforce_listing_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- A pending listing can only be moved to 'active' by an admin (the approval step).
  if NEW.status = 'active' and OLD.status = 'pending' and not public.is_admin() then
    raise exception 'New listings must be approved by an admin before they go live.';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_enforce_listing_moderation on public.listings;
create trigger trg_enforce_listing_moderation
  before update on public.listings
  for each row execute function public.enforce_listing_moderation();

notify pgrst, 'reload schema';
