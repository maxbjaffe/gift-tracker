// src/app/gifts/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Gift = {
  id: string;
  name: string;
  url: string | null;
  current_price: number | null;
  original_price: number | null;
  store: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
  occasion: string | null;
  occasion_date: string | null;
  notes: string | null;
};

export default function EditGiftPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    current_price: '',
    original_price: '',
    store: '',
    brand: '',
    category: '',
    description: '',
    image_url: '',
    status: 'idea',
    occasion: '',
    occasion_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchGift();
  }, [params.id]);

  async function fetchGift() {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      
      setGift(data);
      setFormData({
        name: data.name || '',
        url: data.url || '',
        current_price: data.current_price?.toString() || '',
        original_price: data.original_price?.toString() || '',
        store: data.store || '',
        brand: data.brand || '',
        category: data.category || '',
        description: data.description || '',
        image_url: data.image_url || '',
        status: data.status || 'idea',
        occasion: data.occasion || '',
        occasion_date: data.occasion_date || '',
        notes: data.notes || '',
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching gift:', err);
      setError('Failed to load gift');
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
        url: formData.url || null,
        current_price: formData.current_price ? parseFloat(formData.current_price) : null,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        store: formData.store || null,
        brand: formData.brand || null,
        category: formData.category || null,
        description: formData.description || null,
        image_url: formData.image_url || null,
        status: formData.status,
        occasion: formData.occasion || null,
        occasion_date: formData.occasion_date || null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('gifts')
        .update(updateData)
        .eq('id', params.id);

      if (error) throw error;

      router.push(`/gifts/${params.id}`);
    } catch (err: any) {
      console.error('Error updating gift:', err);
      setError(err.message || 'Failed to update gift');
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
          <div className="text-gray-600">Loading gift details...</div>
        </div>
      </div>
    );
  }

  if (error && !gift) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-red-600">{error}</div>
          <Link href="/gifts" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
            ← Back to Gifts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-6 px-4 md:py-8 md:px-6 lg:py-12 lg:px-8">
      <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link href={`/gifts/${params.id}`} className="text-purple-600 hover:text-purple-700 mb-4 inline-block text-sm md:text-base">
            ← Back to Gift
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Edit Gift</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              Gift Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Wireless Headphones"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full h-11 md:h-12 px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="idea">Idea</option>
              <option value="purchased">Purchased</option>
            </select>
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
            <div>
              <label htmlFor="current_price" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Current Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 md:top-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="current_price"
                  name="current_price"
                  value={formData.current_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full min-h-11 md:min-h-12 pl-8 pr-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="99.99"
                />
              </div>
            </div>

            <div>
              <label htmlFor="original_price" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Original Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 md:top-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="original_price"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full min-h-11 md:min-h-12 pl-8 pr-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="129.99"
                />
              </div>
            </div>
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Store and Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
            <div>
              <label htmlFor="store" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Store
              </label>
              <input
                type="text"
                id="store"
                name="store"
                value={formData.store}
                onChange={handleChange}
                className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Amazon, Target"
              />
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Sony, Apple"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full h-11 md:h-12 px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a category...</option>
              {GIFT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Occasion Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
            <div>
              <label htmlFor="occasion" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Occasion
              </label>
              <input
                type="text"
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Birthday, Christmas"
              />
            </div>

            <div>
              <label htmlFor="occasion_date" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Occasion Date
              </label>
              <input
                type="date"
                id="occasion_date"
                name="occasion_date"
                value={formData.occasion_date}
                onChange={handleChange}
                className="w-full min-h-11 md:min-h-12 px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Product description..."
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 md:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Additional notes about this gift..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 h-11 md:h-12 px-6 py-3 bg-purple-600 text-white rounded-lg text-sm md:text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/gifts/${params.id}`}
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