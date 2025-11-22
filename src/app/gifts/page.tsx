'use client';

import { useState, useMemo } from 'react';
import { useRecipients } from '@/lib/hooks/useRecipients';
import { useGifts } from '@/lib/hooks/useGifts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  ChevronDown,
  ExternalLink,
  User,
  UserPlus,
  DollarSign,
  ShoppingCart,
  Lightbulb,
  Package,
  Trash2,
  Tag,
  LayoutGrid,
  List,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Avatar from '@/components/Avatar';
import { AIRecommendations } from '@/components/AIRecommendations';
import { RecipientModal } from '@/components/RecipientModal';

type StatusType = 'idea' | 'considering' | 'purchased' | 'wrapped' | 'given';

export default function UnifiedGiftsPage() {
  const { recipients, loading: recipientsLoading, refetch: refetchRecipients } = useRecipients();
  const { gifts, loading: giftsLoading, refetch } = useGifts();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StatusType>('all');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [selectedGifts, setSelectedGifts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'recipients' | 'grid'>('recipients');

  const loading = recipientsLoading || giftsLoading;

  // Budget analytics
  const analytics = useMemo(() => {
    const totalValue = gifts.reduce((sum, gift) => sum + (gift.current_price || 0), 0);
    const purchasedValue = gifts
      .filter((g) => g.status === 'purchased' || g.status === 'wrapped' || g.status === 'given')
      .reduce((sum, gift) => sum + (gift.current_price || 0), 0);
    const ideasValue = gifts
      .filter((g) => g.status === 'idea' || g.status === 'considering')
      .reduce((sum, gift) => sum + (gift.current_price || 0), 0);

    // By recipient
    const byRecipient: Record<string, { count: number; value: number; name: string }> = {};
    gifts.forEach((gift) => {
      if (gift.recipients && gift.recipients.length > 0) {
        gift.recipients.forEach((recipient) => {
          if (!byRecipient[recipient.id]) {
            byRecipient[recipient.id] = { count: 0, value: 0, name: recipient.name };
          }
          byRecipient[recipient.id].count++;
          byRecipient[recipient.id].value += gift.current_price || 0;
        });
      }
    });

    return {
      totalValue,
      purchasedValue,
      ideasValue,
      giftCount: gifts.length,
      purchasedCount: gifts.filter((g) =>
        ['purchased', 'wrapped', 'given'].includes(g.status || '')
      ).length,
      ideasCount: gifts.filter((g) => ['idea', 'considering'].includes(g.status || '')).length,
      byRecipient,
    };
  }, [gifts]);

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
    return gifts.filter((gift) => {
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
  }, [gifts, statusFilter, searchQuery]);

  const filteredGiftsByRecipient = useMemo(() => {
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

  const toggleGiftSelection = (giftId: string) => {
    const newSelected = new Set(selectedGifts);
    if (newSelected.has(giftId)) {
      newSelected.delete(giftId);
    } else {
      newSelected.add(giftId);
    }
    setSelectedGifts(newSelected);
  };

  const selectAll = () => {
    setSelectedGifts(new Set(filteredGifts.map((g) => g.id)));
  };

  const deselectAll = () => {
    setSelectedGifts(new Set());
  };

  const bulkUpdateStatus = async (newStatus: StatusType) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('gifts')
      .update({ status: newStatus })
      .in('id', Array.from(selectedGifts));

    if (error) {
      toast.error('Failed to update gifts');
      return;
    }

    toast.success(`Updated ${selectedGifts.size} gifts to ${newStatus}`);
    setSelectedGifts(new Set());
    refetch();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedGifts.size} gifts? This cannot be undone.`)) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('gifts').delete().in('id', Array.from(selectedGifts));

    if (error) {
      toast.error('Failed to delete gifts');
      return;
    }

    toast.success(`Deleted ${selectedGifts.size} gifts`);
    setSelectedGifts(new Set());
    refetch();
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gift Tracker
            </h1>
            <p className="text-gray-600 mt-1">Smart gift management with budget insights</p>
          </div>
          <Button
            onClick={() => setIsRecipientModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Recipient
          </Button>
        </div>

        {/* Budget Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${analytics.totalValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{analytics.giftCount} gifts</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Purchased</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${analytics.purchasedValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{analytics.purchasedCount} gifts</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ideas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${analytics.ideasValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{analytics.ideasCount} ideas</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Top Recipient</p>
                  <p className="text-lg font-bold text-pink-600 truncate">
                    {Object.values(analytics.byRecipient).sort((a, b) => b.value - a.value)[0]
                      ?.name || 'None'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    $
                    {Object.values(analytics.byRecipient)
                      .sort((a, b) => b.value - a.value)[0]
                      ?.value.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedGifts.size > 0 && (
          <Card className="mb-4 bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-purple-900">
                    {selectedGifts.size} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Deselect All
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus('idea')}
                    className="bg-blue-100 hover:bg-blue-200"
                  >
                    Mark as Idea
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus('purchased')}
                    className="bg-green-100 hover:bg-green-200"
                  >
                    Mark as Purchased
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus('wrapped')}
                    className="bg-purple-100 hover:bg-purple-200"
                  >
                    Mark as Wrapped
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={bulkDelete}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'recipients' ? 'default' : 'outline'}
                onClick={() => setViewMode('recipients')}
                className={
                  viewMode === 'recipients'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                    : ''
                }
              >
                <List className="h-4 w-4 mr-2" />
                By Recipient
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className={
                  viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
                }
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                All Gifts
              </Button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={
                statusFilter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
              }
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
            {filteredGifts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="ml-auto gap-2"
              >
                <Checkbox checked={selectedGifts.size === filteredGifts.length} />
                Select All
              </Button>
            )}
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'recipients' ? (
          /* Recipient-Grouped View */
          <div className="space-y-4">
            {Object.entries(filteredGiftsByRecipient).map(([recipientId, recipientGifts]) => {
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
                              {recipientGifts.length} {recipientGifts.length === 1 ? 'gift' : 'gifts'} •
                              ${recipientGifts.reduce((sum, g) => sum + (g.current_price || 0), 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {recipient && (
                            <AIRecommendations
                              recipientId={recipient.id}
                              recipientName={recipient.name}
                              onGiftAdded={refetch}
                            />
                          )}
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
                              {/* Checkbox */}
                              <div className="flex items-start pt-1">
                                <Checkbox
                                  checked={selectedGifts.has(gift.id)}
                                  onCheckedChange={() => toggleGiftSelection(gift.id)}
                                />
                              </div>

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
                                          {' '}
                                          {gift.source}
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
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGifts.map((gift) => (
              <Card key={gift.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative">
                  {(gift.source_metadata?.screenshot || gift.image_url) && (
                    <img
                      src={gift.source_metadata?.screenshot || gift.image_url || ''}
                      alt={gift.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {(!gift.source_metadata?.screenshot && !gift.image_url) && (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Package className="h-16 w-16 text-purple-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedGifts.has(gift.id)}
                      onCheckedChange={() => toggleGiftSelection(gift.id)}
                      className="bg-white border-2"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(gift.status || 'idea')}>
                      {gift.status || 'idea'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1 mb-2">{gift.name}</h3>
                  {gift.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{gift.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    {gift.current_price && (
                      <span className="text-xl font-bold text-green-600">
                        ${gift.current_price.toFixed(2)}
                      </span>
                    )}
                    {gift.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={gift.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  {gift.recipients && gift.recipients.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {gift.recipients.map((r) => r.name).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {(['idea', 'purchased', 'wrapped'] as StatusType[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateGiftStatus(gift.id, status)}
                        className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                          gift.status === status
                            ? getStatusColor(status)
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredGifts.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">
              No gifts found. Try adjusting your filters or search.
            </p>
          </Card>
        )}
      </div>

      {/* Recipient Modal */}
      <RecipientModal
        isOpen={isRecipientModalOpen}
        onClose={() => setIsRecipientModalOpen(false)}
        onSuccess={() => {
          refetchRecipients();
          refetch();
        }}
      />
    </div>
  );
}
