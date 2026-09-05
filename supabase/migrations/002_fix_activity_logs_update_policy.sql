-- Fix activity_logs updates being silently blocked by RLS (0 rows updated).
-- Run this in the Supabase SQL Editor if edits save without error but data does not change.

drop policy if exists "Allow all update on activity_logs" on activity_logs;

create policy "Allow all update on activity_logs"
  on activity_logs
  for update
  using (true)
  with check (true);
