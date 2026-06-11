-- Adds a self-selected identity to profiles, captured at onboarding.
-- 'user_type' is descriptive ('agent' | 'buyer' | 'other'); the permission 'role'
-- column ('user' | 'agent' | 'admin') is separate. Picking "Agent" also sets
-- role='agent' (handled in app code, only for users currently role='user' — admins
-- are never downgraded). Run once in the Supabase SQL Editor.
alter table profiles add column if not exists user_type text;
