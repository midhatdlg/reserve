-- Public bucket for wedding photos and design uploads (see PhotoUploader, CivilClassicSidebar, ZoneEditor).
-- Without this row in storage.buckets, uploads fail with "Bucket not found".

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read objects (public URLs on the invite).
DROP POLICY IF EXISTS "photos_select_public" ON storage.objects;
CREATE POLICY "photos_select_public"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Signed-in couples upload / replace / delete their files.
DROP POLICY IF EXISTS "photos_insert_authenticated" ON storage.objects;
CREATE POLICY "photos_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_update_authenticated" ON storage.objects;
CREATE POLICY "photos_update_authenticated"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos')
WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_delete_authenticated" ON storage.objects;
CREATE POLICY "photos_delete_authenticated"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos');
