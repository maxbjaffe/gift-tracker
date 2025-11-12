'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function NewGiftPage() {
  const router = useRouter();
  
  const [productUrl, setProductUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    price: '',
    original_price: '',
    store: '',
    brand: '',
    category: '',
    description: '',
    image_url: '',
    status: 'Idea',
    purchase_date: '',
    notes: '',
  });

  const handleExtractFromUrl = async () => {
    if (!productUrl.trim()) {
      setError('Please enter a product URL');
      return;
    }

    setExtracting(true);
    setError(null);

    try {
      // Call our API endpoint to extract product info
      const response = await fetch('/api/extract-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: productUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract product information');
      }

      if (result.success && result.data) {
        // Auto-populate the form with extracted data
        setFormData(prev => ({
          ...prev,
          name: result.data.name || prev.name,
          url: productUrl,
          price: result.data.price?.toString() || prev.price,
          original_price: result.data.original_price?.toString() || prev.original_price,
          store: result.data.store || prev.store,
          brand: result.data.brand || prev.brand,
          category: result.data.category || prev.category,
          description: result.data.description || prev.description,
          image_url: result.data.image_url || prev.image_url,
        }));

        // Clear the URL input
        setProductUrl('');
        
        alert('✨ Product details extracted successfully! Review and edit as needed.');
      }
    } catch (err) {
      console.error('Error extracting product info:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract product information. Please try filling in manually.');
    } finally {
      setExtracting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const giftData = {
        name: formData.name,
        url: formData.url || null,
        price: formData.price ? parseFloat(formData.price) : null,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        store: formData.store || null,
        brand: formData.brand || null,
        category: formData.category || null,
        description: formData.description || null,
        image_url: formData.image_url || null,
        status: formData.status,
        purchase_date: formData.purchase_date || null,
        notes: formData.notes || null,
      };

      const { data, error: insertError } = await supabase
        .from('gifts')
        .insert([giftData])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Gift created successfully:', data);
      router.push('/gifts');
    } catch (err) {
      console.error('Error creating gift:', err);
      setError(err instanceof Error ? err.message : 'Failed to create gift');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/gifts')}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Gifts
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Gift</h1>
          <p className="text-gray-600">Add a gift idea or purchase to track</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* AI URL Extraction Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-4xl">🤖</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Smart Gift Entry</h2>
              <p className="text-purple-100 mb-4">
                Paste a product URL and let AI extract all the details automatically
              </p>
              
              <div className="flex gap-3">
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.amazon.com/product..."
                  className="flex-1 px-4 py-3 border-2 border-white/30 rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-transparent"
                  disabled={extracting}
                />
                <button
                  onClick={handleExtractFromUrl}
                  disabled={extracting}
                  className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {extracting ? 'Extracting...' : '✨ Extract Details'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gift Details</h2>
            
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Gift Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Wireless Headphones"
                />
              </div>

              {/* URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price
                  </label>
                  <input
                    type="number"
                    id="original_price"
                    name="original_price"
                    step="0.01"
                    value={formData.original_price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-sm text-gray-500">If on sale</p>
                </div>
              </div>

              {/* Store and Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-2">
                    Store/Retailer
                  </label>
                  <input
                    type="text"
                    id="store"
                    name="store"
                    value={formData.store}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Amazon, Target"
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Sony, Nike"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Electronics, Clothing, Books"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Product description..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              {/* Status and Purchase Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Idea">💡 Idea</option>
                    <option value="Purchased">🛍️ Purchased</option>
                    <option value="Wrapped">🎁 Wrapped</option>
                    <option value="Given">✅ Given</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    id="purchase_date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/gifts')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : '🎁 Save Gift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}