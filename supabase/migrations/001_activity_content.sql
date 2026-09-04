-- Migration: extend activity_logs with content fields + workout_exercises
-- Run in Supabase SQL Editor for existing databases.

alter table activity_logs add column if not exists user_id uuid not null default '00000000-0000-0000-0000-000000000001';
alter table activity_logs add column if not exists activity_date date;
alter table activity_logs add column if not exists title text;
alter table activity_logs add column if not exists reference text;
alter table activity_logs add column if not exists reflection text;
alter table activity_logs add column if not exists updated_at timestamptz not null default now();

update activity_logs
set
  user_id = '00000000-0000-0000-0000-000000000001',
  activity_date = (created_at at time zone 'UTC')::date
where activity_date is null;

alter table activity_logs alter column activity_date set not null;

create unique index if not exists activity_logs_user_type_date_uidx
  on activity_logs (user_id, activity_type, activity_date);

create index if not exists activity_logs_user_date_idx
  on activity_logs (user_id, activity_date);

create index if not exists activity_logs_user_type_date_idx
  on activity_logs (user_id, activity_type, activity_date);

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  activity_log_id uuid not null references activity_logs(id) on delete cascade,
  exercise_name text not null,
  sets integer not null,
  reps integer not null,
  weight numeric,
  created_at timestamptz not null default now()
);

create index if not exists workout_exercises_log_id_idx
  on workout_exercises (activity_log_id);

alter table workout_exercises enable row level security;

create policy "Allow all select on workout_exercises"
  on workout_exercises for select using (true);

create policy "Allow all insert on workout_exercises"
  on workout_exercises for insert with check (true);

create policy "Allow all update on workout_exercises"
  on workout_exercises for update using (true);

create policy "Allow all delete on workout_exercises"
  on workout_exercises for delete using (true);
