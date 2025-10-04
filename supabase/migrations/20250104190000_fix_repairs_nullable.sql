-- Migration pour corriger les contraintes NOT NULL sur la table repairs
-- Permettre les valeurs NULL pour quote_id et repairer_id lors de la création initiale

-- Modifier la colonne quote_id pour permettre NULL
ALTER TABLE repairs ALTER COLUMN quote_id DROP NOT NULL;

-- Modifier la colonne repairer_id pour permettre NULL  
ALTER TABLE repairs ALTER COLUMN repairer_id DROP NOT NULL;

-- Ajouter des commentaires pour clarifier le workflow
COMMENT ON COLUMN repairs.quote_id IS 'ID du devis accepté - NULL jusqu''à ce qu''un devis soit accepté';
COMMENT ON COLUMN repairs.repairer_id IS 'ID du réparateur assigné - NULL jusqu''à ce qu''un réparateur soit assigné';

-- Mettre à jour les contraintes de clé étrangère pour permettre NULL
-- (Les contraintes de clé étrangère existantes permettent déjà NULL, donc pas de modification nécessaire)

-- Ajouter des index pour améliorer les performances des requêtes avec NULL
CREATE INDEX IF NOT EXISTS idx_repairs_quote_id_null ON repairs(quote_id) WHERE quote_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_repairs_repairer_id_null ON repairs(repairer_id) WHERE repairer_id IS NULL;
