-- ============================================
-- RENDRE PUBLICS TOUS LES BUCKETS EXISTANTS
-- ============================================

-- 1. RENDRE PUBLICS tous les buckets
UPDATE storage.buckets
SET public = true
WHERE id IN ('product-images', 'farm-images', 'service-images', 'user-avatars');

-- 2. VÉRIFIER que tous les buckets sont publics
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id IN ('product-images', 'farm-images', 'service-images', 'user-avatars')
ORDER BY name;

-- Résultat attendu: tous avec public = true ✅

-- 3. POLITIQUES RLS - LECTURE PUBLIQUE (permet l'affichage des images)

DROP POLICY IF EXISTS "Lecture publique product-images" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique farm-images" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique service-images" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique user-avatars" ON storage.objects;

CREATE POLICY "Lecture publique product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Lecture publique farm-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'farm-images');

CREATE POLICY "Lecture publique service-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "Lecture publique user-avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- 4. POLITIQUES RLS - UPLOAD ADMIN

DROP POLICY IF EXISTS "Upload product-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Upload farm-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Upload service-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Upload user-avatars admin" ON storage.objects;

CREATE POLICY "Upload product-images admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Upload farm-images admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'farm-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Upload service-images admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Upload user-avatars admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 5. POLITIQUES RLS - UPDATE ADMIN

DROP POLICY IF EXISTS "Update product-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Update farm-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Update service-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Update user-avatars admin" ON storage.objects;

CREATE POLICY "Update product-images admin"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Update farm-images admin"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'farm-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Update service-images admin"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Update user-avatars admin"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 6. POLITIQUES RLS - DELETE ADMIN

DROP POLICY IF EXISTS "Delete product-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Delete farm-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Delete service-images admin" ON storage.objects;
DROP POLICY IF EXISTS "Delete user-avatars admin" ON storage.objects;

CREATE POLICY "Delete product-images admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Delete farm-images admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'farm-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Delete service-images admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Delete user-avatars admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 7. VÉRIFICATION FINALE
SELECT 
  'BUCKETS' as type,
  id, 
  name, 
  public::text as status,
  created_at::text
FROM storage.buckets
WHERE id IN ('product-images', 'farm-images', 'service-images', 'user-avatars')
ORDER BY name;

