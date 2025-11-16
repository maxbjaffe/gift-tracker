'use client';

import { useState } from 'react';
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
import { Sparkles, Loader2, Plus, DollarSign } from 'lucide-react';
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
            <div className="space-y-4 mt-4">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Click the button above to generate AI suggestions
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{suggestion.name}</h4>
                          <Badge className="flex items-center gap-1 bg-green-100 text-green-700">
                            <DollarSign className="h-3 w-3" />
                            {suggestion.price.toFixed(2)}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          {suggestion.description}
                        </p>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-purple-900 mb-1">
                            Why this gift?
                          </p>
                          <p className="text-sm text-purple-800">
                            {suggestion.reasoning}
                          </p>
                        </div>

                        <Button
                          onClick={() => addGiftToList(suggestion, index)}
                          disabled={addingGiftId === index}
                          className="gap-2"
                          size="sm"
                        >
                          {addingGiftId === index ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Add to Gift List
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
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
