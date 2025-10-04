-- Script pour corriger le problème RLS
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer toutes les politiques RLS existantes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can view verified repairers" ON repairer_profiles;
DROP POLICY IF EXISTS "Repairers can view own profile" ON repairer_profiles;
DROP POLICY IF EXISTS "Repairers can insert own profile" ON repairer_profiles;
DROP POLICY IF EXISTS "Repairers can update own profile" ON repairer_profiles;
DROP POLICY IF EXISTS "Repairers can delete own profile" ON repairer_profiles;

DROP POLICY IF EXISTS "Users can view own items" ON items;
DROP POLICY IF EXISTS "Repairers can view submitted items" ON items;
DROP POLICY IF EXISTS "Users can insert own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

DROP POLICY IF EXISTS "Users can view quotes for their items" ON quotes;
DROP POLICY IF EXISTS "Repairers can view own quotes" ON quotes;
DROP POLICY IF EXISTS "Repairers can insert quotes" ON quotes;
DROP POLICY IF EXISTS "Repairers can update own quotes" ON quotes;
DROP POLICY IF EXISTS "Repairers can delete own quotes" ON quotes;

DROP POLICY IF EXISTS "Users can view repairs for their items" ON repairs;
DROP POLICY IF EXISTS "Repairers can view own repairs" ON repairs;
DROP POLICY IF EXISTS "Repairers can insert repairs" ON repairs;
DROP POLICY IF EXISTS "Repairers can update own repairs" ON repairs;
DROP POLICY IF EXISTS "Repairers can delete own repairs" ON repairs;

DROP POLICY IF EXISTS "Anyone can view available marketplace items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can view own listings" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can insert listings" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can update own listings" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON marketplace_items;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view own eco transactions" ON eco_transactions;
DROP POLICY IF EXISTS "System can insert eco transactions" ON eco_transactions;
DROP POLICY IF EXISTS "Users can update own eco transactions" ON eco_transactions;
DROP POLICY IF EXISTS "Users can delete own eco transactions" ON eco_transactions;

-- 2. Désactiver RLS sur toutes les tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE repairer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE repairs DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE eco_transactions DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier que RLS est bien désactivé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as "RLS Activé",
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS Désactivé' 
        ELSE '❌ RLS Activé' 
    END as "Statut"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 
    'repairer_profiles', 
    'items', 
    'quotes', 
    'repairs', 
    'marketplace_items', 
    'subscriptions', 
    'eco_transactions'
)
ORDER BY tablename;
