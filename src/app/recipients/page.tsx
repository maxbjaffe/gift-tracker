'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/Avatar';
import { RecipientModal } from '@/components/RecipientModal';
import { BulkRecipientModal } from '@/components/BulkRecipientModal';
import { RecipientBudgetSummary } from '@/components/RecipientBudgetSummary';
import { Button } from '@/components/ui/button';
import { Pencil, Users } from 'lucide-react';
import { logger } from '@/lib/logger';
import { parseLocalDate } from '@/lib/utils/age';
import { getUpcomingHolidays } from '@/lib/utils/holidays';

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
  birthday: string | null;
  age_range: string | null;
  interests: any;
  important_dates: any;
  avatar_type?: 'ai' | 'emoji' | 'initials' | 'photo' | null;
  avatar_data?: string | null;
  avatar_background?: string | null;
};

interface NextOccasion {
  label: string;
  daysUntil: number;
}

function getNextOccasion(recipient: Recipient): NextOccasion | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let best: NextOccasion | null = null;

  // Check birthday
  if (recipient.birthday) {
    const bd = parseLocalDate(recipient.birthday);
    const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
    if (thisYear < today) thisYear.setFullYear(thisYear.getFullYear() + 1);
    const days = Math.round((thisYear.getTime() - today.getTime()) / 86400000);
    if (days <= 150) {
      best = { label: 'Birthday', daysUntil: days };
    }
  }

  // Check important_dates
  if (Array.isArray(recipient.important_dates)) {
    for (const d of recipient.important_dates as { label: string; date: string; repeats: boolean }[]) {
      const date = parseLocalDate(d.date);
      let target = new Date(today.getFullYear(), date.getMonth(), date.getDate());
      if (target < today && d.repeats) target.setFullYear(target.getFullYear() + 1);
      if (target < today) continue;
      const days = Math.round((target.getTime() - today.getTime()) / 86400000);
      if (days <= 150 && (!best || days < best.daysUntil)) {
        best = { label: d.label, daysUntil: days };
      }
    }
  }

  return best;
}

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
        setRecipients((data || []) as Recipient[]);
      }
    } catch (err) {
      logger.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Sort recipients by next occasion soonest
  const sortedRecipients = useMemo(() => {
    return [...recipients].sort((a, b) => {
      const aOcc = getNextOccasion(a);
      const bOcc = getNextOccasion(b);
      if (aOcc && bOcc) return aOcc.daysUntil - bOcc.daysUntil;
      if (aOcc) return -1;
      if (bOcc) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [recipients]);

  const formatInterests = (interests: any): string[] => {
    if (!interests) return [];
    if (Array.isArray(interests)) return interests;
    return [String(interests)];
  };

  if (loading) {
    return (
      <div className="p-3 md:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-giftstash-orange mx-auto"></div>
            <p className="mt-4 text-sm md:text-base text-gray-600">Loading recipients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Recipients
            </h1>
            <p className="text-xs text-gray-500">
              {recipients.length} {recipients.length === 1 ? 'person' : 'people'}
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              variant="outline"
              className="flex-1 md:flex-none text-sm h-9 px-3 font-medium"
            >
              <Users className="h-4 w-4 mr-1.5" />
              Add Multiple
            </Button>
            <Button
              onClick={() => {
                setSelectedRecipient(null);
                setIsModalOpen(true);
              }}
              className="flex-1 md:flex-none bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-sm h-9 px-3 font-medium"
            >
              + Add Recipient
            </Button>
          </div>
        </div>

        {recipients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎁</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Let's Get Started!
              </h2>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Add someone special to start tracking the perfect gifts for them.
              </p>
              <Button
                onClick={() => {
                  setSelectedRecipient(null);
                  setIsModalOpen(true);
                }}
                className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue text-sm h-10 px-6 font-medium"
              >
                Add Your First Recipient
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedRecipients.map((recipient) => {
              const occasion = getNextOccasion(recipient);
              const interests = formatInterests(recipient.interests);
              const showInterests = interests.slice(0, 3);
              const moreCount = interests.length - 3;

              return (
                <div
                  key={recipient.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3 group relative"
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
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  <Link href={`/recipients/${recipient.id}`} className="block">
                    <div className="flex items-center gap-3">
                      <Avatar
                        type={recipient.avatar_type ?? undefined}
                        data={recipient.avatar_data ?? undefined}
                        background={recipient.avatar_background ?? undefined}
                        name={recipient.name}
                        size="md"
                        showBorder
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-gray-900 truncate group-hover:text-giftstash-orange transition-colors">
                          {recipient.name}
                        </h2>
                        {recipient.relationship && (
                          <p className="text-xs text-gray-500 truncate">{recipient.relationship}</p>
                        )}
                        {occasion && (
                          <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            occasion.daysUntil <= 14
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : occasion.daysUntil <= 30
                                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}>
                            {occasion.label} in {occasion.daysUntil}d
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interests — capped at 3 */}
                    {showInterests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {showInterests.map(item => (
                          <span key={item} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium">
                            {item}
                          </span>
                        ))}
                        {moreCount > 0 && (
                          <span className="px-1.5 py-0.5 text-gray-400 text-[10px] font-medium">
                            +{moreCount} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Empty profile prompt */}
                    {interests.length === 0 && !recipient.birthday && (
                      <p className="text-[10px] text-gray-400 mt-2 italic">Complete profile for better gift ideas</p>
                    )}
                  </Link>

                  {/* Budget Summary */}
                  <RecipientBudgetSummary recipientId={recipient.id} />
                </div>
              );
            })}
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
        recipient={selectedRecipient as any}
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
  );
}
