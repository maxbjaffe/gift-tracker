'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AvatarSelector from '@/components/AvatarSelector';
import type { AvatarData } from '@/lib/avatar-utils';
import { generateDefaultAvatar } from '@/lib/avatar-utils';
import { calculateAge, suggestAgeRange } from '@/lib/utils/age';

export default function NewRecipientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<AvatarData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthday: '',
    age_range: '',
    gender: '',
    interests: '',
    notes: '',
    gift_categories: '',
    favorite_colors: '',
    favorite_stores: '',
    favorite_brands: '',
    gift_dos: '',
    gift_donts: '',
    wishlist_items: '',
    past_gifts: '',
    max_budget: '',
    max_purchased_budget: '',
  });

  // Auto-generate default avatar when name changes
  useEffect(() => {
    if (formData.name && !avatar) {
      setAvatar(generateDefaultAvatar());
    }
  }, [formData.name, avatar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Convert comma-separated strings to arrays, or null if empty
      const interestsArray = formData.interests.trim() 
        ? formData.interests.split(',').map(item => item.trim()).filter(item => item)
        : null;
      
      const giftCategoriesArray = formData.gift_categories.trim()
        ? formData.gift_categories.split(',').map(item => item.trim()).filter(item => item)
        : null;
      
      const favoriteColorsArray = formData.favorite_colors.trim()
        ? formData.favorite_colors.split(',').map(item => item.trim()).filter(item => item)
        : null;
      
      const favoriteStoresArray = formData.favorite_stores.trim()
        ? formData.favorite_stores.split(',').map(item => item.trim()).filter(item => item)
        : null;
      
      const favoriteBrandsArray = formData.favorite_brands.trim()
        ? formData.favorite_brands.split(',').map(item => item.trim()).filter(item => item)
        : null;
      
      const giftDosArray = formData.gift_dos.trim()
        ? formData.gift_dos.split(',').map(item => item.trim()).filter(item => item)
        : null;
      
      const giftDontsArray = formData.gift_donts.trim()
        ? formData.gift_donts.split(',').map(item => item.trim()).filter(item => item)
        : null;

      // Parse JSON fields
      let wishlistItemsJson = null;
      if (formData.wishlist_items.trim()) {
        try {
          wishlistItemsJson = JSON.parse(formData.wishlist_items);
        } catch (err) {
          throw new Error('Invalid JSON format for Wishlist Items');
        }
      }

      let pastGiftsJson = null;
      if (formData.past_gifts.trim()) {
        try {
          pastGiftsJson = JSON.parse(formData.past_gifts);
        } catch (err) {
          throw new Error('Invalid JSON format for Past Gifts');
        }
      }

      const { data, error: submitError } = await supabase
        .from('recipients')
        .insert({
          name: formData.name,
          relationship: formData.relationship || null,
          birthday: formData.birthday || null,
          age_range: formData.age_range || null,
          gender: formData.gender || null,
          interests: interestsArray,
          notes: formData.notes || null,
          hobbies: giftCategoriesArray, // Map gift_categories to hobbies field
          favorite_colors: favoriteColorsArray,
          favorite_stores: favoriteStoresArray,
          favorite_brands: favoriteBrandsArray,
          gift_dos: giftDosArray,
          gift_donts: giftDontsArray,
          wishlist_items: wishlistItemsJson,
          past_gifts_received: pastGiftsJson, // Correct field name
          max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null,
          max_purchased_budget: formData.max_purchased_budget ? parseFloat(formData.max_purchased_budget) : null,
          avatar_type: avatar?.type || null,
          avatar_data: avatar?.data || null,
          avatar_background: avatar?.background || null,
        })
        .select()
        .single();

      if (submitError) throw submitError;

      router.push('/recipients');
    } catch (err) {
      console.error('Error creating recipient:', err);
      setError(err instanceof Error ? err.message : 'Failed to create recipient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-6 px-4 md:py-8 md:px-6 lg:py-12 lg:px-8">
      <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
        <Link
          href="/recipients"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4 md:mb-6 text-sm md:text-base"
        >
          ← Back to Recipients
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Add New Recipient
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
            Create a comprehensive profile for someone you'd like to track gifts for.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Basic Information Section */}
            <div className="border-b pb-4 md:pb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Basic Information</h2>

              {/* Name - Required */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter recipient's name"
                />
              </div>

              {/* Avatar Selection */}
              {formData.name && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                    Choose Avatar
                  </label>
                  <AvatarSelector
                    name={formData.name}
                    value={avatar}
                    onChange={setAvatar}
                  />
                </div>
              )}

              {/* Relationship */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full h-11 md:h-12 px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Partner">Partner</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Grandchild">Grandchild</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Birthday */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Birthday
                </label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => {
                    const birthday = e.target.value;
                    const age = calculateAge(birthday);
                    if (age !== null) {
                      const suggestedRange = suggestAgeRange(age);
                      setFormData({ ...formData, birthday, age_range: suggestedRange });
                    } else {
                      setFormData({ ...formData, birthday });
                    }
                  }}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {formData.birthday && calculateAge(formData.birthday) !== null && (
                  <p className="mt-2 text-sm text-purple-600 font-medium">
                    Currently {calculateAge(formData.birthday)} years old
                  </p>
                )}
              </div>

              {/* Age Range */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Age Range {formData.birthday && '(auto-filled)'}
                </label>
                <select
                  value={formData.age_range}
                  onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                  className="w-full h-11 md:h-12 px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select age range</option>
                  <option value="0-2">0-2 (Infant/Toddler)</option>
                  <option value="3-5">3-5 (Preschool)</option>
                  <option value="6-9">6-9 (Early School Age)</option>
                  <option value="10-12">10-12 (Preteen)</option>
                  <option value="13-17">13-17 (Teen)</option>
                  <option value="18-24">18-24 (Young Adult)</option>
                  <option value="25-34">25-34 (Adult)</option>
                  <option value="35-44">35-44 (Adult)</option>
                  <option value="45-54">45-54 (Adult)</option>
                  <option value="55-64">55-64 (Adult)</option>
                  <option value="65+">65+ (Senior)</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full h-11 md:h-12 px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Budget Planning Section */}
            <div className="border-b pb-4 md:pb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Budget Planning</h2>

              {/* Max Budget Per Gift */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Maximum Budget (per gift)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 md:top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.max_budget}
                    onChange={(e) => setFormData({ ...formData, max_budget: e.target.value })}
                    step="0.01"
                    min="0"
                    className="w-full min-h-11 md:min-h-12 pl-8 pr-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="100.00"
                  />
                </div>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Maximum amount to spend on each individual gift
                </p>
              </div>

              {/* Max Total Purchased Budget */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Maximum Total Budget (for all purchased gifts)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 md:top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.max_purchased_budget}
                    onChange={(e) => setFormData({ ...formData, max_purchased_budget: e.target.value })}
                    step="0.01"
                    min="0"
                    className="w-full min-h-11 md:min-h-12 pl-8 pr-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="500.00"
                  />
                </div>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Total budget limit for all purchased gifts combined for this recipient
                </p>
              </div>
            </div>

            {/* Interests & Preferences Section */}
            <div className="border-b pb-4 md:pb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Interests & Preferences</h2>

              {/* Interests */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Interests & Hobbies
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Reading, Hiking, Cooking, Photography"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>

              {/* Hobbies / Gift Categories */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Hobbies & Favorite Gift Categories
                </label>
                <input
                  type="text"
                  value={formData.gift_categories}
                  onChange={(e) => setFormData({ ...formData, gift_categories: e.target.value })}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Gaming, Books, Tech, Home Decor, Jewelry"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>

              {/* Favorite Colors */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Favorite Colors
                </label>
                <input
                  type="text"
                  value={formData.favorite_colors}
                  onChange={(e) => setFormData({ ...formData, favorite_colors: e.target.value })}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Blue, Purple, Green"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>

              {/* Favorite Stores */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Favorite Stores
                </label>
                <input
                  type="text"
                  value={formData.favorite_stores}
                  onChange={(e) => setFormData({ ...formData, favorite_stores: e.target.value })}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Target, Amazon, Etsy"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>

              {/* Favorite Brands */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Favorite Brands
                </label>
                <input
                  type="text"
                  value={formData.favorite_brands}
                  onChange={(e) => setFormData({ ...formData, favorite_brands: e.target.value })}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Apple, Nike, Lego"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>
            </div>

            {/* Gift Guidelines Section */}
            <div className="border-b pb-4 md:pb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Gift-Giving Guidelines</h2>

              {/* Gift Do's */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Gift Do's ✅ (What They Love)
                </label>
                <input
                  type="text"
                  value={formData.gift_dos}
                  onChange={(e) => setFormData({ ...formData, gift_dos: e.target.value })}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Personalized items, Experiences, Quality over quantity"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>

              {/* Gift Don'ts */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Gift Don'ts ❌ (What to Avoid)
                </label>
                <input
                  type="text"
                  value={formData.gift_donts}
                  onChange={(e) => setFormData({ ...formData, gift_donts: e.target.value })}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Clothing sizes, Strong scents, Clutter"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>
            </div>

            {/* Wishlist & History Section */}
            <div className="border-b pb-4 md:pb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Wishlist & Gift History</h2>

              {/* Wishlist Items */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Wishlist Items (JSON Format - Optional)
                </label>
                <textarea
                  value={formData.wishlist_items}
                  onChange={(e) => setFormData({ ...formData, wishlist_items: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder='{"items": ["Item 1", "Item 2"], "priority": "high"}'
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Advanced: Store structured wishlist data in JSON format
                </p>
              </div>

              {/* Past Gifts */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Past Gifts (JSON Format - Optional)
                </label>
                <textarea
                  value={formData.past_gifts}
                  onChange={(e) => setFormData({ ...formData, past_gifts: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder='{"2024": ["Gift 1", "Gift 2"], "2023": ["Gift 3"]}'
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Advanced: Store gift history by year in JSON format
                </p>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Additional Notes</h2>

              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any other helpful information (sizes, allergies, special considerations, etc.)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 h-11 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg text-sm md:text-base font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? 'Creating...' : 'Create Recipient'}
              </button>
              <Link
                href="/recipients"
                className="w-full sm:w-auto h-11 md:h-12 flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-lg text-sm md:text-base font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}