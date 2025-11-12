// src/app/recipients/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
  birthday: string | null;
  age_range: string | null;
  interests: string | null;
  preferences: string | null;
  allergies: string | null;
  sizes: string | null;
  already_owns: string | null;
};

export default function EditRecipientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthday: '',
    age_range: '',
    interests: '',
    preferences: '',
    allergies: '',
    sizes: '',
    already_owns: '',
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
        interests: data.interests || '',
        preferences: data.preferences || '',
        allergies: data.allergies || '',
        sizes: data.sizes || '',
        already_owns: data.already_owns || '',
      });
      
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
      const updateData = {
        name: formData.name,
        relationship: formData.relationship || null,
        birthday: formData.birthday || null,
        age_range: formData.age_range || null,
        interests: formData.interests || null,
        preferences: formData.preferences || null,
        allergies: formData.allergies || null,
        sizes: formData.sizes || null,
        already_owns: formData.already_owns || null,
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
      <div className="max-w-2xl mx-auto">
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

          {/* Relationship */}
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

          {/* Interests */}
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
              Interests & Hobbies
            </label>
            <textarea
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., reading, gardening, photography"
            />
          </div>

          {/* Gift Preferences */}
          <div>
            <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
              Gift Preferences
            </label>
            <textarea
              id="preferences"
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="What kind of gifts do they like? Favorite colors, styles, etc."
            />
          </div>

          {/* Allergies */}
          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
              Allergies & Restrictions
            </label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Food allergies, dietary restrictions, sensitivities..."
            />
          </div>

          {/* Sizes */}
          <div>
            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-2">
              Clothing Sizes
            </label>
            <input
              type="text"
              id="sizes"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Shirt: M, Pants: 32x30, Shoes: 9"
            />
          </div>

          {/* Already Owns */}
          <div>
            <label htmlFor="already_owns" className="block text-sm font-medium text-gray-700 mb-2">
              Already Owns
            </label>
            <textarea
              id="already_owns"
              name="already_owns"
              value={formData.already_owns}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="List items they already have to avoid duplicates..."
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