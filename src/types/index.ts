// Domain types for the Celiac-Safe Cafes app
// When connecting to Supabase, these types should match the database schema

export type PlaceCategory = "cafe" | "restaurant" | "bakery" | "takeaway" | "other";

export interface Place {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  website?: string;
  phone?: string;
  description?: string;
  submitted_by?: string; // user id
  created_at: string; // ISO date string

  // Celiac safety fields
  gluten_free_menu: boolean;
  dedicated_fryer: boolean;
  dedicated_kitchen: boolean;
  staff_trained: boolean;
  cross_contact_notes?: string;

  // Aggregated from reviews (computed)
  avg_overall_rating?: number;
  avg_safety_rating?: number;
  avg_taste_rating?: number;
  review_count?: number;
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  user_name: string; // denormalized for display
  overall_rating: number; // 1-5
  safety_rating: number; // 1-5
  taste_rating: number; // 1-5
  notes?: string;
  // Celiac-specific observations
  staff_knowledgeable: boolean;
  cross_contact_mentioned: boolean;
  would_return: boolean;
  created_at: string; // ISO date string
}

export interface MenuItem {
  id: string;
  place_id: string;
  name: string;
  description?: string;
  is_gluten_free: boolean;
  is_dedicated_gf: boolean; // prepared in dedicated GF area
  price?: string;
  notes?: string;
}

export interface Photo {
  id: string;
  place_id: string;
  user_id: string;
  url: string;
  alt?: string;
  created_at: string;
}

export interface PlaceFilters {
  gluten_free_menu?: boolean;
  dedicated_fryer?: boolean;
  dedicated_kitchen?: boolean;
  staff_trained?: boolean;
  category?: PlaceCategory | "";
  min_safety_rating?: number;
}

// Auth types — swap these for Supabase User when connecting
export interface AppUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}
