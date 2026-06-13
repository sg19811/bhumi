-- Make listing coordinates optional.
-- The "List your land" form no longer forces a map pin: latitude/longitude are
-- optional (a pin helps buyers but isn't required to publish). The columns were
-- originally created in the Supabase dashboard and may be NOT NULL, which would
-- reject a pin-less insert. Run this once in the Supabase SQL Editor.
--
-- Safe to run repeatedly: a no-op if the columns are already nullable.

alter table public.listings alter column latitude  drop not null;
alter table public.listings alter column longitude drop not null;
