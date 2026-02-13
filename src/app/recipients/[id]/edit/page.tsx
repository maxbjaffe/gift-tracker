'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Recipient } from '@/types/database.types';
import AvatarSelector from '@/components/AvatarSelector';
import type { AvatarData } from '@/lib/avatar-utils';
import { generateDefaultAvatar } from '@/lib/avatar-utils';
import { calculateAge } from '@/lib/utils/age';
import { SmartTagPicker } from '@/components/ui/SmartTagPicker';

// Common store suggestions (not from taxonomy — too varied for a closed list)
const COMMON_STORES = [
  { id: 'amazon', name: 'Amazon' },
  { id: 'target', name: 'Target' },
  { id: 'walmart', name: 'Walmart' },
  { id: 'nordstrom', name: 'Nordstrom' },
  { id: 'costco', name: 'Costco' },
  { id: 'etsy', name: 'Etsy' },
  { id: 'rei', name: 'REI' },
  { id: 'sephora', name: 'Sephora' },
  { id: 'best_buy', name: 'Best Buy' },
  { id: 'home_depot', name: 'Home Depot' },
  { id: 'tj_maxx', name: 'TJ Maxx' },
  { id: 'marshalls', name: 'Marshalls' },
  { id: 'bed_bath', name: 'Bed Bath & Beyond' },
  { id: 'williams_sonoma', name: 'Williams-Sonoma' },
  { id: 'anthropologie', name: 'Anthropologie' },
  { id: 'pottery_barn', name: 'Pottery Barn' },
  { id: 'west_elm', name: 'West Elm' },
  { id: 'crate_barrel', name: 'Crate & Barrel' },
  { id: 'ulta', name: 'Ulta Beauty' },
  { id: 'macys', name: "Macy's" },
];

// Common restriction suggestions
const COMMON_RESTRICTIONS = [
  { id: 'nut_allergy', name: 'Nut Allergy' },
  { id: 'gluten_free', name: 'Gluten-Free' },
  { id: 'dairy_free', name: 'Dairy-Free' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'shellfish_allergy', name: 'Shellfish Allergy' },
  { id: 'latex_allergy', name: 'Latex Allergy' },
  { id: 'fragrance_sensitive', name: 'Fragrance Sensitive' },
  { id: 'no_alcohol', name: 'No Alcohol' },
  { id: 'sugar_free', name: 'Sugar-Free' },
];

function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val) return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

