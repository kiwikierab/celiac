export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      places: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          country: string;
          lat: number | null;
          lng: number | null;
          category: string;
          website: string | null;
          phone: string | null;
          description: string | null;
          submitted_by: string | null;
          gluten_free_menu: boolean;
          dedicated_fryer: boolean;
          dedicated_kitchen: boolean;
          staff_trained: boolean;
          cross_contact_notes: string | null;
          moderation_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          country?: string;
          lat?: number | null;
          lng?: number | null;
          category?: string;
          website?: string | null;
          phone?: string | null;
          description?: string | null;
          submitted_by?: string | null;
          gluten_free_menu?: boolean;
          dedicated_fryer?: boolean;
          dedicated_kitchen?: boolean;
          staff_trained?: boolean;
          cross_contact_notes?: string | null;
          moderation_status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["places"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["profiles"]["Insert"], "id">>;
      };
      reviews: {
        Row: {
          id: string;
          place_id: string;
          user_id: string;
          overall_rating: number;
          safety_rating: number;
          taste_rating: number;
          notes: string | null;
          staff_knowledgeable: boolean;
          cross_contact_mentioned: boolean;
          would_return: boolean;
          moderation_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          user_id: string;
          overall_rating: number;
          safety_rating: number;
          taste_rating: number;
          notes?: string | null;
          staff_knowledgeable?: boolean;
          cross_contact_mentioned?: boolean;
          would_return?: boolean;
          moderation_status?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["reviews"]["Insert"], "place_id" | "user_id">>;
      };
      menu_items: {
        Row: {
          id: string;
          place_id: string;
          name: string;
          description: string | null;
          is_gluten_free: boolean;
          is_dedicated_gf: boolean;
          price: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          name: string;
          description?: string | null;
          is_gluten_free?: boolean;
          is_dedicated_gf?: boolean;
          price?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["menu_items"]["Insert"], "place_id">>;
      };
      photos: {
        Row: {
          id: string;
          place_id: string;
          user_id: string;
          storage_path: string;
          url: string;
          alt: string | null;
          moderation_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          user_id: string;
          storage_path: string;
          url: string;
          alt?: string | null;
          moderation_status?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["photos"]["Insert"], "place_id" | "user_id" | "storage_path">>;
      };
      review_comments: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          body: string;
          moderation_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          body: string;
          moderation_status?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["review_comments"]["Insert"], "review_id" | "user_id">>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          entity_type: string;
          entity_id: string;
          reason: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          entity_type: string;
          entity_id: string;
          reason: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["reports"]["Insert"], "reporter_id" | "entity_type" | "entity_id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
