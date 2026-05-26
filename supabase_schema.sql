-- ═══════════════════════════════════════════════════════════════
--  RFT Cognitive Trainer — Supabase Schema
--  Run this in the Supabase SQL Editor of your project.
-- ═══════════════════════════════════════════════════════════════

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text,
  current_level integer not null default 1,
  created_at  timestamptz not null default now()
);

-- Sessions table (one row per training session)
create table if not exists public.sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade not null,
  played_at        timestamptz not null default now(),
  sm_score         float4 not null,
  avg_time_seconds float4 not null,
  accuracy         float4 not null,   -- 0.0 → 1.0
  level            integer not null,
  question_count   integer not null
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;

-- Profiles: users can only see/edit their own profile
create policy "Own profile access" on public.profiles
  for all using (auth.uid() = id);

-- Sessions: users can only see/insert their own sessions
create policy "Own session read" on public.sessions
  for select using (auth.uid() = user_id);

create policy "Own session insert" on public.sessions
  for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Index for fast per-user session history queries
create index if not exists sessions_user_played on public.sessions (user_id, played_at desc);
