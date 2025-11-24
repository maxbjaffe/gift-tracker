'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Package, DollarSign, Tag, Calendar, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type StatusType = 'idea' | 'considering' | 'purchased' | 'wrapped' | 'given';

interface Gift {
  id: string;
  name: string;
  description?: string;
  current_price?: number;
  category?: string;
  url?: string;
  image_url?: string;
  status?: string;
  source?: string;
  created_at?: string;
  source_metadata?: {
    screenshot?: string;
    original_sms?: string;
    media_urls?: string[];
    stored_image_urls?: string[];
    analyzed_with_vision?: boolean;
  };
  recipients?: Array<{
    id: string;
    name: string;
  }>;
}

interface GiftDetailsDialogProps {
  gift: Gift | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (giftId: string, newStatus: StatusType) => void;
}

export function GiftDetailsDialog({ gift, isOpen, onClose, onStatusUpdate }: GiftDetailsDialogProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!gift) return null;

  const handleStatusChange = async (newStatus: StatusType) => {
    if (!gift) return;

    setUpdatingStatus(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('gifts')
        .update({ status: newStatus })
        .eq('id', gift.id);

      if (error) {
        toast.error('Failed to update status');
        return;
      }

      toast.success('Status updated');
      if (onStatusUpdate) {
        onStatusUpdate(gift.id, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea':
        return 'bg-blue-100 text-blue-700';
      case 'considering':
        return 'bg-yellow-100 text-yellow-700';
      case 'purchased':
        return 'bg-green-100 text-green-700';
      case 'wrapped':
        return 'bg-purple-100 text-purple-700';
      case 'given':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const displayImage = gift.source_metadata?.screenshot || gift.image_url;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{gift.name}</DialogTitle>
          <DialogDescription>
            {gift.recipients && gift.recipients.length > 0 && (
              <span className="text-sm text-gray-600">
                For: {gift.recipients.map((r) => r.name).join(', ')}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {displayImage && (
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={displayImage}
                alt={gift.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain"
              />
            </div>
          )}

          {/* Price and Category */}
          <div className="flex items-center gap-4 flex-wrap">
            {gift.current_price && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  ${gift.current_price.toFixed(2)}
                </span>
              </div>
            )}
            {gift.category && (
              <Badge variant="outline" className="text-sm">
                <Tag className="h-3 w-3 mr-1" />
                {gift.category}
              </Badge>
            )}
            {gift.status && (
              <Badge className={getStatusColor(gift.status)}>
                {gift.status}
              </Badge>
            )}
          </div>

          {/* Description */}
          {gift.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{gift.description}</p>
            </div>
          )}

          {/* Product Link */}
          {gift.url && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Where to Buy</h3>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light"
              >
                <a href={gift.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Product
                </a>
              </Button>
            </div>
          )}

          {/* Source Info */}
          {gift.source && gift.source !== 'manual' && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {gift.source === 'extension' && (
                <>
                  <Package className="h-4 w-4" />
                  <span>Saved from Chrome Extension</span>
                </>
              )}
              {gift.source === 'sms' && (
                <>
                  <MessageSquare className="h-4 w-4" />
                  <span>Saved via SMS</span>
                </>
              )}
              {gift.source_metadata?.analyzed_with_vision && (
                <Badge variant="secondary" className="text-xs">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  AI Analyzed
                </Badge>
              )}
            </div>
          )}

          {/* Original SMS Message */}
          {gift.source_metadata?.original_sms && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Original Message</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "{gift.source_metadata.original_sms}"
                </p>
              </div>
            </div>
          )}

          {/* Additional Images */}
          {gift.source_metadata?.stored_image_urls && gift.source_metadata.stored_image_urls.length > 1 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Additional Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {gift.source_metadata.stored_image_urls.slice(1).map((url, index) => (
                  <div key={index} className="relative w-full h-24">
                    <Image
                      src={url}
                      alt={`${gift.name} - Image ${index + 2}`}
                      fill
                      sizes="(max-width: 768px) 33vw, 150px"
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
            <div className="flex gap-2 flex-wrap">
              {(['idea', 'considering', 'purchased', 'wrapped', 'given'] as StatusType[]).map((status) => (
                <Button
                  key={status}
                  variant={gift.status === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  disabled={updatingStatus}
                  className={
                    gift.status === status
                      ? getStatusColor(status) + ' border-none'
                      : ''
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Created Date */}
          {gift.created_at && (
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t">
              <Calendar className="h-3 w-3" />
              <span>
                Added {new Date(gift.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
