-- =====================================================================
-- Growth Engine — auto-generate a referral code for every user (Option A).
-- A SEPARATE, defensive trigger on auth.users (does not touch the existing
-- handle_new_user/profiles trigger). A failure here NEVER blocks signup.
-- Apply MANUALLY in the Supabase SQL Editor. Safe to re-run.
-- Depends on: referral_codes (supabase-growth-engine-phase1.sql).
-- =====================================================================

-- Random code: 8 chars, unambiguous uppercase letters + digits (no 0/O/1/I/L).
create or replace function public.gen_referral_code(len int default 8)
returns text language plpgsql volatile as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  result text := '';
  i int;
begin
  for i in 1..len loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end; $$;

-- Get-or-create a unique referral code for a user. Idempotent; retries on
-- collision; gives up quietly after a few tries rather than erroring.
create or replace function public.ensure_referral_code_for_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_attempt int := 0;
begin
  if p_user_id is null then return; end if;
  if exists (select 1 from public.referral_codes where user_id = p_user_id) then
    return;
  end if;
  loop
    v_attempt := v_attempt + 1;
    v_code := public.gen_referral_code(8);
    begin
      insert into public.referral_codes (code, user_id, referral_type)
      values (v_code, p_user_id, 'buyer');
      return;
    exception when unique_violation then
      if v_attempt >= 6 then return; end if;  -- extremely unlikely; bail quietly
    end;
  end loop;
end; $$;

-- Trigger fn: create a code on new user. Swallows ALL errors so a referral
-- failure can never break account creation.
create or replace function public.on_auth_user_created_referral()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  begin
    perform public.ensure_referral_code_for_user(new.id);
  exception when others then
    null;  -- never block signup on a referral-code failure
  end;
  return new;
end; $$;

drop trigger if exists on_auth_user_created_referral on auth.users;
create trigger on_auth_user_created_referral
  after insert on auth.users
  for each row execute function public.on_auth_user_created_referral();

-- Backfill: give every existing user a code (idempotent).
do $$
declare r record;
begin
  for r in select id from auth.users loop
    perform public.ensure_referral_code_for_user(r.id);
  end loop;
end $$;

-- =====================================================================
-- VERIFY after applying:
--   select count(*) from auth.users;
--   select count(*) from public.referral_codes;   -- should be >= users
-- =====================================================================
