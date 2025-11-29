'use client';

import { useState, useEffect } from 'react';
import GiftCard from '@/components/GiftCard';
import { GiftStashNav } from '@/components/GiftStashNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Gift {
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
}

interface Recipient {
  id: string;
  name: string;
}

export default function InspirationPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [category, setCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [ageRange, setAgeRange] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load recipients on mount
  useEffect(() => {
    loadRecipients();
  }, []);

  // Load gifts on mount and when filters change
  useEffect(() => {
    loadGifts();
  }, [category, minPrice, maxPrice, ageRange, occasion]);

  const loadRecipients = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recipients')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error loading recipients:', error);
      return;
    }

    setRecipients(data || []);
  };

  const loadGifts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (category && category !== 'all') filters.category = category;
      if (minPrice) filters.minPrice = parseInt(minPrice);
      if (maxPrice) filters.maxPrice = parseInt(maxPrice);
      if (ageRange && ageRange !== 'all') filters.ageRange = ageRange;
      if (occasion && occasion !== 'all') filters.occasion = occasion;

      const response = await fetch('/api/gift-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error('Failed to load gift ideas');
      }

      const data = await response.json();
      setGifts(data.gifts || []);
    } catch (error) {
      console.error('Error loading gifts:', error);
      toast.error('Failed to load gift ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGift = async (gift: Gift, recipientIds: string[]) => {
    try {
      // Use the API endpoint which properly handles the gift_recipients join table
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gift.name,
          description: gift.description,
          current_price: gift.price_min || 0,
          category: gift.category,
          url: gift.amazon_link,
          status: 'idea',
          recipient_ids: recipientIds, // This will be linked in the gift_recipients table
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save gift');
      }

      toast.success(`Gift saved for ${recipientIds.length} recipient${recipientIds.length !== 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Error saving gift:', error);
      toast.error('Failed to save gift');
      throw error;
    }
  };

  const clearFilters = () => {
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setAgeRange('all');
    setOccasion('all');
    setSearchQuery('');
  };

  const filteredGifts = gifts.filter((gift) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      gift.name.toLowerCase().includes(query) ||
      gift.description.toLowerCase().includes(query) ||
      gift.category.toLowerCase().includes(query)
    );
  });

  const hasActiveFilters = (category && category !== 'all') || minPrice || maxPrice || (ageRange && ageRange !== 'all') || (occasion && occasion !== 'all');

  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-giftstash-orange to-giftstash-blue bg-clip-text text-transparent mb-3">
            GiftStash Inspiration
          </h1>
          <p className="text-gray-600 text-lg">
            Discover trending and popular gift ideas
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <Input
                placeholder="Search gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search gift ideas by name, description, or category"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                  Active
                </span>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Category */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Toys">Toys</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Games">Games</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Price */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Min Price</Label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              {/* Max Price */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Max Price</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Age Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Age Range</Label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="0-5">0-5 years</SelectItem>
                    <SelectItem value="6-12">6-12 years</SelectItem>
                    <SelectItem value="13-17">13-17 years</SelectItem>
                    <SelectItem value="18-25">18-25 years</SelectItem>
                    <SelectItem value="26-40">26-40 years</SelectItem>
                    <SelectItem value="41-60">41-60 years</SelectItem>
                    <SelectItem value="60+">60+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Occasion */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Occasions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Occasions</SelectItem>
                    <SelectItem value="Birthday">Birthday</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                    <SelectItem value="Anniversary">Anniversary</SelectItem>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Graduation">Graduation</SelectItem>
                    <SelectItem value="Thank You">Thank You</SelectItem>
                    <SelectItem value="Just Because">Just Because</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-giftstash-orange mb-4" />
            <p className="text-gray-600">Finding amazing gift ideas...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredGifts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">
              {searchQuery
                ? 'No gifts match your search'
                : hasActiveFilters
                ? 'No gifts match your filters'
                : 'No gifts found'}
            </p>
            {(searchQuery || hasActiveFilters) && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Gift Grid */}
        {!loading && filteredGifts.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredGifts.length} gift{filteredGifts.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {filteredGifts.map((gift, index) => (
                <GiftCard
                  key={index}
                  gift={gift}
                  recipients={recipients}
                  onSave={handleSaveGift}
                />
              ))}
            </div>
          </>
        )}
        </div>
      </div>
    </>
  );
}
