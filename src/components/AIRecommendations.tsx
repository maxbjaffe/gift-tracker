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
import { Sparkles, Loader2, Plus, DollarSign, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Suggestion {
  name: string;
  description: string;
  price: number;
  reasoning: string;
}

interface AIRecommendationsProps {
  recipientId: string;
  recipientName: string;
  onGiftAdded?: () => void;
}

export function AIRecommendations({
  recipientId,
  recipientName,
  onGiftAdded,
}: AIRecommendationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [addingGiftId, setAddingGiftId] = useState<number | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  // Clear suggestions when recipient changes
  useEffect(() => {
    setSuggestions([]);
    setDismissedIds(new Set());
    setIsOpen(false);
  }, [recipientId]);

  const generateSuggestions = async () => {
    setIsOpen(true);
    setLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const addGiftToList = async (suggestion: Suggestion, index: number) => {
    setAddingGiftId(index);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in to add gifts');
        return;
      }

      // Create the gift
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .insert({
          user_id: user.id,
          name: suggestion.name,
          description: `${suggestion.description}\n\nAI Reasoning: ${suggestion.reasoning}`,
          current_price: suggestion.price,
          status: 'idea',
          source: 'manual',
          source_metadata: {
            ai_generated: true,
            ai_reasoning: suggestion.reasoning,
          },
        })
        .select()
        .single();

      if (giftError) throw giftError;

      // Link to recipient
      const { error: linkError } = await supabase
        .from('gift_recipients')
        .insert({
          gift_id: gift.id,
          recipient_id: recipientId,
        });

      if (linkError) throw linkError;

      toast.success(`Added "${suggestion.name}" to ${recipientName}'s list`);

      if (onGiftAdded) {
        onGiftAdded();
      }
    } catch (error) {
      console.error('Error adding gift:', error);
      toast.error('Failed to add gift');
    } finally {
      setAddingGiftId(null);
    }
  };

  const dismissSuggestion = async (suggestion: Suggestion, index: number) => {
    try {
      // Record the dismissal feedback
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: recipientId,
          recommendation_name: suggestion.name,
          recommendation_description: suggestion.description,
          feedback_type: 'dismissed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record feedback');
      }

      // Add to dismissed set to hide from UI
      setDismissedIds((prev) => new Set(prev).add(index));
      toast.success('Suggestion dismissed');
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
      toast.error('Failed to dismiss suggestion');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={generateSuggestions}
      >
        <Sparkles className="h-4 w-4" />
        AI Suggest
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Gift Suggestions for {recipientName}
            </DialogTitle>
            <DialogDescription>
              Personalized gift ideas powered by Claude AI
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
              <p className="text-sm text-gray-600">
                Analyzing {recipientName}'s interests and generating personalized suggestions...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {(!suggestions || suggestions.length === 0) ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Click the button above to generate AI suggestions
                </div>
              ) : (
                (suggestions || []).map((suggestion, originalIndex) => {
                  if (dismissedIds.has(originalIndex)) return null;
                  return (
                  <Card key={originalIndex} className="p-3 flex flex-col h-full">
                    {/* Title & Price */}
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="font-semibold text-sm line-clamp-2 flex-1">{suggestion.name}</h4>
                      <Badge className="flex items-center gap-1 bg-green-100 text-green-700 shrink-0 text-xs">
                        <DollarSign className="h-3 w-3" />
                        {suggestion.price.toFixed(2)}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                      {suggestion.description}
                    </p>

                    {/* AI Reasoning - Collapsible */}
                    <details className="mb-3 text-xs">
                      <summary className="cursor-pointer text-purple-600 font-medium hover:text-purple-700">
                        💡 Why this gift?
                      </summary>
                      <p className="mt-2 text-gray-600 italic pl-4 text-xs">
                        {suggestion.reasoning}
                      </p>
                    </details>

                    {/* Actions - Push to bottom */}
                    <div className="mt-auto flex gap-2">
                      <Button
                        onClick={() => addGiftToList(suggestion, originalIndex)}
                        disabled={addingGiftId === originalIndex}
                        className="gap-1 flex-1 h-9 text-xs"
                        size="sm"
                      >
                        {addingGiftId === originalIndex ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            Add
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => dismissSuggestion(suggestion, originalIndex)}
                        variant="outline"
                        className="gap-1 h-9 px-3 text-xs"
                        size="sm"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                  );
                })
              )}
            </div>
          )}

          {suggestions.length > 0 && !loading && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={generateSuggestions}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate New Suggestions
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
