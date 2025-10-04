-- Script complet pour configurer le stockage Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ===============================================
-- 1. CRÉER LES BUCKETS DE STOCKAGE
-- ===============================================

-- Créer les buckets de stockage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'item-media',
    'item-media',
    true,
    52428800, -- 50MB limit
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/mkv'
    ]
  ),
  (
    'avatars',
    'avatars',
    true,
    10485760, -- 10MB limit
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  ),
  (
    'repair-photos',
    'repair-photos',
    true,
    52428800, -- 50MB limit
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ===============================================
-- 2. SUPPRIMER LES ANCIENNES POLITIQUES (SI ELLES EXISTENT)
-- ===============================================

-- Supprimer toutes les politiques existantes pour les objets de stockage
DROP POLICY IF EXISTS "Authenticated users can upload to item-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view item-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files from item-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files in item-media" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload repair photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view repair photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own repair photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own repair photos" ON storage.objects;

-- ===============================================
-- 3. CRÉER LES NOUVELLES POLITIQUES DE STOCKAGE
-- ===============================================

-- POLITIQUES POUR ITEM-MEDIA
CREATE POLICY "Authenticated users can upload to item-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-media');

CREATE POLICY "Authenticated users can view item-media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'item-media');

CREATE POLICY "Users can delete their own files from item-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-media');

CREATE POLICY "Users can update their own files in item-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'item-media');

-- POLITIQUES POUR AVATARS
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- POLITIQUES POUR REPAIR-PHOTOS
CREATE POLICY "Authenticated users can upload repair photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'repair-photos');

CREATE POLICY "Authenticated users can view repair photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'repair-photos');

CREATE POLICY "Users can delete their own repair photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'repair-photos');

CREATE POLICY "Users can update their own repair photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'repair-photos');

-- ===============================================
-- 4. VÉRIFICATIONS
-- ===============================================

-- Vérifier que les buckets ont été créés
SELECT 
    '✅ Buckets créés:' as "Statut",
    b.id as "Bucket ID",
    b.name as "Nom",
    b.public as "Public",
    CASE 
        WHEN b.file_size_limit = 10485760 THEN '10MB'
        WHEN b.file_size_limit = 52428800 THEN '50MB'
        ELSE ROUND(b.file_size_limit / 1024 / 1024) || 'MB'
    END as "Taille Max",
    array_length(b.allowed_mime_types, 1) as "Types Autorisés"
FROM storage.buckets b
WHERE b.id IN ('item-media', 'avatars', 'repair-photos')
ORDER BY b.id;

-- Vérifier que les politiques ont été créées
SELECT 
    '✅ Politiques créées:' as "Statut",
    policyname as "Nom de la Politique",
    cmd as "Commande",
    CASE 
        WHEN 'authenticated' = ANY(roles) THEN 'Utilisateurs Authentifiés'
        WHEN 'public' = ANY(roles) THEN 'Public'
        ELSE array_to_string(roles, ', ')
    END as "Rôles Autorisés"
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%item-media%' OR policyname LIKE '%avatars%' OR policyname LIKE '%repair%'
ORDER BY policyname;
