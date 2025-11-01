-- Create storage bucket for user photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to view photos (public bucket)
CREATE POLICY "Public photos are viewable by everyone"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'photos');