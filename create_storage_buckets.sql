-- Script pour créer les buckets de stockage Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Créer le bucket pour les médias des objets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
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
) ON CONFLICT (id) DO NOTHING;

-- Créer le bucket pour les avatars des utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
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
) ON CONFLICT (id) DO NOTHING;

-- Créer le bucket pour les photos de réparation
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
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
) ON CONFLICT (id) DO NOTHING;

-- Vérifier que les buckets ont été créés
SELECT 
    id as "Nom du Bucket",
    name as "Nom Complet", 
    public as "Public",
    CASE 
        WHEN file_size_limit = 10485760 THEN '10MB'
        WHEN file_size_limit = 52428800 THEN '50MB'
        ELSE ROUND(file_size_limit / 1024 / 1024) || 'MB'
    END as "Taille Max",
    array_length(allowed_mime_types, 1) as "Types de Fichiers Autorisés"
FROM storage.buckets 
WHERE id IN ('item-media', 'avatars', 'repair-photos')
ORDER BY id;
