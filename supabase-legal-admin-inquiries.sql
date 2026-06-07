-- ============================================================================
-- AcreHub — Land Legal Navigator  ·  Admin access to legal leads
-- Lets the admin dashboard (client, is_admin() RLS) read & triage legal_inquiries.
-- Still NOT public — only admins can read this PII. Run in Supabase SQL Editor.
-- Safe to re-run.
-- ============================================================================

alter table public.legal_inquiries enable row level security;

drop policy if exists "admin read legal inquiries" on public.legal_inquiries;
create policy "admin read legal inquiries"
  on public.legal_inquiries for select
  using (public.is_admin());

drop policy if exists "admin update legal inquiries" on public.legal_inquiries;
create policy "admin update legal inquiries"
  on public.legal_inquiries for update
  using (public.is_admin())
  with check (public.is_admin());

notify pgrst, 'reload schema';
