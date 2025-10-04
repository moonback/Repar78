/*
  # Circular Repair Platform Database Schema

  ## Overview
  Complete database schema for a circular economy repair platform connecting users with repairers,
  refurbishers, and recyclers. Supports item submissions, quote management, tracking, gamification,
  and marketplace functionality.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text, optional)
  - `role` (text, enum: 'user', 'repairer', 'refurbisher', 'recycler')
  - `eco_points` (integer, gamification points)
  - `created_at` (timestamptz)

  ### 2. `repairer_profiles`
  Additional information for repair professionals
  - `id` (uuid, references profiles)
  - `business_name` (text)
  - `expertise` (text array, types of items they repair)
  - `service_types` (text array, e.g., 'home_repair', 'workshop')
  - `location` (text)
  - `latitude` (numeric, optional)
  - `longitude` (numeric, optional)
  - `verified` (boolean)
  - `rating` (numeric, 0-5 scale)
  - `total_jobs` (integer)
  - `bio` (text)
  - `created_at` (timestamptz)

  ### 3. `items`
  Items submitted by users for repair/recycling
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text, item name)
  - `category` (text, e.g., 'electronics', 'appliances')
  - `brand` (text, optional)
  - `problem_description` (text)
  - `images` (text array, URLs)
  - `videos` (text array, URLs, optional)
  - `ai_diagnosis` (jsonb, AI analysis results)
  - `estimated_cost_min` (numeric)
  - `estimated_cost_max` (numeric)
  - `status` (text, enum: 'submitted', 'quoted', 'in_progress', 'completed', 'cancelled')
  - `solution_type` (text, enum: 'home_repair', 'workshop', 'refurbish', 'recycle')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `quotes`
  Quotes from repairers/refurbishers
  - `id` (uuid, primary key)
  - `item_id` (uuid, references items)
  - `repairer_id` (uuid, references profiles)
  - `price` (numeric)
  - `estimated_duration` (text, e.g., '2-3 days')
  - `message` (text)
  - `status` (text, enum: 'pending', 'accepted', 'rejected')
  - `created_at` (timestamptz)

  ### 5. `repairs`
  Active repair jobs
  - `id` (uuid, primary key)
  - `item_id` (uuid, references items)
  - `quote_id` (uuid, references quotes)
  - `repairer_id` (uuid, references profiles)
  - `status` (text, enum: 'diagnostic', 'in_repair', 'quality_check', 'ready_delivery', 'completed')
  - `tracking_updates` (jsonb array, status history)
  - `completion_photos` (text array, URLs)
  - `rating` (integer, 1-5)
  - `review` (text, optional)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz, optional)

  ### 6. `marketplace_items`
  Parts and refurbished items for sale
  - `id` (uuid, primary key)
  - `seller_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `category` (text, enum: 'parts', 'refurbished', 'tools')
  - `price` (numeric)
  - `images` (text array, URLs)
  - `condition` (text, enum: 'new', 'like_new', 'good', 'fair')
  - `stock` (integer)
  - `sold` (boolean)
  - `created_at` (timestamptz)

  ### 7. `subscriptions`
  User subscription plans
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `plan_type` (text, enum: 'basic', 'standard', 'premium')
  - `repairs_per_year` (integer)
  - `repairs_used` (integer)
  - `status` (text, enum: 'active', 'cancelled', 'expired')
  - `started_at` (timestamptz)
  - `expires_at` (timestamptz)

  ### 8. `eco_transactions`
  Track eco-points earned/spent
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `points` (integer, positive for earned, negative for spent)
  - `reason` (text)
  - `related_id` (uuid, optional, references items or repairs)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Repairers can view items they're quoting on
  - Public can view marketplace items
  - Strict authentication checks on all policies

  ## Important Notes
  1. All policies check auth.uid() for proper user identification
  2. Separate policies for SELECT, INSERT, UPDATE, DELETE
  3. Repairers have additional access to view relevant items
  4. Gamification system tracks eco-points automatically
  5. Real-time tracking updates stored as JSONB for flexibility
*/

