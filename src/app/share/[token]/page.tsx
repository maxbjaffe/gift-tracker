// Public gift list share page - accessible without login
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import Image from 'next/image';
import { ClaimGiftModal } from '@/components/ClaimGiftModal';
import { UnclaimGiftModal } from '@/components/UnclaimGiftModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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
  const [claimingGift, setClaimingGift] = useState<{ id: string; name: string } | null>(null);
  const [unclaimingGift, setUnclaimingGift] = useState<{ id: string; name: string; email: string | null } | null>(null);

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
        logger.error('Error loading gifts:', giftsError);
        setError('Failed to load gift items');
        return;
      }

      // @ts-ignore - Supabase typing issue
      setGifts(giftsData as GiftWithDetails[]);

      // Track view (anonymously)
      trackView(recipientData.id);
    } catch (err) {
      logger.error('Error loading shared list:', err);
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
      logger.error('Failed to track view:', err);
    }
  }

  async function handleClaim(giftRecipientId: string, name: string, email: string) {
    const response = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        giftRecipientId,
        claimedByName: name,
        claimedByEmail: email || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reserve gift');
    }

    // Refresh the list
    await loadSharedList();
  }

  async function handleUnclaim(giftRecipientId: string, email: string | null) {
    try {
      const url = new URL('/api/claims', window.location.origin);
      url.searchParams.set('giftRecipientId', giftRecipientId);
      if (email) url.searchParams.set('claimerEmail', email);

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unreserve item');
      }

      // Refresh the list
      await loadSharedList();
      toast.success('Gift unreserved successfully!');
    } catch (err) {
      logger.error('Error unclaiming item:', err);
      throw err;
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

                  <Button
                    onClick={() => setClaimingGift({ id: giftRecipient.id, name: giftRecipient.gift.name })}
                    className="w-full bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:shadow-lg h-button-md font-semibold"
                  >
                    Reserve This Gift
                  </Button>
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
                    onClick={() => setUnclaimingGift({
                      id: giftRecipient.id,
                      name: giftRecipient.gift.name,
                      email: giftRecipient.claimed_by_email
                    })}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Unreserve (if you reserved this)
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

        {/* Claim Modal */}
        {claimingGift && (
          <ClaimGiftModal
            isOpen={true}
            onClose={() => setClaimingGift(null)}
            giftName={claimingGift.name}
            giftRecipientId={claimingGift.id}
            onClaim={handleClaim}
          />
        )}

        {/* Unclaim Modal */}
        {unclaimingGift && (
          <UnclaimGiftModal
            isOpen={true}
            onClose={() => setUnclaimingGift(null)}
            giftName={unclaimingGift.name}
            giftRecipientId={unclaimingGift.id}
            claimedByEmail={unclaimingGift.email}
            onUnclaim={handleUnclaim}
          />
        )}
      </div>
    </div>
  );
}
