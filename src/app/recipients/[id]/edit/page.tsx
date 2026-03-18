'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Recipient } from '@/types/database.types';
import AvatarSelector from '@/components/AvatarSelector';
import type { AvatarData } from '@/lib/avatar-utils';
import { generateDefaultAvatar } from '@/lib/avatar-utils';
import { SmartTagPicker } from '@/components/ui/SmartTagPicker';
import { useProfileHub } from '@/lib/hooks/useProfileHub';

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

  // Gift-specific fields
  const [giftPreferences, setGiftPreferences] = useState('');
  const [itemsAlreadyOwned, setItemsAlreadyOwned] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [maxPurchasedBudget, setMaxPurchasedBudget] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [budgetTier, setBudgetTier] = useState<string[]>([]);
  const [giftStyles, setGiftStyles] = useState<string[]>([]);
  const [giftDos, setGiftDos] = useState<string[]>([]);
  const [giftDonts, setGiftDonts] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);

  // Profile Hub for the read-only header
  const { profile: profileHub } = useProfileHub(params.id, recipient);

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

      // Gift-specific fields
      setGiftPreferences(data.gift_preferences || '');
      setItemsAlreadyOwned(Array.isArray(data.items_already_owned) ? data.items_already_owned.join(', ') : '');
      setMaxBudget(data.max_budget?.toString() || '');
      setMaxPurchasedBudget(data.max_purchased_budget?.toString() || '');
      setTargetQuantity(data.target_quantity?.toString() || '1');
      setNotes(data.notes || '');
      setBudgetTier([]);
      setGiftStyles([]);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const itemsArray = itemsAlreadyOwned.split(',').map(s => s.trim()).filter(Boolean);

      const updateData = {
        gift_preferences: giftPreferences || null,
        gift_dos: giftDos.length > 0 ? giftDos : null,
        gift_donts: giftDonts.length > 0 ? giftDonts : null,
        restrictions: restrictions.length > 0 ? restrictions : null,
        items_already_owned: itemsArray.length > 0 ? itemsArray : null,
        max_budget: maxBudget ? parseFloat(maxBudget) : null,
        max_purchased_budget: maxPurchasedBudget ? parseFloat(maxPurchasedBudget) : null,
        target_quantity: targetQuantity ? parseInt(targetQuantity, 10) : 1,
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
          <div className="text-gray-600">Loading...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-6 px-4 md:py-8 md:px-6 lg:py-12 lg:px-8">
      <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link href={`/recipients/${params.id}`} className="text-purple-600 hover:text-purple-700 mb-4 inline-block text-sm md:text-base">
            ← Back to Recipient
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Gift Settings</h1>
          {recipient && (
            <div className="mt-2 flex items-center gap-3">
              <p className="text-sm md:text-base text-gray-600">
                {recipient.name} {recipient.relationship && `(${recipient.relationship})`}
              </p>
              {profileHub && (
                <a
                  href={profileHub.profileHubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  Edit general info in Profile Hub <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Avatar */}
          {recipient && (
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2">Avatar</h2>
              <AvatarSelector name={recipient.name} value={avatar} onChange={setAvatar} />
            </div>
          )}

          {/* Budget */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2">Budget</h2>

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

            {recipient?.profile_type && recipient.profile_type !== 'person' && (
              <div>
                <label htmlFor="target_quantity" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                  Keep on Hand
                </label>
                <input
                  type="number"
                  id="target_quantity"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(e.target.value)}
                  min="1"
                  max="20"
                  className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">How many gifts to keep ready for this scenario</p>
              </div>
            )}

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

          {/* Gift Preferences */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 border-b pb-2">Gift Guidelines</h2>

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
