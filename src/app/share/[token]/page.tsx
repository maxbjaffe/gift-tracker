// Public gift list share page - accessible without login
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import Image from 'next/image';

type Recipient = Database['public']['Tables']['recipients']['Row'];
type Gift = Database['public']['Tables']['gifts']['Row'];
type GiftRecipient = Database['public']['Tables']['gift_recipients']['Row'];

interface GiftWithDetails extends GiftRecipient {
  gift: Gift;
}

// Create public Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [gifts, setGifts] = useState<GiftWithDetails[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimName, setClaimName] = useState('');
  const [claimEmail, setClaimEmail] = useState('');

  useEffect(() => {
    loadSharedList();
  }, [token]);

  async function loadSharedList() {
    try {
      setLoading(true);
      setError(null);

      // Get recipient by share token
      const { data: recipientData, error: recipientError } = await supabase
        .from('recipients')
        .select('*')
        .eq('share_token', token)
        .eq('share_enabled', true)
        .single();

      if (recipientError || !recipientData) {
        setError('Gift list not found or sharing has been disabled');
        return;
      }

      // Check if expired
      if (recipientData.share_expires_at && new Date(recipientData.share_expires_at) < new Date()) {
        setError('This shared gift list has expired');
        return;
      }

      setRecipient(recipientData);

      // Get gifts for this recipient
      const { data: giftsData, error: giftsError } = await supabase
        .from('gift_recipients')
        .select(`
          *,
          gift:gifts(*)
        `)
        .eq('recipient_id', recipientData.id)
        .order('created_at', { ascending: false });

      if (giftsError) {
        console.error('Error loading gifts:', giftsError);
        setError('Failed to load gift items');
        return;
      }

      // @ts-ignore - Supabase typing issue
      setGifts(giftsData as GiftWithDetails[]);

      // Track view (anonymously)
      trackView(recipientData.id);
    } catch (err) {
      console.error('Error loading shared list:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function trackView(recipientId: string) {
    try {
      // Simple anonymous tracking
      await fetch('/api/share-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
    } catch (err) {
      // Silently fail - tracking is not critical
      console.error('Failed to track view:', err);
    }
  }

  async function handleClaim(giftRecipientId: string) {
    if (!claimName.trim()) {
      alert('Please enter your name to claim this item');
      return;
    }

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftRecipientId,
          claimedByName: claimName.trim(),
          claimedByEmail: claimEmail.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to claim item');
        return;
      }

      // Refresh the list
      await loadSharedList();
      setClaimingId(null);
      setClaimName('');
      setClaimEmail('');
      alert('Item claimed successfully!');
    } catch (err) {
      console.error('Error claiming item:', err);
      alert('An error occurred while claiming the item');
    }
  }

  async function handleUnclaim(giftRecipientId: string, claimedByEmail: string | null) {
    if (claimedByEmail && !confirm('Enter your email to verify you claimed this item')) {
      return;
    }

    const email = claimedByEmail ? prompt('Enter the email you used to claim this item:') : null;

    try {
      const url = new URL('/api/claims', window.location.origin);
      url.searchParams.set('giftRecipientId', giftRecipientId);
      if (email) url.searchParams.set('claimerEmail', email);

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to unclaim item');
        return;
      }

      // Refresh the list
      await loadSharedList();
      alert('Item unclaimed successfully!');
    } catch (err) {
      console.error('Error unclaiming item:', err);
      alert('An error occurred while unclaiming the item');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gift list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Gift List</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!recipient) {
    return null;
  }

  const availableGifts = gifts.filter(g => !g.claimed_by_name);
  const claimedGifts = gifts.filter(g => g.claimed_by_name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {recipient.avatar_url && (
              <Image
                src={recipient.avatar_url}
                alt={recipient.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{recipient.name}&apos;s Gift List</h1>
              <p className="text-gray-600">Click &quot;Reserve&quot; to claim a gift and prevent duplicates</p>
            </div>
          </div>

          {recipient.birthday && (
            <p className="text-gray-600 text-sm">
              🎂 Birthday: {new Date(recipient.birthday).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Available Gifts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Gifts</h2>
          {availableGifts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              All gifts have been reserved
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableGifts.map((giftRecipient) => (
                <div key={giftRecipient.id} className="bg-white rounded-lg shadow-lg p-6">
                  {giftRecipient.gift.image_url && (
                    <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={giftRecipient.gift.image_url}
                        alt={giftRecipient.gift.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-2">{giftRecipient.gift.name}</h3>
                  {giftRecipient.gift.description && (
                    <p className="text-gray-600 text-sm mb-3">{giftRecipient.gift.description}</p>
                  )}
                  {giftRecipient.gift.current_price && (
                    <p className="text-purple-600 font-semibold mb-3">
                      ${giftRecipient.gift.current_price.toFixed(2)}
                    </p>
                  )}
                  {giftRecipient.gift.url && (
                    <a
                      href={giftRecipient.gift.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mb-3 block"
                    >
                      View Product →
                    </a>
                  )}

                  {claimingId === giftRecipient.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Your name"
                        value={claimName}
                        onChange={(e) => setClaimName(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      />
                      <input
                        type="email"
                        placeholder="Your email (optional)"
                        value={claimEmail}
                        onChange={(e) => setClaimEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleClaim(giftRecipient.id)}
                          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setClaimingId(null)}
                          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setClaimingId(giftRecipient.id)}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold"
                    >
                      Reserve This Gift
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reserved Gifts */}
        {claimedGifts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reserved Gifts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claimedGifts.map((giftRecipient) => (
                <div key={giftRecipient.id} className="bg-white rounded-lg shadow-lg p-6 opacity-60">
                  {giftRecipient.gift.image_url && (
                    <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={giftRecipient.gift.image_url}
                        alt={giftRecipient.gift.name}
                        fill
                        className="object-cover filter grayscale"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
                          RESERVED
                        </span>
                      </div>
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-2">{giftRecipient.gift.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">
                    Reserved by {giftRecipient.claimed_by_name}
                  </p>
                  <button
                    onClick={() => handleUnclaim(giftRecipient.id, giftRecipient.claimed_by_email)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Unreserve (if you claimed this)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by GiftStash</p>
          <p className="mt-2">
            Want to create your own gift list?{' '}
            <a href="/" className="text-purple-600 hover:underline">
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
