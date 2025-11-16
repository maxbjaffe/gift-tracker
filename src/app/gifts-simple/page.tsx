'use client';

import { useState, useMemo } from 'react';
import { useRecipients } from '@/lib/hooks/useRecipients';
import { useGifts } from '@/lib/hooks/useGifts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Search, ChevronDown, ExternalLink, User, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Avatar from '@/components/Avatar';

type StatusType = 'idea' | 'considering' | 'purchased' | 'wrapped' | 'given';

export default function SimpleGiftsPage() {
  const { recipients, loading: recipientsLoading } = useRecipients();
  const { gifts, loading: giftsLoading, refetch } = useGifts();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StatusType>('all');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const loading = recipientsLoading || giftsLoading;

  // Group gifts by recipient
  const giftsByRecipient = useMemo(() => {
    const grouped: Record<string, typeof gifts> = {};

    // Initialize with all recipients
    recipients.forEach((recipient) => {
      grouped[recipient.id] = [];
    });

    // Group gifts
    gifts.forEach((gift) => {
      if (gift.recipients && gift.recipients.length > 0) {
        gift.recipients.forEach((recipient) => {
          if (!grouped[recipient.id]) {
            grouped[recipient.id] = [];
          }
          grouped[recipient.id].push(gift);
        });
      } else {
        // Gifts without recipients
        if (!grouped['unassigned']) {
          grouped['unassigned'] = [];
        }
        grouped['unassigned'].push(gift);
      }
    });

    return grouped;
  }, [gifts, recipients]);

  // Filter gifts
  const filteredGifts = useMemo(() => {
    return Object.entries(giftsByRecipient).reduce((acc, [recipientId, recipientGifts]) => {
      const filtered = recipientGifts.filter((gift) => {
        // Status filter
        if (statusFilter !== 'all' && gift.status !== statusFilter) {
          return false;
        }

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            gift.name.toLowerCase().includes(query) ||
            gift.description?.toLowerCase().includes(query) ||
            gift.category?.toLowerCase().includes(query)
          );
        }

        return true;
      });

      if (filtered.length > 0) {
        acc[recipientId] = filtered;
      }

      return acc;
    }, {} as Record<string, typeof gifts>);
  }, [giftsByRecipient, statusFilter, searchQuery]);

  const toggleSection = (recipientId: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(recipientId)) {
      newOpen.delete(recipientId);
    } else {
      newOpen.add(recipientId);
    }
    setOpenSections(newOpen);
  };

  const updateGiftStatus = async (giftId: string, newStatus: StatusType) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('gifts')
      .update({ status: newStatus })
      .eq('id', giftId);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    toast.success('Status updated');
    refetch();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Gifts
          </h1>
          <p className="text-gray-600 mt-1">Simple, organized gift tracking</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'idea' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('idea')}
              className={statusFilter === 'idea' ? 'bg-blue-600' : ''}
            >
              Ideas
            </Button>
            <Button
              variant={statusFilter === 'purchased' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('purchased')}
              className={statusFilter === 'purchased' ? 'bg-green-600' : ''}
            >
              Purchased
            </Button>
            <Button
              variant={statusFilter === 'wrapped' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('wrapped')}
              className={statusFilter === 'wrapped' ? 'bg-purple-600' : ''}
            >
              Wrapped
            </Button>
          </div>
        </div>

        {/* Recipient Sections */}
        <div className="space-y-4">
          {Object.entries(filteredGifts).map(([recipientId, recipientGifts]) => {
            const recipient = recipients.find((r) => r.id === recipientId);
            const isOpen = openSections.has(recipientId);

            if (!recipient && recipientId !== 'unassigned') return null;

            return (
              <Card key={recipientId} className="overflow-hidden">
                <Collapsible open={isOpen} onOpenChange={() => toggleSection(recipientId)}>
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {recipient ? (
                          <Avatar
                            type={recipient.avatar_type}
                            data={recipient.avatar_data}
                            background={recipient.avatar_background}
                            name={recipient.name}
                            size="md"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">
                            {recipient?.name || 'Unassigned'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {recipientGifts.length} {recipientGifts.length === 1 ? 'gift' : 'gifts'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Sparkles className="h-4 w-4" />
                          AI Suggest
                        </Button>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            isOpen ? 'transform rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t divide-y">
                      {recipientGifts.map((gift) => (
                        <div key={gift.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex gap-4">
                            {/* Image */}
                            {(gift.source_metadata?.screenshot || gift.image_url) && (
                              <div className="flex-shrink-0">
                                <img
                                  src={gift.source_metadata?.screenshot || gift.image_url || ''}
                                  alt={gift.name}
                                  className="h-20 w-20 object-cover rounded-lg"
                                />
                              </div>
                            )}

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 line-clamp-1">
                                    {gift.name}
                                  </h4>
                                  {gift.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                      {gift.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {gift.current_price && (
                                      <span className="text-lg font-semibold text-green-600">
                                        ${gift.current_price.toFixed(2)}
                                      </span>
                                    )}
                                    {gift.category && (
                                      <Badge variant="outline" className="text-xs">
                                        {gift.category}
                                      </Badge>
                                    )}
                                    {gift.source && gift.source !== 'manual' && (
                                      <Badge variant="secondary" className="text-xs">
                                        {gift.source === 'extension' && '🔗'}
                                        {gift.source === 'sms' && '💬'}
                                        {' '}{gift.source}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {gift.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="flex-shrink-0"
                                  >
                                    <a href={gift.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>

                              {/* Status Toggle */}
                              <div className="flex gap-2 mt-3">
                                {(['idea', 'purchased', 'wrapped'] as StatusType[]).map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => updateGiftStatus(gift.id, status)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      gift.status === status
                                        ? getStatusColor(status)
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {Object.keys(filteredGifts).length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No gifts found. Try adjusting your filters or search.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
