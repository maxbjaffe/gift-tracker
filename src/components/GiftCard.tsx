'use client';

import { useState } from 'react';
import { Heart, ShoppingCart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GiftCardProps {
  gift: {
    name: string;
    description: string;
    price_range: string;
    price_min?: number;
    price_max?: number;
    category: string;
    age_range?: string;
    occasion?: string;
    image_url?: string;
    image_thumb?: string;
    amazon_link?: string;
    google_shopping_link?: string;
    trending?: boolean;
  };
  recipients?: Array<{ id: string; name: string }>;
  onSave?: (giftData: any, recipientIds: string[]) => Promise<void>;
}

export default function GiftCard({ gift, recipients = [], onSave }: GiftCardProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!onSave || selectedRecipients.length === 0) return;

    setSaving(true);
    try {
      await onSave(gift, selectedRecipients);
      setSaved(true);
      setTimeout(() => {
        setShowSaveDialog(false);
        setSaved(false);
        setSelectedRecipients([]);
      }, 1500);
    } catch (error) {
      console.error('Error saving gift:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <>
      <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {gift.image_url ? (
            <img
              src={gift.image_thumb || gift.image_url}
              alt={gift.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="h-16 w-16" />
            </div>
          )}

          {/* Trending Badge */}
          {gift.trending && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              🔥 Trending
            </div>
          )}

          {/* Quick Actions Overlay - Always visible on mobile, hover on desktop */}
          <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="bg-white hover:bg-gray-100 h-11 min-w-[44px]"
              aria-label="Save gift to your list"
            >
              <Heart className="h-4 w-4 md:mr-1" aria-hidden="true" />
              <span className="hidden md:inline">Save</span>
            </Button>
            {gift.amazon_link && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(gift.amazon_link, '_blank')}
                className="bg-white hover:bg-gray-100 h-11 w-11"
                aria-label="View product on Amazon"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-purple-600">{gift.price_range}</span>
            {gift.category && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                {gift.category}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {gift.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {gift.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {gift.age_range && (
              <span className="flex items-center">
                👤 {gift.age_range}
              </span>
            )}
            {gift.occasion && (
              <span className="flex items-center">
                🎉 {gift.occasion}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Save to Recipients Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Gift Idea</DialogTitle>
            <DialogDescription>
              Choose which recipients this gift is perfect for
            </DialogDescription>
          </DialogHeader>

          {recipients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No recipients yet!</p>
              <Button onClick={() => window.location.href = '/recipients/new'}>
                Create Your First Recipient
              </Button>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {recipients.map(recipient => (
                  <button
                    key={recipient.id}
                    onClick={() => toggleRecipient(recipient.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedRecipients.includes(recipient.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedRecipients.includes(recipient.id)
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedRecipients.includes(recipient.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">{recipient.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={selectedRecipients.length === 0 || saving || saved}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {saved ? '✓ Saved!' : saving ? 'Saving...' : `Save to ${selectedRecipients.length} Recipient${selectedRecipients.length !== 1 ? 's' : ''}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
