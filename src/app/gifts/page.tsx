'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRecipients } from '@/lib/hooks/useRecipients';
import { useGifts } from '@/lib/hooks/useGifts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { GiftStashNav } from '@/components/GiftStashNav';
import { GiftDetailsDialog } from '@/components/GiftDetailsDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  X,
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
  const [selectedGiftForDetails, setSelectedGiftForDetails] = useState<any | null>(null);

  const loading = recipientsLoading || giftsLoading;

  // Budget analytics - using per-recipient status
  const analytics = useMemo(() => {
    // Create gift-recipient pairs with status
    const giftRecipientPairs = gifts.flatMap(gift =>
      (gift.recipients || []).map(recipient => ({
        gift,
        recipient,
        status: recipient.status || gift.status || 'idea' // Use recipient status, fallback to gift status
      }))
    );

    const totalValue = giftRecipientPairs.reduce((sum, pair) => sum + (pair.gift.current_price || 0), 0);
    const purchasedValue = giftRecipientPairs
      .filter((pair) => ['purchased', 'wrapped', 'given'].includes(pair.status))
      .reduce((sum, pair) => sum + (pair.gift.current_price || 0), 0);
    const ideasValue = giftRecipientPairs
      .filter((pair) => ['idea', 'considering'].includes(pair.status))
      .reduce((sum, pair) => sum + (pair.gift.current_price || 0), 0);

    // By recipient
    const byRecipient: Record<string, { count: number; value: number; name: string }> = {};
    giftRecipientPairs.forEach((pair) => {
      if (!byRecipient[pair.recipient.id]) {
        byRecipient[pair.recipient.id] = { count: 0, value: 0, name: pair.recipient.name };
      }
      byRecipient[pair.recipient.id].count++;
      byRecipient[pair.recipient.id].value += pair.gift.current_price || 0;
    });

    return {
      totalValue,
      purchasedValue,
      ideasValue,
      giftCount: gifts.length,
      purchasedCount: giftRecipientPairs.filter((pair) =>
        ['purchased', 'wrapped', 'given'].includes(pair.status)
      ).length,
      ideasCount: giftRecipientPairs.filter((pair) => ['idea', 'considering'].includes(pair.status)).length,
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

  // Filter gifts - checking if ANY recipient matches the status filter
  const filteredGifts = useMemo(() => {
    return gifts.filter((gift) => {
      // Status filter - check if ANY recipient has this status
      if (statusFilter !== 'all') {
        const hasMatchingStatus = gift.recipients?.some(recipient => {
          const status = recipient.status || gift.status || 'idea';
          return status === statusFilter;
        });
        if (!hasMatchingStatus) {
          return false;
        }
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
        // Status filter - check status for THIS specific recipient
        if (statusFilter !== 'all') {
          const recipientStatus = gift.recipients?.find(r => r.id === recipientId);
          const status = recipientStatus?.status || gift.status || 'idea';
          if (status !== statusFilter) {
            return false;
          }
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

  const updateGiftStatus = async (giftId: string, newStatus: StatusType, recipientId?: string) => {
    const supabase = createClient();

    if (recipientId) {
      // Update status for specific recipient
      const { error } = await supabase
        .from('gift_recipients')
        .update({ status: newStatus })
        .eq('gift_id', giftId)
        .eq('recipient_id', recipientId);

      if (error) {
        toast.error('Failed to update status');
        return;
      }
    } else {
      // Update status for ALL recipients of this gift
      const { error } = await supabase
        .from('gift_recipients')
        .update({ status: newStatus })
        .eq('gift_id', giftId);

      if (error) {
        toast.error('Failed to update status');
        return;
      }

      // Also update the gift-level status for backward compatibility
      await supabase
        .from('gifts')
        .update({ status: newStatus })
        .eq('id', giftId);
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
      <>
        <GiftStashNav />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 flex items-center justify-center">
          <LoadingSpinner type="card" count={3} />
        </div>
      </>
    );
  }

  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent">
              GiftStash
            </h1>
            <p className="text-gray-600 mt-1">Smart gift management with budget insights</p>
          </div>
          <Button
            onClick={() => setIsRecipientModalOpen(true)}
            className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light gap-2"
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
                  <p className="text-2xl font-bold text-giftstash-orange">
                    ${analytics.totalValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{analytics.giftCount} gifts</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-giftstash-orange/10 to-giftstash-blue/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-giftstash-orange" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Purchased</p>
                  <p className="text-2xl font-bold text-giftstash-green">
                    ${analytics.purchasedValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{analytics.purchasedCount} gifts</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-giftstash-green/10 to-giftstash-blue/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-giftstash-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ideas</p>
                  <p className="text-2xl font-bold text-giftstash-blue">
                    ${analytics.ideasValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{analytics.ideasCount} ideas</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-giftstash-blue/10 to-giftstash-orange/10 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-giftstash-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Top Recipient</p>
                  <p className="text-lg font-bold text-giftstash-orange truncate">
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
                <div className="h-12 w-12 bg-gradient-to-br from-giftstash-orange/10 to-giftstash-green/10 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-giftstash-orange" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedGifts.size > 0 && (
          <Card className="mb-4 bg-gradient-to-r from-giftstash-orange/5 to-giftstash-blue/5 border-giftstash-orange/30">
            <CardContent className="p-4">
              {/* Mobile: Vertical layout with dropdown */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-giftstash-orange">
                    {selectedGifts.size} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={deselectAll} className="h-11 min-w-[44px]">
                    Deselect All
                  </Button>
                </div>
                <Select
                  onValueChange={(value) => {
                    if (value === 'delete') {
                      bulkDelete();
                    } else {
                      bulkUpdateStatus(value as 'idea' | 'purchased' | 'wrapped');
                    }
                  }}
                >
                  <SelectTrigger
                    className="w-full h-11"
                    aria-label={`Bulk actions for ${selectedGifts.size} selected gift${selectedGifts.size !== 1 ? 's' : ''}`}
                  >
                    <SelectValue placeholder="Choose action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Mark as Idea</SelectItem>
                    <SelectItem value="purchased">Mark as Purchased</SelectItem>
                    <SelectItem value="wrapped">Mark as Wrapped</SelectItem>
                    <SelectItem value="delete" className="text-red-600 focus:text-red-600">
                      Delete Selected
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop: Horizontal layout with buttons */}
              <div className="hidden md:flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-giftstash-orange">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search gifts by name, description, or category"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'recipients' ? 'default' : 'outline'}
                onClick={() => setViewMode('recipients')}
                className={
                  viewMode === 'recipients'
                    ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue'
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
                  viewMode === 'grid' ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue' : ''
                }
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                All Gifts
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={
                  statusFilter === 'all' ? 'bg-gradient-to-r from-giftstash-orange to-giftstash-blue' : ''
                }
                aria-label="Show all gifts"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'idea' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('idea')}
                className={statusFilter === 'idea' ? 'bg-blue-600' : ''}
                aria-label="Filter by idea status"
              >
                Ideas
              </Button>
              <Button
                variant={statusFilter === 'purchased' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('purchased')}
                className={statusFilter === 'purchased' ? 'bg-green-600' : ''}
                aria-label="Filter by purchased status"
              >
                Purchased
              </Button>
              <Button
                variant={statusFilter === 'wrapped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('wrapped')}
                className={statusFilter === 'wrapped' ? 'bg-purple-600' : ''}
                aria-label="Filter by wrapped status"
              >
                Wrapped
              </Button>
              {filteredGifts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="ml-auto gap-2"
                  aria-label={`Select all ${filteredGifts.length} gifts`}
                >
                  <Checkbox checked={selectedGifts.size === filteredGifts.length} aria-hidden="true" />
                  Select All
                </Button>
              )}
            </div>
            {/* Scroll indicator gradient */}
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none md:hidden" aria-hidden="true" />
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
                                  <div
                                    className="flex-1 cursor-pointer hover:text-giftstash-orange transition-colors"
                                    onClick={() => setSelectedGiftForDetails(gift)}
                                  >
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
                                      {(() => {
                                        const recipientData = gift.recipients?.find(r => r.id === recipientId);
                                        if (recipientData?.occasion) {
                                          return (
                                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                              🎁 {recipientData.occasion.replace('_', ' ')}
                                              {recipientData.occasion_date && ` • ${new Date(recipientData.occasion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                            </Badge>
                                          );
                                        }
                                        return null;
                                      })()}
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

                                {/* Status Toggle - Per Recipient */}
                                <div className="flex gap-2 mt-3">
                                  {(['idea', 'purchased', 'wrapped'] as StatusType[]).map((status) => {
                                    // Get status for THIS specific recipient
                                    const recipientStatus = gift.recipients?.find(r => r.id === recipientId);
                                    const currentStatus = recipientStatus?.status || gift.status || 'idea';

                                    return (
                                      <button
                                        key={status}
                                        onClick={() => updateGiftStatus(gift.id, status, recipientId)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                          currentStatus === status
                                            ? getStatusColor(status)
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </button>
                                    );
                                  })}
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
              <Card
                key={gift.id}
                className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedGiftForDetails(gift)}
              >
                <div className="relative">
                  {(gift.source_metadata?.screenshot || gift.image_url) && (
                    <img
                      src={gift.source_metadata?.screenshot || gift.image_url || ''}
                      alt={gift.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {(!gift.source_metadata?.screenshot && !gift.image_url) && (
                    <div className="w-full h-48 bg-gradient-to-br from-giftstash-orange/10 to-giftstash-blue/10 flex items-center justify-center">
                      <Package className="h-16 w-16 text-giftstash-orange/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
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
                  {(() => {
                    const occasions = gift.recipients
                      ?.map(r => r.occasion)
                      .filter((o, i, arr) => o && arr.indexOf(o) === i);
                    if (occasions && occasions.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {occasions.map((occasion, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              🎁 {occasion.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {(['idea', 'purchased', 'wrapped'] as StatusType[]).map((status) => {
                      // Check if ANY recipient has this status
                      const hasStatus = gift.recipients?.some(r => (r.status || gift.status || 'idea') === status);

                      return (
                        <button
                          key={status}
                          onClick={() => updateGiftStatus(gift.id, status)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            hasStatus
                              ? getStatusColor(status)
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredGifts.length === 0 && (
          <Card className="p-8 md:p-12 text-center">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-giftstash-orange/10 to-giftstash-blue/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 md:w-10 md:h-10 text-giftstash-orange" aria-hidden="true" />
              </div>

              {searchQuery || statusFilter !== 'all' ? (
                <>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    No gifts match your {searchQuery && statusFilter !== 'all' ? 'search and filters' : searchQuery ? 'search' : 'filters'}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-6">
                    Try adjusting your search or clearing filters to see more results
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    variant="outline"
                    className="gap-2 h-11 md:h-12"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Clear {searchQuery && statusFilter !== 'all' ? 'Search & Filters' : searchQuery ? 'Search' : 'Filters'}
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    No gifts yet
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-6">
                    Start tracking gift ideas by adding your first gift
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/gifts/new">
                      <Button className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light gap-2 h-11 md:h-12 w-full sm:w-auto">
                        <Plus className="h-5 w-5" aria-hidden="true" />
                        Add Your First Gift
                      </Button>
                    </Link>
                    <Link href="/inspiration">
                      <Button variant="outline" className="gap-2 h-11 md:h-12 w-full sm:w-auto">
                        <Lightbulb className="h-5 w-5" aria-hidden="true" />
                        Browse Inspiration
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
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

        {/* Gift Details Dialog */}
        <GiftDetailsDialog
          gift={selectedGiftForDetails}
          isOpen={!!selectedGiftForDetails}
          onClose={() => setSelectedGiftForDetails(null)}
          onStatusUpdate={(giftId, newStatus) => {
            refetch();
          }}
        />
      </div>
    </>
  );
}