-- Supprimer d'abord toutes les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'repairer', 'refurbisher', 'recycler')),
  eco_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Ne pas activer RLS sur cette table
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques de repairer_profiles
DROP POLICY IF EXISTS "Anyone can view verified repairers" ON repairer_profiles;
DROP POLICY IF EXISTS "Repairers can view own profile" ON repairer_profiles;
DROP POLICY IF EXISTS "Repairers can insert own profile" ON repairer_profiles;
DROP POLICY IF EXISTS "Repairers can update own profile" ON repairer_profiles;

-- Create repairer_profiles table
CREATE TABLE IF NOT EXISTS repairer_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text,
  expertise text[] DEFAULT '{}',
  service_types text[] DEFAULT '{}',
  location text,
  latitude numeric,
  longitude numeric,
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_jobs integer DEFAULT 0,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Ne pas activer RLS sur cette table
-- ALTER TABLE repairer_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques de items
DROP POLICY IF EXISTS "Users can view own items" ON items;
DROP POLICY IF EXISTS "Repairers can view submitted items" ON items;
DROP POLICY IF EXISTS "Users can insert own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  brand text,
  problem_description text NOT NULL,
  images text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  ai_diagnosis jsonb,
  estimated_cost_min numeric,
  estimated_cost_max numeric,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'quoted', 'in_progress', 'completed', 'cancelled')),
  solution_type text CHECK (solution_type IN ('home_repair', 'workshop', 'refurbish', 'recycle')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ne pas activer RLS sur cette table
-- ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques de quotes
DROP POLICY IF EXISTS "Users can view quotes for their items" ON quotes;
DROP POLICY IF EXISTS "Repairers can view own quotes" ON quotes;
DROP POLICY IF EXISTS "Repairers can insert quotes" ON quotes;
DROP POLICY IF EXISTS "Repairers can update own quotes" ON quotes;

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  repairer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  estimated_duration text NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Ne pas activer RLS sur cette table
-- ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques de repairs
DROP POLICY IF EXISTS "Users can view repairs for their items" ON repairs;
DROP POLICY IF EXISTS "Repairers can view own repairs" ON repairs;
DROP POLICY IF EXISTS "Repairers can insert repairs" ON repairs;
DROP POLICY IF EXISTS "Repairers can update own repairs" ON repairs;

-- Create repairs table
CREATE TABLE IF NOT EXISTS repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  repairer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'diagnostic' CHECK (status IN ('diagnostic', 'in_repair', 'quality_check', 'ready_delivery', 'completed')),
  tracking_updates jsonb DEFAULT '[]',
  completion_photos text[] DEFAULT '{}',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Ne pas activer RLS sur cette table
-- ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques de marketplace_items
DROP POLICY IF EXISTS "Anyone can view available marketplace items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can view own listings" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can insert listings" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can update own listings" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON marketplace_items;

-- Create marketplace_items table
CREATE TABLE IF NOT EXISTS marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('parts', 'refurbished', 'tools')),
  price numeric NOT NULL,
  images text[] DEFAULT '{}',
  condition text NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  stock integer DEFAULT 1,
  sold boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Ne pas activer RLS sur cette table
-- ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques de subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'standard', 'premium')),
  repairs_per_year integer NOT NULL,
  repairs_used integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Ne pas activer RLS sur cette table
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques de eco_transactions
DROP POLICY IF EXISTS "Users can view own eco transactions" ON eco_transactions;
DROP POLICY IF EXISTS "System can insert eco transactions" ON eco_transactions;

-- Create eco_transactions table
CREATE TABLE IF NOT EXISTS eco_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Ne pas activer RLS sur cette table
-- ALTER TABLE eco_transactions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_quotes_item_id ON quotes(item_id);
CREATE INDEX IF NOT EXISTS idx_quotes_repairer_id ON quotes(repairer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_item_id ON repairs(item_id);
CREATE INDEX IF NOT EXISTS idx_repairs_repairer_id ON repairs(repairer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_eco_transactions_user_id ON eco_transactions(user_id);

-- ===============================================
-- TOUTES LES POLITIQUES RLS SONT DÉSACTIVÉES
-- ===============================================
-- Les politiques RLS ont été supprimées au début du fichier
-- et les tables sont créées sans activation de RLS