-- Migration pour le système de tracking des réparations
-- Créer des réparations pour les objets existants qui n'en ont pas encore

-- Créer des entrées de réparation pour tous les objets soumis existants
INSERT INTO repairs (
  item_id,
  quote_id,
  repairer_id,
  status,
  tracking_updates,
  completion_photos,
  started_at
)
SELECT 
  i.id as item_id,
  NULL as quote_id,
  NULL as repairer_id,
  CASE 
    WHEN i.status = 'submitted' THEN 'diagnostic'
    WHEN i.status = 'quoted' THEN 'diagnostic'
    WHEN i.status = 'in_progress' THEN 'in_repair'
    WHEN i.status = 'completed' THEN 'completed'
    ELSE 'diagnostic'
  END as status,
  jsonb_build_array(
    jsonb_build_object(
      'timestamp', i.created_at,
      'status', CASE 
        WHEN i.status = 'submitted' THEN 'diagnostic'
        WHEN i.status = 'quoted' THEN 'diagnostic'
        WHEN i.status = 'in_progress' THEN 'in_repair'
        WHEN i.status = 'completed' THEN 'completed'
        ELSE 'diagnostic'
      END,
      'message', CASE 
        WHEN i.status = 'submitted' THEN 'Objet soumis, en attente de diagnostic'
        WHEN i.status = 'quoted' THEN 'Devis reçu, en attente d''acceptation'
        WHEN i.status = 'in_progress' THEN 'Réparation en cours'
        WHEN i.status = 'completed' THEN 'Réparation terminée'
        ELSE 'Objet soumis'
      END,
      'repairer_id', NULL
    )
  ) as tracking_updates,
  '{}'::text[] as completion_photos,
  i.created_at as started_at
FROM items i
LEFT JOIN repairs r ON r.item_id = i.id
WHERE r.id IS NULL -- Seulement pour les objets qui n'ont pas encore de réparation
AND i.status IN ('submitted', 'quoted', 'in_progress', 'completed');

-- Mettre à jour les réparations existantes pour ajouter des champs manquants si nécessaire
UPDATE repairs 
SET 
  tracking_updates = COALESCE(tracking_updates, '[]'::jsonb),
  completion_photos = COALESCE(completion_photos, '{}'::text[]),
  started_at = COALESCE(started_at, created_at)
WHERE tracking_updates IS NULL 
   OR completion_photos IS NULL 
   OR started_at IS NULL;

-- Créer un index pour améliorer les performances des requêtes de tracking
CREATE INDEX IF NOT EXISTS idx_repairs_item_id ON repairs(item_id);
CREATE INDEX IF NOT EXISTS idx_repairs_repairer_id ON repairs(repairer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_started_at ON repairs(started_at);

-- Commentaire sur la migration
COMMENT ON TABLE repairs IS 'Table de suivi des réparations avec historique des mises à jour et photos de progression';
