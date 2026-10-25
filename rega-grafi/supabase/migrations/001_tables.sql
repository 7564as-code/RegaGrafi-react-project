-- 001_tables.sql
-- Creates all tables, indexes and triggers for "Raga Grafi".
-- Run this FIRST in the Supabase dashboard -> SQL Editor.

-- ---------------------------------------------------------------
-- profiles: one row per user (id = auth.users.id)
-- ---------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null unique,           -- nickname shown to other users
  bio           text,
  categories    text[] not null default '{}',
  is_designer   boolean not null default false, -- "I offer design services"
  availability  text not null default 'available'
                check (availability in ('available', 'unavailable')),
  logo_url      text,
  portfolio_url text,
  notify_email  boolean not null default true,
  role          text not null default 'user' check (role in ('user', 'admin')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- jobs: the central object
-- ---------------------------------------------------------------
create table public.jobs (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 3 and 150),
  description text not null,
  category    text not null check (category in ('logo', 'flyer', 'banner', 'social', 'other')),
  budget      numeric(10, 2) check (budget >= 0),
  deadline    timestamptz,
  status      text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index jobs_owner_idx   on public.jobs (owner_id);
create index jobs_status_idx  on public.jobs (status);
create index jobs_created_idx on public.jobs (created_at desc);

-- ---------------------------------------------------------------
-- proposals: a designer's offer on a job
-- ---------------------------------------------------------------
create table public.proposals (
  id             uuid primary key default gen_random_uuid(),
  job_id         uuid not null references public.jobs (id) on delete cascade,
  designer_id    uuid not null references public.profiles (id) on delete cascade,
  message        text not null,
  price          numeric(10, 2) not null check (price >= 0),
  delivery_hours integer not null check (delivery_hours > 0),
  status         text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at     timestamptz not null default now(),
  unique (job_id, designer_id)                  -- one proposal per designer per job
);

create index proposals_job_idx      on public.proposals (job_id);
create index proposals_designer_idx on public.proposals (designer_id);

-- ---------------------------------------------------------------
-- conversations: private chat between two users.
-- job_id is NULL for a direct message from a designer's profile.
-- user_a < user_b is enforced, so a pair is always stored in the same order
-- (the API must sort the two ids before inserting). This makes the
-- uniqueness rules below work.
-- ---------------------------------------------------------------
create table public.conversations (
  id               uuid primary key default gen_random_uuid(),
  job_id           uuid references public.jobs (id) on delete cascade,
  user_a           uuid not null references public.profiles (id) on delete cascade,
  user_b           uuid not null references public.profiles (id) on delete cascade,
  last_notified_at timestamptz,                 -- used for the email rate limit
  created_at       timestamptz not null default now(),
  check (user_a < user_b)
);

-- No duplicates: same pair + same job, and same pair when there is no job.
create unique index conversations_pair_job_uidx
  on public.conversations (user_a, user_b, job_id) where job_id is not null;
create unique index conversations_pair_direct_uidx
  on public.conversations (user_a, user_b) where job_id is null;
create index conversations_user_a_idx on public.conversations (user_a);
create index conversations_user_b_idx on public.conversations (user_b);

-- ---------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 5000),
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);

-- Used by polling: "give me messages after <timestamp>"
create index messages_conv_created_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------
-- Trigger: keep jobs.updated_at fresh
-- ---------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Trigger: create a profile automatically when someone signs up.
-- The role is ALWAYS 'user' here; the client can never choose it.
-- ---------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, 'user_' || substr(new.id::text, 1, 8));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
