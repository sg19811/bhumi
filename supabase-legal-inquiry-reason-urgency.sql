-- ============================================================================
-- AcreHub — Land Legal Navigator  ·  Add reason + urgency to legal_inquiries
-- Captures WHY the person wants a lawyer and HOW URGENT it is, from the
-- "talk to a lawyer" form. Both are nullable (older rows + optional contexts).
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================================

alter table public.legal_inquiries add column if not exists reason  text;
alter table public.legal_inquiries add column if not exists urgency text;

-- Optional: sort/triage by urgency in the admin dashboard.
create index if not exists idx_legal_inquiries_urgency on public.legal_inquiries (urgency);

notify pgrst, 'reload schema';
