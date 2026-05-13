-- Run this in Supabase: SQL Editor → New query → Run.
-- Fixes: "new row violates row-level security policy" when inserting into `clothes`
-- and optional storage errors on `clothing-images` uploads.
--
-- Assumes table `public.clothes` has a `user_id uuid` column referencing the signed-in user.

-- ========== public.clothes ==========
ALTER TABLE public.clothes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clothes_select_own" ON public.clothes;
CREATE POLICY "clothes_select_own"
  ON public.clothes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "clothes_insert_own" ON public.clothes;
CREATE POLICY "clothes_insert_own"
  ON public.clothes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "clothes_update_own" ON public.clothes;
CREATE POLICY "clothes_update_own"
  ON public.clothes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "clothes_delete_own" ON public.clothes;
CREATE POLICY "clothes_delete_own"
  ON public.clothes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========== storage.objects (bucket: clothing-images) ==========
-- App uploads to: {auth.uid()}/{timestamp}.{ext}
DROP POLICY IF EXISTS "clothing_images_insert_own_folder" ON storage.objects;
CREATE POLICY "clothing_images_insert_own_folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'clothing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "clothing_images_select_public_read" ON storage.objects;
CREATE POLICY "clothing_images_select_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'clothing-images');

DROP POLICY IF EXISTS "clothing_images_update_own" ON storage.objects;
CREATE POLICY "clothing_images_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'clothing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "clothing_images_delete_own" ON storage.objects;
CREATE POLICY "clothing_images_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'clothing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
