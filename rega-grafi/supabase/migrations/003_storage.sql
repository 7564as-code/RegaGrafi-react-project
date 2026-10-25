-- 003_storage.sql
-- Storage bucket "logos" for profile logos. Run this THIRD.
-- Public read; each user may write only inside the folder named after their id.
-- Only png/jpeg/webp images, max 2MB.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "logos: public read"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "logos: upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "logos: update own files"
  on storage.objects for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logos: delete own files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
