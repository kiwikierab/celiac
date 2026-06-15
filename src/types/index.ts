// Domain types for the Celiac-Safe Cafes app
// When connecting to Supabase, these types should match the database schema

export type PlaceCategory = "cafe" | "restaurant" | "bakery" | "takeaway" | "other";
export type ModerationStatus = "visible" | "flagged" | "hidden";
export type ReportEntityType = "place" | "review" | "review_comment" | "photo";

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
  moderation_status?: ModerationStatus;
  distance_km?: number;
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
  moderation_status?: ModerationStatus;
  user_profile?: UserProfile | null;
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
  storage_path?: string;
  alt?: string;
  created_at: string;
  moderation_status?: ModerationStatus;
  user_name?: string;
  user_profile?: UserProfile | null;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  body: string;
  created_at: string;
  moderation_status?: ModerationStatus;
  user_profile?: UserProfile | null;
}

export interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  created_at: string;
  updated_at?: string;
  place_count?: number;
  review_count?: number;
  photo_count?: number;
}

export interface Report {
  id: string;
  reporter_id: string;
  entity_type: ReportEntityType;
  entity_id: string;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
}

export interface PlaceFilters {
  gluten_free_menu?: boolean;
  dedicated_fryer?: boolean;
  dedicated_kitchen?: boolean;
  staff_trained?: boolean;
  category?: PlaceCategory | "";
  min_safety_rating?: number;
  max_distance_km?: number;
}

// Auth types — swap these for Supabase User when connecting
export interface AppUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}
