-- 005_onboarding.sql
-- Adds profiles.onboarded: false until the user finishes the second sign-up step
-- (display name, designer details...). Run this in the Supabase dashboard -> SQL Editor.

alter table public.profiles
  add column onboarded boolean not null default false;

-- Everyone who already exists has a real profile: do not lock them out.
update public.profiles set onboarded = true;

-- Nothing to grant: "onboarded" is NOT in the column list of 002_rls.sql, so a signed-in
-- user can not set it from the browser. Only POST /api/me/complete (secret key) sets it,
-- and only after it has checked the required fields.
