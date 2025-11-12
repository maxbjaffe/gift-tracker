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
  price: number | null;
  store: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-gray-600">Loading gift details...</div>
        </div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600">{error || 'Gift not found'}</div>
          <Link href="/gifts" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gifts" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to Gifts
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{gift.name}</h1>
              <div className="flex gap-2 items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  gift.status === 'idea' ? 'bg-blue-100 text-blue-700' :
                  gift.status === 'purchased' ? 'bg-green-100 text-green-700' :
                  gift.status === 'wrapped' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {gift.status}
                </span>
                {gift.price && (
                  <span className="text-2xl font-bold text-purple-600">
                    ${gift.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/gifts/${params.id}/edit`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Gift Details */}
          <div className="space-y-6">
            {/* Image */}
            {gift.image_url && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <img
                  src={gift.image_url}
                  alt={gift.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Details</h2>
              
              {gift.brand && (
                <div>
                  <div className="text-sm text-gray-500">Brand</div>
                  <div className="text-gray-900">{gift.brand}</div>
                </div>
              )}
              
              {gift.store && (
                <div>
                  <div className="text-sm text-gray-500">Store</div>
                  <div className="text-gray-900">{gift.store}</div>
                </div>
              )}
              
              {gift.category && (
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="text-gray-900">{gift.category}</div>
                </div>
              )}
              
              {gift.url && (
                <div>
                  <div className="text-sm text-gray-500">Product Link</div>
                  <a
                    href={gift.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 break-all"
                  >
                    View Product →
                  </a>
                </div>
              )}
              
              <div>
                <div className="text-sm text-gray-500">Added</div>
                <div className="text-gray-900">
                  {new Date(gift.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Description */}
            {gift.description && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{gift.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Recipients */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Gift For ({linkedRecipients.length})
                </h2>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  disabled={actionLoading}
                >
                  + Add Recipient
                </button>
              </div>

              {linkedRecipients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No recipients assigned yet.</p>
                  <p className="text-sm mt-2">Click "Add Recipient" to assign this gift.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between p-4 bg-purple-50 rounded-lg"
                    >
                      <div>
                        <Link
                          href={`/recipients/${recipient.id}`}
                          className="font-medium text-gray-900 hover:text-purple-600"
                        >
                          {recipient.name}
                        </Link>
                        {recipient.relationship && (
                          <div className="text-sm text-gray-500">{recipient.relationship}</div>
                        )}
                      </div>
                      <button
                        onClick={() => unlinkRecipient(recipient.id)}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
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
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Add Recipient</h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableRecipients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>All recipients are already linked to this gift.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRecipients.map((recipient) => (
                    <button
                      key={recipient.id}
                      onClick={() => linkRecipient(recipient.id)}
                      disabled={actionLoading}
                      className="w-full text-left p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">{recipient.name}</div>
                      {recipient.relationship && (
                        <div className="text-sm text-gray-500">{recipient.relationship}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t">
              <button
                onClick={() => setShowLinkModal(false)}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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