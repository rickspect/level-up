-- LevelUP minimum schema (single default player, no auth)
-- Run this in the Supabase SQL Editor.

create table if not exists player (
  id uuid primary key,
  level integer not null default 1,
  xp integer not null default 0,
  gold integer not null default 0,
  knowledge integer not null default 0,
  faith integer not null default 0,
  fitness integer not null default 0,
  tech integer not null default 0,
  evolution_energy integer not null default 0,
  evolution_stage text not null default 'baby',
  streak integer not null default 0,
  equipped_aura_id text,
  equipped_accessory_id text
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  activity_type text not null,
  activity_date date not null,
  title text,
  reference text,
  reflection text,
  duration_minutes integer,
  xp_earned integer not null,
  gold_earned integer not null,
  stat_earned text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists activity_logs_user_type_date_uidx
  on activity_logs (user_id, activity_type, activity_date);

create index if not exists activity_logs_user_date_idx
  on activity_logs (user_id, activity_date);

create index if not exists activity_logs_user_type_date_idx
  on activity_logs (user_id, activity_type, activity_date);

create index if not exists activity_logs_type_created_at_idx
  on activity_logs (activity_type, created_at desc);

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

insert into player (id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- Migration for existing databases
alter table player add column if not exists evolution_stage text not null default 'baby';

alter table player enable row level security;
alter table activity_logs enable row level security;

create policy "Allow all select on player"
  on player for select using (true);

create policy "Allow all update on player"
  on player for update using (true);

create policy "Allow all select on activity_logs"
  on activity_logs for select using (true);

create policy "Allow all insert on activity_logs"
  on activity_logs for insert with check (true);

create policy "Allow all update on activity_logs"
  on activity_logs for update using (true) with check (true);

alter table workout_exercises enable row level security;

create policy "Allow all select on workout_exercises"
  on workout_exercises for select using (true);

create policy "Allow all insert on workout_exercises"
  on workout_exercises for insert with check (true);

create policy "Allow all update on workout_exercises"
  on workout_exercises for update using (true);

create policy "Allow all delete on workout_exercises"
  on workout_exercises for delete using (true);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  is_active boolean not null default true
);

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references rewards(id),
  gold_spent integer not null,
  created_at timestamptz not null default now()
);

create table if not exists perfect_day_claims (
  id uuid primary key default gen_random_uuid(),
  xp_earned integer not null default 75,
  gold_earned integer not null default 30,
  energy_earned integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists reward_redemptions_created_at_idx
  on reward_redemptions (created_at desc);

create index if not exists perfect_day_claims_created_at_idx
  on perfect_day_claims (created_at desc);

insert into rewards (name, price)
select name, price
from (
  values
    ('Gaming 1 Hour', 80),
    ('Favorite Coffee', 100),
    ('Favorite Meal', 200),
    ('Movie Night', 250),
    ('Buy New Game', 800)
) as seed(name, price)
where not exists (select 1 from rewards limit 1);

alter table rewards enable row level security;
alter table reward_redemptions enable row level security;
alter table perfect_day_claims enable row level security;

create policy "Allow all select on rewards"
  on rewards for select using (true);

create policy "Allow all select on reward_redemptions"
  on reward_redemptions for select using (true);

create policy "Allow all insert on reward_redemptions"
  on reward_redemptions for insert with check (true);

create policy "Allow all select on perfect_day_claims"
  on perfect_day_claims for select using (true);

create policy "Allow all insert on perfect_day_claims"
  on perfect_day_claims for insert with check (true);

create table if not exists coding_sessions (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  duration_minutes integer not null,
  learning_note text not null,
  created_at timestamptz not null default now()
);

create index if not exists coding_sessions_created_at_idx
  on coding_sessions (created_at desc);

alter table coding_sessions enable row level security;

create policy "Allow all select on coding_sessions"
  on coding_sessions for select using (true);

create policy "Allow all insert on coding_sessions"
  on coding_sessions for insert with check (true);
