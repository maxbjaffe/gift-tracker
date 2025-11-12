// src/app/recipients/[id]/edit/page.tsx - COMPLETELY REWRITTEN to match correct database schema
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Recipient } from '@/Types/database.types';
import AvatarSelector from '@/components/AvatarSelector';
import type { AvatarData } from '@/components/AvatarSelector';
import { generateDefaultAvatar } from '@/lib/avatar-utils';

export default function EditRecipientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();

  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<AvatarData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthday: '',
    age_range: '',
    gender: '',
    interests: '',
    hobbies: '',
    favorite_colors: '',
    favorite_brands: '',
    favorite_stores: '',
    gift_preferences: '',
    gift_dos: '',
    gift_donts: '',
    restrictions: '',
    items_already_owned: '',
    max_budget: '',
    notes: '',
  });

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
      setFormData({
        name: data.name || '',
        relationship: data.relationship || '',
        birthday: data.birthday || '',
        age_range: data.age_range || '',
        gender: data.gender || '',
        interests: Array.isArray(data.interests) ? data.interests.join(', ') : '',
        hobbies: Array.isArray(data.hobbies) ? data.hobbies.join(', ') : '',
        favorite_colors: Array.isArray(data.favorite_colors) ? data.favorite_colors.join(', ') : '',
        favorite_brands: Array.isArray(data.favorite_brands) ? data.favorite_brands.join(', ') : '',
        favorite_stores: Array.isArray(data.favorite_stores) ? data.favorite_stores.join(', ') : '',
        gift_preferences: data.gift_preferences || '',
        gift_dos: Array.isArray(data.gift_dos) ? data.gift_dos.join(', ') : '',
        gift_donts: Array.isArray(data.gift_donts) ? data.gift_donts.join(', ') : '',
        restrictions: Array.isArray(data.restrictions) ? data.restrictions.join(', ') : '',
        items_already_owned: Array.isArray(data.items_already_owned) ? data.items_already_owned.join(', ') : '',
        max_budget: data.max_budget?.toString() || '',
        notes: data.notes || '',
      });

      // Load avatar if exists, otherwise generate default
      if (data.avatar_type) {
        setAvatar({
          type: data.avatar_type,
          data: data.avatar_data || '',
          background: data.avatar_background || ''
        });
      } else {
        setAvatar(generateDefaultAvatar(data.name));
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
      // Convert comma-separated strings to arrays
      const interestsArray = formData.interests
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const hobbiesArray = formData.hobbies
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const favoriteColorsArray = formData.favorite_colors
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const favoriteBrandsArray = formData.favorite_brands
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const favoriteStoresArray = formData.favorite_stores
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const giftDosArray = formData.gift_dos
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const giftDontsArray = formData.gift_donts
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const restrictionsArray = formData.restrictions
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const itemsAlreadyOwnedArray = formData.items_already_owned
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const updateData = {
        name: formData.name,
        relationship: formData.relationship || null,
        birthday: formData.birthday || null,
        age_range: formData.age_range || null,
        gender: formData.gender || null,
        interests: interestsArray.length > 0 ? interestsArray : null,
        hobbies: hobbiesArray.length > 0 ? hobbiesArray : null,
        favorite_colors: favoriteColorsArray.length > 0 ? favoriteColorsArray : null,
        favorite_brands: favoriteBrandsArray.length > 0 ? favoriteBrandsArray : null,
        favorite_stores: favoriteStoresArray.length > 0 ? favoriteStoresArray : null,
        gift_preferences: formData.gift_preferences || null,
        gift_dos: giftDosArray.length > 0 ? giftDosArray : null,
        gift_donts: giftDontsArray.length > 0 ? giftDontsArray : null,
        restrictions: restrictionsArray.length > 0 ? restrictionsArray : null,
        items_already_owned: itemsAlreadyOwnedArray.length > 0 ? itemsAlreadyOwnedArray : null,
        max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null,
        notes: formData.notes || null,
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href={`/recipients/${params.id}`} className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to Recipient
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Edit Recipient</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., John Doe"
              />
            </div>

            {/* Avatar Selection */}
            {formData.name && avatar && (
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Avatar</h3>
                <AvatarSelector
                  name={formData.name}
                  currentAvatar={avatar}
                  onChange={setAvatar}
                />
              </div>
            )}

            {/* Relationship and Gender */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Spouse, Friend, Parent"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Birthday and Age Range */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday
                </label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="age_range" className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range
                </label>
                <select
                  id="age_range"
                  name="age_range"
                  value={formData.age_range}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select age range</option>
                  <option value="0-12">0-12 (Child)</option>
                  <option value="13-17">13-17 (Teen)</option>
                  <option value="18-24">18-24 (Young Adult)</option>
                  <option value="25-34">25-34 (Adult)</option>
                  <option value="35-44">35-44 (Adult)</option>
                  <option value="45-54">45-54 (Adult)</option>
                  <option value="55-64">55-64 (Adult)</option>
                  <option value="65+">65+ (Senior)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interests & Preferences Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Interests & Preferences</h2>

            {/* Interests */}
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., reading, traveling, photography"
              />
            </div>

            {/* Hobbies */}
            <div>
              <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700 mb-2">
                Hobbies (comma-separated)
              </label>
              <input
                type="text"
                id="hobbies"
                name="hobbies"
                value={formData.hobbies}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., gardening, cooking, gaming"
              />
            </div>

            {/* Favorite Colors */}
            <div>
              <label htmlFor="favorite_colors" className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Colors (comma-separated)
              </label>
              <input
                type="text"
                id="favorite_colors"
                name="favorite_colors"
                value={formData.favorite_colors}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., blue, green, purple"
              />
            </div>

            {/* Gift Preferences */}
            <div>
              <label htmlFor="gift_preferences" className="block text-sm font-medium text-gray-700 mb-2">
                Gift Preferences (general notes)
              </label>
              <textarea
                id="gift_preferences"
                name="gift_preferences"
                value={formData.gift_preferences}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="What types of gifts do they prefer? Any specific styles or themes?"
              />
            </div>
          </div>

          {/* Shopping Preferences Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Shopping Preferences</h2>

            {/* Favorite Stores */}
            <div>
              <label htmlFor="favorite_stores" className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Stores (comma-separated)
              </label>
              <input
                type="text"
                id="favorite_stores"
                name="favorite_stores"
                value={formData.favorite_stores}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Target, Amazon, Nordstrom"
              />
            </div>

            {/* Favorite Brands */}
            <div>
              <label htmlFor="favorite_brands" className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Brands (comma-separated)
              </label>
              <input
                type="text"
                id="favorite_brands"
                name="favorite_brands"
                value={formData.favorite_brands}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Apple, Nike, Lego"
              />
            </div>

            {/* Max Budget */}
            <div>
              <label htmlFor="max_budget" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Budget (per gift)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="max_budget"
                  name="max_budget"
                  value={formData.max_budget}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100.00"
                />
              </div>
            </div>
          </div>

          {/* Gift Guidelines Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Gift Guidelines</h2>

            {/* Gift Dos */}
            <div>
              <label htmlFor="gift_dos" className="block text-sm font-medium text-gray-700 mb-2">
                Gift Do's - Types of gifts they love (comma-separated)
              </label>
              <input
                type="text"
                id="gift_dos"
                name="gift_dos"
                value={formData.gift_dos}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., books, experiences, handmade items"
              />
            </div>

            {/* Gift Donts */}
            <div>
              <label htmlFor="gift_donts" className="block text-sm font-medium text-gray-700 mb-2">
                Gift Don'ts - Types of gifts to avoid (comma-separated)
              </label>
              <input
                type="text"
                id="gift_donts"
                name="gift_donts"
                value={formData.gift_donts}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., clothing, candles, gift cards"
              />
            </div>

            {/* Restrictions */}
            <div>
              <label htmlFor="restrictions" className="block text-sm font-medium text-gray-700 mb-2">
                Restrictions & Allergies (comma-separated)
              </label>
              <input
                type="text"
                id="restrictions"
                name="restrictions"
                value={formData.restrictions}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., nut allergies, gluten-free, vegan"
              />
            </div>

            {/* Items Already Owned */}
            <div>
              <label htmlFor="items_already_owned" className="block text-sm font-medium text-gray-700 mb-2">
                Items Already Owned (comma-separated)
              </label>
              <textarea
                id="items_already_owned"
                name="items_already_owned"
                value={formData.items_already_owned}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="List items they already have to avoid duplicates..."
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Any other important information..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/recipients/${params.id}`}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
