import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'repairer' | 'refurbisher' | 'recycler';
  eco_points: number;
  created_at: string;
};

export type Item = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  brand?: string;
  problem_description: string;
  images: string[];
  videos: string[];
  ai_diagnosis?: any;
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  status: 'submitted' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
  solution_type?: 'home_repair' | 'workshop' | 'refurbish' | 'recycle';
  created_at: string;
  updated_at: string;
};

export type Quote = {
  id: string;
  item_id: string;
  repairer_id: string;
  price: number;
  estimated_duration: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

export type Repair = {
  id: string;
  item_id: string;
  quote_id: string;
  repairer_id: string;
  status: 'diagnostic' | 'in_repair' | 'quality_check' | 'ready_delivery' | 'completed';
  tracking_updates: any[];
  completion_photos: string[];
  rating?: number;
  review?: string;
  started_at: string;
  completed_at?: string;
};

export type MarketplaceItem = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: 'parts' | 'refurbished' | 'tools';
  price: number;
  images: string[];
  condition: 'new' | 'like_new' | 'good' | 'fair';
  stock: number;
  sold: boolean;
  created_at: string;
};

export type RepairerProfile = {
  id: string;
  business_name?: string;
  expertise: string[];
  service_types: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  rating: number;
  total_jobs: number;
  bio?: string;
  created_at: string;
};
