// Recommendation Analytics Service
// Provides intelligent context for AI recommendations based on user feedback and trends

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface TrendingGift {
  gift_name: string;
  gift_category: string | null;
  gift_brand: string | null;
  gift_store: string | null;
  add_count: number;
  purchase_count: number;
  avg_price: number | null;
  relevance_score: number;
}

export interface SuccessfulGift {
  gift_name: string;
  gift_description: string | null;
  gift_category: string | null;
  gift_brand: string | null;
  gift_store: string | null;
  current_price: number | null;
  success_count: number;
}

export interface DismissedRecommendation {
  recommendation_name: string;
  dismissed_at: Date;
}

export interface RecommendationContext {
  trendingGifts: TrendingGift[];
  successfulGiftsForSimilar: SuccessfulGift[];
  dismissedRecommendations: DismissedRecommendation[];
  popularBrands: string[];
  popularStores: string[];
}

export class RecommendationAnalyticsService {
  /**
   * Get comprehensive context for AI recommendations
   */
  async getRecommendationContext(
    recipientId: string,
    ageRange?: string | null,
    interests?: string | null,
    relationship?: string | null,
    occasion?: string | null
  ): Promise<RecommendationContext> {
    const supabase = await createServerSupabaseClient();

    // Run queries in parallel for performance
    const [trending, successful, dismissed] = await Promise.all([
      this.getTrendingGifts(ageRange, relationship, occasion),
      this.getSuccessfulGiftsForSimilar(ageRange, interests, relationship),
      this.getDismissedRecommendations(recipientId),
    ]);

    // Extract popular brands and stores from trending
    const popularBrands = this.extractPopularBrands(trending);
    const popularStores = this.extractPopularStores(trending);

    return {
      trendingGifts: trending,
      successfulGiftsForSimilar: successful,
      dismissedRecommendations: dismissed,
      popularBrands,
      popularStores,
    };
  }

