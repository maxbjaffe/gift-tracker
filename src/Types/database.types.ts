// src/types/database.types.ts
// Generated types for Supabase database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipients: {
        Row: {
          id: string
          user_id: string
          name: string
          relationship: string | null
          birthday: string | null
          age_range: string | null
          gender: string | null
          avatar_url: string | null
          interests: string[] | null
          hobbies: string[] | null
          favorite_colors: string[] | null
          favorite_brands: string[] | null
          favorite_stores: string[] | null
          gift_preferences: string | null
          gift_dos: string[] | null
          gift_donts: string[] | null
          restrictions: string[] | null
          clothing_sizes: Json | null
          wishlist_items: Json | null
          past_gifts_received: Json | null
          items_already_owned: string[] | null
          max_budget: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          relationship?: string | null
          birthday?: string | null
          age_range?: string | null
          gender?: string | null
          avatar_url?: string | null
          interests?: string[] | null
          hobbies?: string[] | null
          favorite_colors?: string[] | null
          favorite_brands?: string[] | null
          favorite_stores?: string[] | null
          gift_preferences?: string | null
          gift_dos?: string[] | null
          gift_donts?: string[] | null
          restrictions?: string[] | null
          clothing_sizes?: Json | null
          wishlist_items?: Json | null
          past_gifts_received?: Json | null
          items_already_owned?: string[] | null
          max_budget?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          relationship?: string | null
          birthday?: string | null
          age_range?: string | null
          gender?: string | null
          avatar_url?: string | null
          interests?: string[] | null
          hobbies?: string[] | null
          favorite_colors?: string[] | null
          favorite_brands?: string[] | null
          favorite_stores?: string[] | null
          gift_preferences?: string | null
          gift_dos?: string[] | null
          gift_donts?: string[] | null
          restrictions?: string[] | null
          clothing_sizes?: Json | null
          wishlist_items?: Json | null
          past_gifts_received?: Json | null
          items_already_owned?: string[] | null
          max_budget?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: string | null
          url: string | null
          image_url: string | null
          store: string | null
          brand: string | null
          current_price: number | null
          original_price: number | null
          price_history: Json | null
          price_last_checked: string | null
          status: string
          priority: string | null
          purchase_date: string | null
          occasion: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category?: string | null
          url?: string | null
          image_url?: string | null
          store?: string | null
          brand?: string | null
          current_price?: number | null
          original_price?: number | null
          price_history?: Json | null
          price_last_checked?: string | null
          status?: string
          priority?: string | null
          purchase_date?: string | null
          occasion?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: string | null
          url?: string | null
          image_url?: string | null
          store?: string | null
          brand?: string | null
          current_price?: number | null
          original_price?: number | null
          price_history?: Json | null
          price_last_checked?: string | null
          status?: string
          priority?: string | null
          purchase_date?: string | null
          occasion?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gift_recipients: {
        Row: {
          id: string
          gift_id: string
          recipient_id: string
          status: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          gift_id: string
          recipient_id: string
          status?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          gift_id?: string
          recipient_id?: string
          status?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      recommendation_feedback: {
        Row: {
          id: string
          recipient_id: string
          recommendation_name: string
          recommendation_description: string | null
          recommendation_data: Json | null
          feedback_type: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          recommendation_name: string
          recommendation_description?: string | null
          recommendation_data?: Json | null
          feedback_type: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          recommendation_name?: string
          recommendation_description?: string | null
          recommendation_data?: Json | null
          feedback_type?: string
          reason?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Recipient = Database['public']['Tables']['recipients']['Row']
export type RecipientInsert = Database['public']['Tables']['recipients']['Insert']
export type RecipientUpdate = Database['public']['Tables']['recipients']['Update']

export type Gift = Database['public']['Tables']['gifts']['Row']
export type GiftInsert = Database['public']['Tables']['gifts']['Insert']
export type GiftUpdate = Database['public']['Tables']['gifts']['Update']

export type GiftRecipient = Database['public']['Tables']['gift_recipients']['Row']
export type GiftRecipientInsert = Database['public']['Tables']['gift_recipients']['Insert']
export type GiftRecipientUpdate = Database['public']['Tables']['gift_recipients']['Update']

export type RecommendationFeedback = Database['public']['Tables']['recommendation_feedback']['Row']
export type RecommendationFeedbackInsert = Database['public']['Tables']['recommendation_feedback']['Insert']
export type RecommendationFeedbackUpdate = Database['public']['Tables']['recommendation_feedback']['Update']

// Extended types for UI usage
export type RecipientWithGifts = Recipient & {
  gifts?: Gift[]
  gift_count?: number
}

export type GiftWithRecipients = Gift & {
  recipients?: Recipient[]
  recipient_count?: number
}

// Form types
export type RecipientFormData = {
  name: string
  relationship: string
  birthday?: string
  age_range?: string
  gender?: string
  interests?: string[]
  hobbies?: string[]
  favorite_colors?: string[]
  favorite_brands?: string[]
  favorite_stores?: string[]
  gift_preferences?: string
  gift_dos?: string[]
  gift_donts?: string[]
  restrictions?: string[]
  max_budget?: number
  notes?: string
}

export type GiftFormData = {
  name: string
  description?: string
  category?: string
  url?: string
  store?: string
  brand?: string
  current_price?: number
  status: 'idea' | 'researching' | 'purchased' | 'wrapped' | 'given'
  priority?: 'low' | 'medium' | 'high'
  occasion?: string
  notes?: string
  recipient_ids?: string[]
}

// Constants
export const GIFT_STATUSES = ['idea', 'researching', 'purchased', 'wrapped', 'given'] as const
export const GIFT_PRIORITIES = ['low', 'medium', 'high'] as const
export const RELATIONSHIPS = [
  'Parent',
  'Child',
  'Sibling',
  'Spouse',
  'Partner',
  'Grandparent',
  'Grandchild',
  'Friend',
  'Colleague',
  'Other'
] as const
export const AGE_RANGES = [
  '0-12',
  '13-17',
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+'
] as const