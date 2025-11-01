-- Ensure storage buckets exist and configure RLS policies
-- Create buckets if they do not already exist
insert into storage.buckets (id, name, public)
values ('profile-photos','profile-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post-photos','post-photos', true)
on conflict (id) do nothing;

-- Public read access for profile-photos
do $$
begin
  create policy "Public read profile-photos"
  on storage.objects
  for select
  using (bucket_id = 'profile-photos');
exception when duplicate_object then null;
end $$;

-- Authenticated users can upload to profile-photos (scoped to their own folder prefix)
do $$
begin
  create policy "Authenticated upload profile-photos"
  on storage.objects
  for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
exception when duplicate_object then null;
end $$;

-- Authenticated users can update their own files in profile-photos
DO $$
BEGIN
  CREATE POLICY "Authenticated update profile-photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-photos'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Public read access for post-photos
DO $$
BEGIN
  CREATE POLICY "Public read post-photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-photos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticated users can upload to post-photos (scoped to their own folder prefix)
DO $$
BEGIN
  CREATE POLICY "Authenticated upload post-photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'post-photos'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticated users can update their own files in post-photos
DO $$
BEGIN
  CREATE POLICY "Authenticated update post-photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'post-photos'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