  /**
   * Get trending gifts based on recipient profile
   */
  private async getTrendingGifts(
    ageRange?: string | null,
    relationship?: string | null,
    occasion?: string | null
  ): Promise<TrendingGift[]> {
    const supabase = await createServerSupabaseClient();

    try {
      const { data, error } = await supabase.rpc('get_trending_gifts_for_profile', {
        p_age_range: ageRange || null,
        p_relationship: relationship || null,
        p_occasion: occasion || null,
        p_limit: 15,
      });

      if (error) {
        console.error('Error fetching trending gifts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching trending gifts:', error);
      return [];
    }
  }

  /**
   * Get gifts that worked well for similar recipients
   */
  private async getSuccessfulGiftsForSimilar(
    ageRange?: string | null,
    interests?: string | null,
    relationship?: string | null
  ): Promise<SuccessfulGift[]> {
    const supabase = await createServerSupabaseClient();

    try {
      const { data, error } = await supabase.rpc('get_successful_gifts_for_similar_recipients', {
        p_age_range: ageRange || '',
        p_interests: interests || '',
        p_relationship: relationship || '',
        p_limit: 15,
      });

      if (error) {
        console.error('Error fetching successful gifts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching successful gifts:', error);
      return [];
    }
  }

  /**
   * Get recently dismissed recommendations to avoid re-suggesting
   */
  private async getDismissedRecommendations(
    recipientId: string
  ): Promise<DismissedRecommendation[]> {
    const supabase = await createServerSupabaseClient();

    try {
      const { data, error } = await supabase.rpc('get_dismissed_recommendations', {
        p_recipient_id: recipientId,
      });

      if (error) {
        console.error('Error fetching dismissed recommendations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching dismissed recommendations:', error);
      return [];
    }
  }

  /**
   * Extract top brands from trending gifts
   */
  private extractPopularBrands(trending: TrendingGift[]): string[] {
    const brandCounts = new Map<string, number>();

    for (const gift of trending) {
      if (gift.gift_brand) {
        const count = brandCounts.get(gift.gift_brand) || 0;
        brandCounts.set(gift.gift_brand, count + gift.add_count);
      }
    }

    return Array.from(brandCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([brand]) => brand);
  }

  /**
   * Extract top stores from trending gifts
   */
  private extractPopularStores(trending: TrendingGift[]): string[] {
    const storeCounts = new Map<string, number>();

    for (const gift of trending) {
      if (gift.gift_store) {
        const count = storeCounts.get(gift.gift_store) || 0;
        storeCounts.set(gift.gift_store, count + gift.add_count);
      }
    }

    return Array.from(storeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([store]) => store);
  }

  /**
   * Record feedback for a recommendation
   */
  async recordFeedback(
    userId: string,
    recipientId: string,
    recommendation: {
      name: string;
      description?: string;
      category?: string;
      price?: number;
      store?: string;
      brand?: string;
    },
    feedbackType: 'added' | 'dismissed' | 'purchased' | 'viewed',
    recipientContext?: {
      ageRange?: string;
      interests?: string;
      relationship?: string;
      occasion?: string;
    },
    sessionId?: string
  ): Promise<void> {
    const supabase = await createServerSupabaseClient();

    try {
      const { error } = await supabase.from('recommendation_feedback').insert({
        user_id: userId,
        recipient_id: recipientId,
        recommendation_name: recommendation.name,
        recommendation_description: recommendation.description || null,
        recommendation_category: recommendation.category || null,
        recommendation_price: recommendation.price || null,
        recommendation_store: recommendation.store || null,
        recommendation_brand: recommendation.brand || null,
        feedback_type: feedbackType,
        recipient_age_range: recipientContext?.ageRange || null,
        recipient_interests: recipientContext?.interests || null,
        recipient_relationship: recipientContext?.relationship || null,
        occasion: recipientContext?.occasion || null,
        session_id: sessionId || null,
      });

      if (error) {
        console.error('Error recording feedback:', error);
        throw error;
      }

      // Update trending gifts asynchronously (don't wait)
      this.updateTrendingGifts().catch(err =>
        console.error('Error updating trending gifts:', err)
      );
    } catch (error) {
      console.error('Exception recording feedback:', error);
      throw error;
    }
  }

  /**
   * Update trending gifts table (run periodically or after feedback)
   */
  private async updateTrendingGifts(): Promise<void> {
    const supabase = await createServerSupabaseClient();

    try {
      const { error } = await supabase.rpc('update_trending_gifts');

      if (error) {
        console.error('Error updating trending gifts:', error);
      }
    } catch (error) {
      console.error('Exception updating trending gifts:', error);
    }
  }

  /**
   * Get feedback statistics for dashboard/analytics
   */
  async getFeedbackStats(userId: string): Promise<{
    totalRecommendations: number;
    addedCount: number;
    dismissedCount: number;
    purchasedCount: number;
    conversionRate: number;
  }> {
    const supabase = await createServerSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('recommendation_feedback')
        .select('feedback_type')
        .eq('user_id', userId);

      if (error) throw error;

      const totalRecommendations = data?.length || 0;
      const addedCount = data?.filter(f => f.feedback_type === 'added').length || 0;
      const dismissedCount = data?.filter(f => f.feedback_type === 'dismissed').length || 0;
      const purchasedCount = data?.filter(f => f.feedback_type === 'purchased').length || 0;

      const conversionRate = totalRecommendations > 0
        ? (addedCount / totalRecommendations) * 100
        : 0;

      return {
        totalRecommendations,
        addedCount,
        dismissedCount,
        purchasedCount,
        conversionRate,
      };
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return {
        totalRecommendations: 0,
        addedCount: 0,
        dismissedCount: 0,
        purchasedCount: 0,
        conversionRate: 0,
      };
    }
  }
}

export const recommendationAnalyticsService = new RecommendationAnalyticsService();
