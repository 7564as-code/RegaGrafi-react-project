-- 004_more_categories.sql
-- Adds two job categories: 'video' (clips) and 'ad' (advertisements).
-- Run this in the Supabase dashboard -> SQL Editor. Existing jobs are not changed.

alter table public.jobs drop constraint jobs_category_check;

alter table public.jobs
  add constraint jobs_category_check
  check (category in ('logo', 'flyer', 'banner', 'social', 'video', 'ad', 'other'));
