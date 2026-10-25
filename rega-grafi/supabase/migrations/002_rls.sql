-- 002_rls.sql
-- Row Level Security (RLS): rules inside the database that decide which rows
-- each user may read / write. Run this SECOND.
-- Note: the "secret" key bypasses RLS, so use it only in trusted server code.

-- ---------------------------------------------------------------
-- Helper: is the current user an admin?
-- security definer = runs with the owner's rights, so it can read profiles
-- without being blocked by the profiles policies (avoids infinite recursion).
-- ---------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles      enable row level security;
alter table public.jobs          enable row level security;
alter table public.proposals     enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- ---------------------------------------------------------------
-- profiles
-- Any signed-in user can read profiles (the table holds no email/phone;
-- the API also filters the output through toPublicProfile).
-- Profiles are created only by the signup trigger, so there is no INSERT policy.
-- ---------------------------------------------------------------
create policy "profiles: signed-in users can read"
  on public.profiles for select to authenticated
  using (true);

create policy "profiles: edit own row"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Column-level protection: a user can update ONLY these columns.
-- "role" (and id, created_at) are missing on purpose, so nobody can make
-- themselves admin. To create an admin, change the role in the dashboard.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, bio, categories, is_designer, availability,
              logo_url, portfolio_url, notify_email)
  on public.profiles to authenticated;

-- ---------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------
create policy "jobs: read open, own, or all if admin"
  on public.jobs for select to authenticated
  using (status = 'open' or owner_id = auth.uid() or public.is_admin());

create policy "jobs: insert as owner"
  on public.jobs for insert to authenticated
  with check (owner_id = auth.uid());

create policy "jobs: owner or admin can update"
  on public.jobs for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "jobs: owner or admin can delete"
  on public.jobs for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------
-- proposals
-- ---------------------------------------------------------------
create policy "proposals: designer, job owner or admin can read"
  on public.proposals for select to authenticated
  using (
    designer_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.jobs j where j.id = job_id and j.owner_id = auth.uid())
  );

-- Insert: as myself, status pending, on an open job that is not mine.
create policy "proposals: insert on open job of someone else"
  on public.proposals for insert to authenticated
  with check (
    designer_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1 from public.jobs j
      where j.id = job_id and j.status = 'open' and j.owner_id <> auth.uid()
    )
  );

-- Update: only the job owner (to accept / reject).
create policy "proposals: job owner can update status"
  on public.proposals for update to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.owner_id = auth.uid()))
  with check (exists (select 1 from public.jobs j where j.id = job_id and j.owner_id = auth.uid()));

-- The owner may change ONLY the status column, not price/message.
revoke update on public.proposals from authenticated, anon;
grant update (status) on public.proposals to authenticated;

-- ---------------------------------------------------------------
-- conversations: only the two participants (admin may read, not write)
-- ---------------------------------------------------------------
create policy "conversations: participants or admin can read"
  on public.conversations for select to authenticated
  using (auth.uid() in (user_a, user_b) or public.is_admin());

create policy "conversations: participant can create"
  on public.conversations for insert to authenticated
  with check (auth.uid() in (user_a, user_b));

-- No UPDATE policy: last_notified_at is written by the server (secret key).

-- ---------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------
create policy "messages: participants or admin can read"
  on public.messages for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
    )
  );

create policy "messages: participant can send as themselves"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
    )
  );

-- The receiver (not the sender) can mark a message as read.
create policy "messages: receiver can mark as read"
  on public.messages for update to authenticated
  using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
    )
  );

revoke update on public.messages from authenticated, anon;
grant update (read_at) on public.messages to authenticated;
