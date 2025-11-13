// src/app/gifts/[id]/page.tsx - UPDATED with Edit/Delete functionality
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
  created_at: string;
};

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
};

type GiftRecipient = {
  recipient_id: string;
  recipients: Recipient;
};

export default function GiftDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [gift, setGift] = useState<Gift | null>(null);
  const [linkedRecipients, setLinkedRecipients] = useState<Recipient[]>([]);
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGiftData();
    fetchAllRecipients();
  }, [params.id]);

  async function fetchGiftData() {
    try {
      // Fetch gift details
      const { data: giftData, error: giftError } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (giftError) throw giftError;
      setGift(giftData);

      // Fetch linked recipients
      const { data: linkData, error: linkError } = await supabase
        .from('gift_recipients')
        .select(`
          recipient_id,
          recipients (
            id,
            name,
            relationship
          )
        `)
        .eq('gift_id', params.id);

      if (linkError) throw linkError;
      
      const recipients = linkData.map((item: GiftRecipient) => item.recipients);
      setLinkedRecipients(recipients);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching gift:', err);
      setError('Failed to load gift details');
      setLoading(false);
    }
  }

  async function fetchAllRecipients() {
    try {
      const { data, error } = await supabase
        .from('recipients')
        .select('id, name, relationship')
        .order('name');

      if (error) throw error;
      setAllRecipients(data || []);
    } catch (err) {
      console.error('Error fetching recipients:', err);
    }
  }

  async function linkRecipient(recipientId: string) {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('gift_recipients')
        .insert({
          gift_id: params.id,
          recipient_id: recipientId,
        });

      if (error) throw error;
      
      await fetchGiftData();
      setShowLinkModal(false);
    } catch (err: any) {
      console.error('Error linking recipient:', err);
      alert(err.message || 'Failed to link recipient');
    } finally {
      setActionLoading(false);
    }
  }

  async function unlinkRecipient(recipientId: string) {
    if (!confirm('Remove this recipient from this gift?')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('gift_recipients')
        .delete()
        .eq('gift_id', params.id)
        .eq('recipient_id', recipientId);

      if (error) throw error;
      
      await fetchGiftData();
    } catch (err: any) {
      console.error('Error unlinking recipient:', err);
      alert(err.message || 'Failed to unlink recipient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${gift?.name}"? This will also remove all recipient assignments. This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      // First delete all gift-recipient links
      const { error: linkError } = await supabase
        .from('gift_recipients')
        .delete()
        .eq('gift_id', params.id);

      if (linkError) throw linkError;

      // Then delete the gift
      const { error: giftError } = await supabase
        .from('gifts')
        .delete()
        .eq('id', params.id);

      if (giftError) throw giftError;

      router.push('/gifts');
    } catch (err: any) {
      console.error('Error deleting gift:', err);
      alert(err.message || 'Failed to delete gift');
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm md:text-base text-gray-600">Loading gift details...</div>
        </div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm md:text-base text-red-600">{error || 'Gift not found'}</div>
          <Link href="/gifts" className="text-sm md:text-base text-purple-600 hover:text-purple-700 mt-4 inline-block">
            ← Back to Gifts
          </Link>
        </div>
      </div>
    );
  }

  const availableRecipients = allRecipients.filter(
    (recipient) => !linkedRecipients.some((linked) => linked.id === recipient.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 space-y-4 md:space-y-6">
          <Link href="/gifts" className="text-sm md:text-base text-purple-600 hover:text-purple-700 inline-block">
            ← Back to Gifts
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 break-words">{gift.name}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                  gift.status === 'idea' ? 'bg-blue-100 text-blue-700' :
                  gift.status === 'purchased' ? 'bg-green-100 text-green-700' :
                  gift.status === 'wrapped' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {gift.status}
                </span>
                {gift.current_price && (
                  <span className="text-xl md:text-2xl font-bold text-purple-600">
                    ${gift.current_price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href={`/gifts/${params.id}/edit`}
                className="flex-1 sm:flex-none px-4 h-11 md:h-12 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm md:text-base"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 sm:flex-none px-4 h-11 md:h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - Gift Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Image */}
            {gift.image_url && (
              <div className="bg-white rounded-xl shadow-sm p-3 md:p-4">
                <img
                  src={gift.image_url}
                  alt={gift.name}
                  className="w-full h-48 md:h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 lg:p-6 space-y-3 md:space-y-4">
              <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">Details</h2>

              {gift.brand && (
                <div>
                  <div className="text-xs md:text-sm text-gray-500">Brand</div>
                  <div className="text-sm md:text-base text-gray-900">{gift.brand}</div>
                </div>
              )}

              {gift.store && (
                <div>
                  <div className="text-xs md:text-sm text-gray-500">Store</div>
                  <div className="text-sm md:text-base text-gray-900">{gift.store}</div>
                </div>
              )}

              {gift.category && (
                <div>
                  <div className="text-xs md:text-sm text-gray-500">Category</div>
                  <div className="text-sm md:text-base text-gray-900">{gift.category}</div>
                </div>
              )}

              {gift.url && (
                <div>
                  <div className="text-xs md:text-sm text-gray-500">Product Link</div>
                  <a
                    href={gift.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm md:text-base text-purple-600 hover:text-purple-700 break-all"
                  >
                    View Product →
                  </a>
                </div>
              )}

              <div>
                <div className="text-xs md:text-sm text-gray-500">Added</div>
                <div className="text-sm md:text-base text-gray-900">
                  {new Date(gift.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Description */}
            {gift.description && (
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 lg:p-6">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">{gift.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Recipients */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">
                  Gift For ({linkedRecipients.length})
                </h2>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="w-full sm:w-auto px-4 h-11 md:h-12 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs md:text-sm whitespace-nowrap flex items-center justify-center"
                  disabled={actionLoading}
                >
                  + Add Recipient
                </button>
              </div>

              {linkedRecipients.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <p className="text-sm md:text-base">No recipients assigned yet.</p>
                  <p className="text-xs md:text-sm mt-2">Click "Add Recipient" to assign this gift.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 bg-purple-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/recipients/${recipient.id}`}
                          className="text-sm md:text-base font-medium text-gray-900 hover:text-purple-600"
                        >
                          {recipient.name}
                        </Link>
                        {recipient.relationship && (
                          <div className="text-xs md:text-sm text-gray-500">{recipient.relationship}</div>
                        )}
                      </div>
                      <button
                        onClick={() => unlinkRecipient(recipient.id)}
                        disabled={actionLoading}
                        className="w-full sm:w-auto h-11 md:h-auto text-red-600 hover:text-red-700 text-xs md:text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Link Recipient Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 md:p-6 border-b">
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">Add Recipient</h3>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              {availableRecipients.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <p className="text-sm md:text-base">All recipients are already linked to this gift.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRecipients.map((recipient) => (
                    <button
                      key={recipient.id}
                      onClick={() => linkRecipient(recipient.id)}
                      disabled={actionLoading}
                      className="w-full text-left p-3 md:p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <div className="text-sm md:text-base font-medium text-gray-900">{recipient.name}</div>
                      {recipient.relationship && (
                        <div className="text-xs md:text-sm text-gray-500">{recipient.relationship}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t">
              <button
                onClick={() => setShowLinkModal(false)}
                disabled={actionLoading}
                className="w-full px-4 h-11 md:h-12 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}