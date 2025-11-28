'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Loader2, Plus, X, Store, Tag, TrendingUp, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface Recommendation {
  title: string;
  brand?: string;
  description: string;
  price_range: string;
  reasoning: string;
  where_to_buy: string;
  category: string;
  search_query?: string;
  image_keywords?: string;
  image_url?: string;
  amazon_link?: string;
  google_shopping_link?: string;
}

interface EnhancedAIRecommendationsProps {
  recipientId: string;
  recipientName: string;
  onGiftAdded?: () => void;
}

// Store logo colors for visual branding
const storeColors: Record<string, { bg: string; text: string; icon: string }> = {
  Amazon: { bg: 'bg-orange-50', text: 'text-orange-700', icon: '📦' },
  Target: { bg: 'bg-red-50', text: 'text-red-700', icon: '🎯' },
  'Best Buy': { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🔌' },
  Walmart: { bg: 'bg-blue-50', text: 'text-blue-600', icon: '🛒' },
  Etsy: { bg: 'bg-orange-50', text: 'text-orange-600', icon: '✨' },
  default: { bg: 'bg-gray-50', text: 'text-gray-700', icon: '🏪' },
};

export function EnhancedAIRecommendations({
  recipientId,
  recipientName,
  onGiftAdded,
}: EnhancedAIRecommendationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setRecommendations([]);
    setDismissedIds(new Set());
    setIsOpen(false);
  }, [recipientId]);

  const generateRecommendations = async () => {
    setIsOpen(true);
    setLoading(true);
    setRecommendations([]);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const addGiftToList = async (recommendation: Recommendation, index: number) => {
    setAddingIndex(index);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in to add gifts');
        return;
      }

      // Extract price from price_range
      const priceMatch = recommendation.price_range.match(/\$?(\d+(?:\.\d{2})?)/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : null;

      // Extract first store name
      const storeName = recommendation.where_to_buy.split(',')[0].trim();

      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .insert({
          user_id: user.id,
          name: recommendation.title,
          description: `${recommendation.description}\n\n💡 AI Reasoning: ${recommendation.reasoning}`,
          current_price: price,
          brand: recommendation.brand || null,
          store: storeName,
          category: recommendation.category,
          status: 'idea',
          image_url: recommendation.image_url || null,
          url: recommendation.amazon_link || recommendation.google_shopping_link || null,
          source: 'ai_recommendation',
          source_metadata: {
            ai_generated: true,
            ai_reasoning: recommendation.reasoning,
            search_query: recommendation.search_query,
          },
        })
        .select()
        .single();

      if (giftError) throw giftError;

      const { error: linkError } = await supabase
        .from('gift_recipients')
        .insert({
          gift_id: gift.id,
          recipient_id: recipientId,
        });

      if (linkError) throw linkError;

      // Record feedback
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: recipientId,
          recommendation_name: recommendation.title,
          recommendation_description: recommendation.description,
          feedback_type: 'added',
        }),
      }).catch(err => logger.error('Error recording feedback:', err));

      toast.success(`Added "${recommendation.title}" to ${recipientName}'s list`);

      if (onGiftAdded) {
        onGiftAdded();
      }
    } catch (error) {
      logger.error('Error adding gift:', error);
      toast.error('Failed to add gift');
    } finally {
      setAddingIndex(null);
    }
  };

  const dismissRecommendation = async (recommendation: Recommendation, index: number) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: recipientId,
          recommendation_name: recommendation.title,
          recommendation_description: recommendation.description,
          feedback_type: 'dismissed',
        }),
      });

      setDismissedIds(prev => new Set(prev).add(index));
      toast.success('Recommendation dismissed');
    } catch (error) {
      logger.error('Error dismissing recommendation:', error);
      toast.error('Failed to dismiss recommendation');
    }
  };

  const getStoreInfo = (storeName: string) => {
    const firstStore = storeName.split(',')[0].trim();
    return storeColors[firstStore] || storeColors.default;
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100"
        onClick={generateRecommendations}
      >
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span className="font-semibold text-purple-700">AI Recommend</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Smart Gift Recommendations for {recipientName}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Powered by AI with real-time trends and collaborative filtering
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
              <p className="text-base text-gray-600 text-center">
                Analyzing trending gifts, successful purchases, and {recipientName}'s profile...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a moment as we gather the perfect suggestions
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {recommendations.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  Click the button above to generate AI-powered gift suggestions
                </div>
              ) : (
                recommendations.map((rec, index) => {
                  if (dismissedIds.has(index)) return null;

                  const storeInfo = getStoreInfo(rec.where_to_buy);

                  return (
                    <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                      {/* Header with brand/category */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {rec.brand && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {rec.brand}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {rec.category}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-base leading-tight">
                            {rec.title}
                          </h4>
                        </div>
                      </div>

                      {/* Price & Store */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-green-100 text-green-800 font-bold">
                          {rec.price_range}
                        </Badge>
                        <Badge className={`${storeInfo.bg} ${storeInfo.text} flex items-center gap-1`}>
                          <span>{storeInfo.icon}</span>
                          <Store className="h-3 w-3" />
                          {rec.where_to_buy.split(',')[0]}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {rec.description}
                      </p>

                      {/* AI Reasoning */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Why this gift?
                        </p>
                        <p className="text-xs text-purple-800 leading-relaxed">
                          {rec.reasoning}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => addGiftToList(rec, index)}
                          disabled={addingIndex === index}
                          className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          size="sm"
                        >
                          {addingIndex === index ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Add to List
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => dismissRecommendation(rec, index)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {recommendations.length > 0 && !loading && (
            <div className="pt-4 border-t mt-4">
              <Button
                variant="outline"
                onClick={generateRecommendations}
                className="w-full gap-2 border-purple-200 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 text-purple-600" />
                Generate New Recommendations
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
