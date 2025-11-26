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
          max_purchased_budget: number | null
          notes: string | null
          share_token: string | null
          share_privacy: string | null
          share_enabled: boolean | null
          share_expires_at: string | null
          share_view_count: number | null
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
          max_purchased_budget?: number | null
          notes?: string | null
          share_token?: string | null
          share_privacy?: string | null
          share_enabled?: boolean | null
          share_expires_at?: string | null
          share_view_count?: number | null
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
          max_purchased_budget?: number | null
          notes?: string | null
          share_token?: string | null
          share_privacy?: string | null
          share_enabled?: boolean | null
          share_expires_at?: string | null
          share_view_count?: number | null
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
          occasion_date: string | null
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
          occasion_date?: string | null
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
          occasion_date?: string | null
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
          occasion: string | null
          occasion_date: string | null
          claimed_by_name: string | null
          claimed_by_email: string | null
          claimed_at: string | null
          claim_expires_at: string | null
          claim_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          gift_id: string
          recipient_id: string
          status?: string | null
          notes?: string | null
          occasion?: string | null
          occasion_date?: string | null
          claimed_by_name?: string | null
          claimed_by_email?: string | null
          claimed_at?: string | null
          claim_expires_at?: string | null
          claim_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          gift_id?: string
          recipient_id?: string
          status?: string | null
          notes?: string | null
          occasion?: string | null
          occasion_date?: string | null
          claimed_by_name?: string | null
          claimed_by_email?: string | null
          claimed_at?: string | null
          claim_expires_at?: string | null
          claim_notes?: string | null
          created_at?: string
        }
      }
      recipient_budgets: {
        Row: {
          id: string
          user_id: string
          recipient_id: string
          name: string
          max_budget: number
          start_date: string | null
          end_date: string | null
          occasion_type: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipient_id: string
          name: string
          max_budget?: number
          start_date?: string | null
          end_date?: string | null
          occasion_type?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipient_id?: string
          name?: string
          max_budget?: number
          start_date?: string | null
          end_date?: string | null
          occasion_type?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
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
      share_views: {
        Row: {
          id: string
          recipient_id: string
          visitor_fingerprint: string | null
          viewed_at: string
          referrer: string | null
          user_agent: string | null
          country_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          visitor_fingerprint?: string | null
          viewed_at?: string
          referrer?: string | null
          user_agent?: string | null
          country_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          visitor_fingerprint?: string | null
          viewed_at?: string
          referrer?: string | null
          user_agent?: string | null
          country_code?: string | null
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

export type RecipientBudget = Database['public']['Tables']['recipient_budgets']['Row']
export type RecipientBudgetInsert = Database['public']['Tables']['recipient_budgets']['Insert']
export type RecipientBudgetUpdate = Database['public']['Tables']['recipient_budgets']['Update']

// Extended types for UI usage
export type RecipientWithGifts = Recipient & {
  gifts?: Gift[]
  gift_count?: number
}

export type RecipientWithStatus = Recipient & {
  status?: string | null // Status from gift_recipients junction table
  gift_recipient_id?: string // ID of the gift_recipients record
  notes?: string | null // Notes from gift_recipients junction table
  occasion?: string | null // Occasion from gift_recipients junction table
  occasion_date?: string | null // Occasion date from gift_recipients junction table
  claimed_by_name?: string | null // Name of person who claimed this gift
  claimed_by_email?: string | null // Email of person who claimed this gift
  claimed_at?: string | null // When the gift was claimed
}

export type GiftWithRecipients = Gift & {
  recipients?: RecipientWithStatus[]
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
  max_purchased_budget?: number
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
  status: 'idea' | 'purchased' | 'wrapped' | 'delivered'
  priority?: 'low' | 'medium' | 'high'
  occasion?: string
  notes?: string
  recipient_ids?: string[]
}

// Constants
export const GIFT_STATUSES = ['idea', 'purchased', 'wrapped', 'delivered'] as const
export const GIFT_PRIORITIES = ['low', 'medium', 'high'] as const
export const GIFT_CATEGORIES = [
  'Books & Media',
  'Clothing & Accessories',
  'Electronics & Tech',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Toys & Games',
  'Food & Beverages',
  'Jewelry & Watches',
  'Arts & Crafts',
  'Health & Wellness',
  'Pets',
  'Office & School Supplies',
  'Baby & Kids',
  'Automotive',
  'Garden & Outdoor',
  'Musical Instruments',
  'Experiences & Events',
  'Gift Cards',
  'Other'
] as const
export const OCCASION_TYPES = [
  'birthday',
  'christmas',
  'hanukkah',
  'anniversary',
  'wedding',
  'graduation',
  'baby_shower',
  'holiday',
  'valentines',
  'mothers_day',
  'fathers_day',
  'just_because',
  'other'
] as const
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
  '0-2',
  '3-5',
  '6-9',
  '10-12',
  '13-17',
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+'
] as const