export default function EditRecipientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();

  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<AvatarData | null>(null);

  // Scalar fields
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [giftPreferences, setGiftPreferences] = useState('');
  const [itemsAlreadyOwned, setItemsAlreadyOwned] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [maxPurchasedBudget, setMaxPurchasedBudget] = useState('');
  const [notes, setNotes] = useState('');

  // SmartTagPicker fields (single-select)
  const [relationship, setRelationship] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<string[]>([]);
  const [gender, setGender] = useState<string[]>([]);
  const [budgetTier, setBudgetTier] = useState<string[]>([]);

  // SmartTagPicker fields (multi-select)
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [favoriteBrands, setFavoriteBrands] = useState<string[]>([]);
  const [favoriteStores, setFavoriteStores] = useState<string[]>([]);
  const [giftStyles, setGiftStyles] = useState<string[]>([]);
  const [giftDos, setGiftDos] = useState<string[]>([]);
  const [giftDonts, setGiftDonts] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);

  useEffect(() => {
    fetchRecipient();
  }, [params.id]);

  async function fetchRecipient() {
    try {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setRecipient(data);

      // Scalar fields
      setName(data.name || '');
      setBirthday(data.birthday || '');
      setGiftPreferences(data.gift_preferences || '');
      setItemsAlreadyOwned(Array.isArray(data.items_already_owned) ? data.items_already_owned.join(', ') : '');
      setMaxBudget(data.max_budget?.toString() || '');
      setMaxPurchasedBudget(data.max_purchased_budget?.toString() || '');
      setNotes(data.notes || '');

      // Single-select fields
      setRelationship(data.relationship ? [data.relationship] : []);
      setAgeRange(data.age_range ? [data.age_range] : []);
      setGender(data.gender ? [data.gender] : []);
      setBudgetTier([]); // New field, no existing data

      // Multi-select fields
      setInterests(toArray(data.interests));
      setHobbies(toArray(data.hobbies));
      setFavoriteColors(toArray(data.favorite_colors));
      setFavoriteBrands(toArray(data.favorite_brands));
      setFavoriteStores(toArray(data.favorite_stores));
      setGiftStyles([]); // New field
      setGiftDos(toArray(data.gift_dos));
      setGiftDonts(toArray(data.gift_donts));
      setRestrictions(toArray(data.restrictions));

      // Load avatar
      if (data.avatar_type && (data.avatar_type === 'preset' || data.avatar_type === 'emoji')) {
        setAvatar({ type: data.avatar_type, data: data.avatar_data || '', background: data.avatar_background || '' });
      } else {
        setAvatar(generateDefaultAvatar());
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching recipient:', err);
      setError('Failed to load recipient');
      setLoading(false);
    }
  }

  function handleBirthdayChange(value: string) {
    setBirthday(value);
    if (value) {
      const age = calculateAge(value);
      if (age !== null) {
        // Auto-suggest life stage
        if (age <= 1) setAgeRange(['Baby']);
        else if (age <= 4) setAgeRange(['Toddler']);
        else if (age <= 7) setAgeRange(['Young Kid']);
        else if (age <= 12) setAgeRange(['Tween']);
        else if (age <= 17) setAgeRange(['Teen']);
        else if (age <= 25) setAgeRange(['Young Adult']);
        else if (age <= 64) setAgeRange(['Adult']);
        else setAgeRange(['Senior']);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const itemsArray = itemsAlreadyOwned.split(',').map(s => s.trim()).filter(Boolean);

      const updateData = {
        name,
        relationship: relationship[0] || null,
        birthday: birthday || null,
        age_range: ageRange[0] || null,
        gender: gender[0] || null,
        interests: interests.length > 0 ? interests : null,
        hobbies: hobbies.length > 0 ? hobbies : null,
        favorite_colors: favoriteColors.length > 0 ? favoriteColors : null,
        favorite_brands: favoriteBrands.length > 0 ? favoriteBrands : null,
        favorite_stores: favoriteStores.length > 0 ? favoriteStores : null,
        gift_preferences: giftPreferences || null,
        gift_dos: giftDos.length > 0 ? giftDos : null,
        gift_donts: giftDonts.length > 0 ? giftDonts : null,
        restrictions: restrictions.length > 0 ? restrictions : null,
        items_already_owned: itemsArray.length > 0 ? itemsArray : null,
        max_budget: maxBudget ? parseFloat(maxBudget) : null,
        max_purchased_budget: maxPurchasedBudget ? parseFloat(maxPurchasedBudget) : null,
        notes: notes || null,
        avatar_type: avatar?.type || null,
        avatar_data: avatar?.data || null,
        avatar_background: avatar?.background || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('recipients')
        .update(updateData)
        .eq('id', params.id);

      if (error) throw error;

      router.push(`/recipients/${params.id}`);
    } catch (err: any) {
      console.error('Error updating recipient:', err);
      setError(err.message || 'Failed to update recipient');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-gray-600">Loading recipient details...</div>
        </div>
      </div>
    );
  }

  if (error && !recipient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-red-600">{error}</div>
          <Link href="/recipients" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
            ← Back to Recipients
          </Link>
        </div>
      </div>
    );
  }

  const currentAge = birthday ? calculateAge(birthday) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-6 px-4 md:py-8 md:px-6 lg:py-12 lg:px-8">
      <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link href={`/recipients/${params.id}`} className="text-purple-600 hover:text-purple-700 mb-4 inline-block text-sm md:text-base">
            ← Back to Recipient
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Edit Recipient</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>

            <div>
              <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., John Doe"
              />
            </div>

            {name && (
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Avatar</label>
                <AvatarSelector name={name} value={avatar} onChange={setAvatar} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
              <SmartTagPicker
                label="Relationship"
                values={relationship}
                onChange={setRelationship}
                enumType="relationship"
                singleSelect
                placeholder="Select relationship..."
                color="pink"
              />
              <SmartTagPicker
                label="Gender"
                values={gender}
                onChange={setGender}
                enumType="gender"
                singleSelect
                placeholder="Select..."
                color="teal"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
              <div>
                <label htmlFor="birthday" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Birthday</label>
                <input
                  type="date"
                  id="birthday"
                  value={birthday}
                  onChange={(e) => handleBirthdayChange(e.target.value)}
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {currentAge !== null && (
                  <p className="mt-2 text-sm text-purple-600 font-medium">
                    Currently {currentAge} years old
                  </p>
                )}
              </div>
              <SmartTagPicker
                label={`Life Stage${birthday ? ' (auto-filled)' : ''}`}
                values={ageRange}
                onChange={setAgeRange}
                enumType="life_stage"
                singleSelect
                placeholder="Select..."
                color="blue"
              />
            </div>
          </div>

          {/* Interests & Preferences */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2">Interests & Preferences</h2>

            <SmartTagPicker
              label="Interests"
              values={interests}
              onChange={setInterests}
              allInterests
              placeholder="Search interests..."
              color="purple"
            />

            <SmartTagPicker
              label="Hobbies"
              values={hobbies}
              onChange={setHobbies}
              allInterests
              placeholder="Search hobbies..."
              color="indigo"
            />

            <SmartTagPicker
              label="Favorite Colors"
              values={favoriteColors}
              onChange={setFavoriteColors}
              enumType="favorite_color"
              allowCustom
              placeholder="Select or type colors..."
              color="rose"
            />

            <div>
              <label htmlFor="gift_preferences" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Gift Preferences (general notes)
              </label>
              <textarea
                id="gift_preferences"
                value={giftPreferences}
                onChange={(e) => setGiftPreferences(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="What types of gifts do they prefer?"
              />
            </div>
          </div>

          {/* Shopping Preferences */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2">Shopping Preferences</h2>

            <SmartTagPicker
              label="Favorite Brands"
              values={favoriteBrands}
              onChange={setFavoriteBrands}
              enumType="favorite_brand"
              allowCustom
              placeholder="Search or type brands..."
              color="amber"
            />

            <SmartTagPicker
              label="Favorite Stores"
              values={favoriteStores}
              onChange={setFavoriteStores}
              staticOptions={COMMON_STORES}
              allowCustom
              placeholder="Search or type stores..."
              color="green"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
              <SmartTagPicker
                label="Budget Tier"
                values={budgetTier}
                onChange={setBudgetTier}
                enumType="budget_tier"
                singleSelect
                placeholder="Select..."
                color="green"
              />
              <div>
                <label htmlFor="max_budget" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                  Max Budget (per gift)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 md:top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    id="max_budget"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full min-h-11 md:min-h-12 pl-8 pr-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="100.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="max_purchased_budget" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Max Total Budget (all gifts combined)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 md:top-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="max_purchased_budget"
                  value={maxPurchasedBudget}
                  onChange={(e) => setMaxPurchasedBudget(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full min-h-11 md:min-h-12 pl-8 pr-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="500.00"
                />
              </div>
            </div>
          </div>

          {/* Gift Guidelines */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2">Gift Guidelines</h2>

            <SmartTagPicker
              label="Gift Styles"
              values={giftStyles}
              onChange={setGiftStyles}
              enumType="gift_style"
              placeholder="What kind of gifts do they like?"
              color="purple"
            />

            <SmartTagPicker
              label="Gift Do's"
              values={giftDos}
              onChange={setGiftDos}
              allowCustom
              placeholder="Type things they love..."
              color="green"
            />

            <SmartTagPicker
              label="Gift Don'ts"
              values={giftDonts}
              onChange={setGiftDonts}
              enumType="avoid_category"
              allowCustom
              placeholder="Select or type things to avoid..."
              color="rose"
            />

            <SmartTagPicker
              label="Restrictions & Allergies"
              values={restrictions}
              onChange={setRestrictions}
              staticOptions={COMMON_RESTRICTIONS}
              allowCustom
              placeholder="Select or type restrictions..."
              color="amber"
            />

            <div>
              <label htmlFor="items_already_owned" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Items Already Owned
              </label>
              <textarea
                id="items_already_owned"
                value={itemsAlreadyOwned}
                onChange={(e) => setItemsAlreadyOwned(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="List items they already have to avoid duplicates..."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Any other important information..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 h-11 md:h-12 px-6 py-3 bg-purple-600 text-white rounded-lg text-sm md:text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/recipients/${params.id}`}
              className="w-full sm:w-auto h-11 md:h-12 flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm md:text-base hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
