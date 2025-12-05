'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GiftStashNav } from '@/components/GiftStashNav';
import Avatar from '@/components/Avatar';
import { RecipientModal } from '@/components/RecipientModal';
import { BulkRecipientModal } from '@/components/BulkRecipientModal';
import { RecipientBudgetSummary } from '@/components/RecipientBudgetSummary';
import { Button } from '@/components/ui/button';
import { Pencil, Users } from 'lucide-react';
import { logger } from '@/lib/logger';

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
  birthday: string | null;
  age_range: string | null;
  interests: any;
  avatar_type?: 'ai' | 'emoji' | 'initials' | 'photo' | null;
  avatar_data?: string | null;
  avatar_background?: string | null;
};

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  useEffect(() => {
    fetchRecipients();
  }, []);

  async function fetchRecipients() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .order('name');

      if (error) {
        logger.error('Error fetching recipients:', error);
      } else {
        setRecipients(data || []);
      }
    } catch (err) {
      logger.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatInterests = (interests: any) => {
    if (!interests) return null;
    if (Array.isArray(interests)) {
      return interests.join(', ');
    }
    return String(interests);
  };

  if (loading) {
    return (
      <>
        <GiftStashNav />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-giftstash-orange mx-auto"></div>
              <p className="mt-4 text-sm md:text-base text-gray-600">Loading recipients...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl lg:text-4xl">👥</span>
              Recipients
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Manage the people you're buying gifts for
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              variant="outline"
              className="w-full sm:w-auto text-sm md:text-base whitespace-nowrap h-button-md px-4 md:px-6 font-semibold border-2"
            >
              <Users className="h-4 w-4 mr-2" />
              Add Multiple
            </Button>
            <Button
              onClick={() => {
                setSelectedRecipient(null);
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light shadow-lg hover:shadow-xl text-sm md:text-base whitespace-nowrap h-button-md px-4 md:px-6 font-semibold"
            >
              + Add Recipient
            </Button>
          </div>
        </div>

        {recipients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="text-5xl md:text-6xl lg:text-7xl mb-4">🎁</div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Let's Get Started!
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-8 max-w-md mx-auto">
                Add someone special to start tracking the perfect gifts for them. The more details you add, the better our AI can help you find amazing gift ideas.
              </p>
              <Button
                onClick={() => {
                  setSelectedRecipient(null);
                  setIsModalOpen(true);
                }}
                className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue hover:from-giftstash-orange-light hover:to-giftstash-blue-light text-sm md:text-base h-button-md px-6 md:px-8 font-semibold"
              >
                Add Your First Recipient
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 text-center">
                💡 Quick Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                    Add Interests
                  </h4>
                  <p className="text-xs md:text-sm text-gray-700">
                    Share their hobbies, favorite brands, and what they love. This helps our AI generate personalized gift ideas.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                    Set a Budget
                  </h4>
                  <p className="text-xs md:text-sm text-gray-700">
                    Define your spending range to get gift suggestions that match your budget perfectly.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="text-2xl mb-2">🤖</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                    Use AI Recommendations
                  </h4>
                  <p className="text-xs md:text-sm text-gray-700">
                    Once you add a recipient, our AI will suggest thoughtful gifts based on their unique profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 md:p-5 lg:p-6 group relative"
              >
                {/* Edit Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecipient(recipient);
                    setIsModalOpen(true);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Link href={`/recipients/${recipient.id}`} className="block">
                  <div className="flex justify-center mb-3 md:mb-4">
                    <Avatar
                      type={recipient.avatar_type ?? undefined}
                      data={recipient.avatar_data ?? undefined}
                      background={recipient.avatar_background ?? undefined}
                      name={recipient.name}
                      size="lg"
                      showBorder
                    />
                  </div>

                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-center text-gray-900 mb-2 group-hover:text-giftstash-orange transition-colors">
                    {recipient.name}
                  </h2>

                  {recipient.relationship && (
                    <p className="text-center text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                      {recipient.relationship}
                    </p>
                  )}

                  <div className="space-y-2 text-xs md:text-sm">
                    {recipient.age_range && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span>🎂</span>
                        <span>Age: {recipient.age_range}</span>
                      </div>
                    )}

                    {recipient.interests && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <span className="mt-0.5">🎨</span>
                        <span className="flex-1">{formatInterests(recipient.interests)}</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Budget Summary (outside Link to prevent navigation issues) */}
                <RecipientBudgetSummary recipientId={recipient.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipient Modal */}
      <RecipientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecipient(null);
        }}
        onSuccess={() => {
          fetchRecipients();
        }}
        recipient={selectedRecipient}
      />

      {/* Bulk Recipient Modal */}
      <BulkRecipientModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          fetchRecipients();
        }}
      />
      </div>
    </>
  );
}