-- Migration pour configurer les buckets de stockage et leurs politiques
-- Cette migration crée les buckets et configure les politiques RLS pour le stockage

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
-- POLITIQUES DE STOCKAGE POUR ITEM-MEDIA
-- ===============================================

-- Politique pour permettre à tous les utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload to item-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-media');

-- Politique pour permettre à tous les utilisateurs authentifiés de voir les fichiers
CREATE POLICY "Authenticated users can view item-media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'item-media');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own files from item-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-media');

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres fichiers
CREATE POLICY "Users can update their own files in item-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'item-media');

-- ===============================================
-- POLITIQUES DE STOCKAGE POUR AVATARS
-- ===============================================

-- Politique pour permettre à tous les utilisateurs authentifiés d'uploader des avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Politique pour permettre à tous de voir les avatars (public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- ===============================================
-- POLITIQUES DE STOCKAGE POUR REPAIR-PHOTOS
-- ===============================================

-- Politique pour permettre à tous les utilisateurs authentifiés d'uploader des photos de réparation
CREATE POLICY "Authenticated users can upload repair photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'repair-photos');

-- Politique pour permettre à tous les utilisateurs authentifiés de voir les photos de réparation
CREATE POLICY "Authenticated users can view repair photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'repair-photos');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres photos de réparation
CREATE POLICY "Users can delete their own repair photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'repair-photos');

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres photos de réparation
CREATE POLICY "Users can update their own repair photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'repair-photos');

-- Vérifier que les buckets et politiques ont été créés
SELECT 
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

-- Vérifier les politiques créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
