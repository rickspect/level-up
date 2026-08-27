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
  streak integer not null default 0
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null,
  duration_minutes integer,
  xp_earned integer not null,
  gold_earned integer not null,
  stat_earned text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_type_created_at_idx
  on activity_logs (activity_type, created_at desc);

insert into player (id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

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
