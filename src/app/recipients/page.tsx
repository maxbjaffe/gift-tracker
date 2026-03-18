'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/Avatar';
import { RecipientModal } from '@/components/RecipientModal';
import { OccasionProfileModal } from '@/components/OccasionProfileModal';
import { BulkRecipientModal } from '@/components/BulkRecipientModal';
import { RecipientBudgetSummary } from '@/components/RecipientBudgetSummary';
import { Button } from '@/components/ui/button';
import { Pencil, Users } from 'lucide-react';
import { logger } from '@/lib/logger';
import { parseLocalDate } from '@/lib/utils/age';
import { getPresetByType } from '@/lib/generic-profiles';

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
  birthday: string | null;
  age_range: string | null;
  interests: any;
  important_dates: any;
  profile_type?: string | null;
  max_budget?: number | null;
  avatar_type?: 'ai' | 'emoji' | 'initials' | 'photo' | null;
  avatar_data?: string | null;
  avatar_background?: string | null;
  notes?: string | null;
  gift_dos?: string[] | null;
  gift_donts?: string[] | null;
  target_quantity?: number | null;
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

function RecipientsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOccasionModalOpen, setIsOccasionModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [selectedOccasionProfile, setSelectedOccasionProfile] = useState<Recipient | null>(null);
  const [onHandCounts, setOnHandCounts] = useState<Record<string, number>>({});

  const activeTab = searchParams.get('tab') === 'occasions' ? 'occasions' : 'people';

  function setActiveTab(tab: 'people' | 'occasions') {
    router.replace(`/recipients${tab === 'occasions' ? '?tab=occasions' : ''}`, { scroll: false });
  }

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

  const peopleRecipients = useMemo(
    () => recipients.filter(r => !r.profile_type || r.profile_type === 'person'),
    [recipients]
  );

  const occasionRecipients = useMemo(
    () => recipients.filter(r => r.profile_type && r.profile_type !== 'person'),
    [recipients]
  );

  // Sort by next occasion soonest
  const sortedPeople = useMemo(() => {
    return [...peopleRecipients].sort((a, b) => {
      const aOcc = getNextOccasion(a);
      const bOcc = getNextOccasion(b);
      if (aOcc && bOcc) return aOcc.daysUntil - bOcc.daysUntil;
      if (aOcc) return -1;
      if (bOcc) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [peopleRecipients]);

  // Fetch on-hand counts for occasion profiles
  useEffect(() => {
    if (occasionRecipients.length === 0) return;
    const fetchOnHandCounts = async () => {
      try {
        const supabase = createClient();
        const ids = occasionRecipients.map(r => r.id);
        const { data, error } = await supabase
          .from('gift_recipients')
          .select('recipient_id')
          .in('recipient_id', ids)
          .in('status', ['purchased', 'wrapped']);
        if (error) {
          logger.error('Error fetching on-hand counts:', error);
          return;
        }
        const counts: Record<string, number> = {};
        for (const row of data || []) {
          counts[row.recipient_id] = (counts[row.recipient_id] || 0) + 1;
        }
        setOnHandCounts(counts);
      } catch (err) {
        logger.error('Error fetching on-hand counts:', err);
      }
    };
    fetchOnHandCounts();
  }, [occasionRecipients]);

  const sortedOccasions = useMemo(() => {
    return [...occasionRecipients].sort((a, b) => {
      const aOcc = getNextOccasion(a);
      const bOcc = getNextOccasion(b);
      if (aOcc && bOcc) return aOcc.daysUntil - bOcc.daysUntil;
      if (aOcc) return -1;
      if (bOcc) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [occasionRecipients]);

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
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {activeTab === 'people' ? (
              <>
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
              </>
            ) : (
              <Button
                onClick={() => {
                  setSelectedOccasionProfile(null);
                  setIsOccasionModalOpen(true);
                }}
                className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-pink-600 text-sm h-9 px-3 font-medium"
              >
                + Add Occasion Profile
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('people')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'people'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            People
            <span className="ml-1.5 text-xs text-gray-400">{peopleRecipients.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('occasions')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'occasions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Occasions
            <span className="ml-1.5 text-xs text-gray-400">{occasionRecipients.length}</span>
          </button>
        </div>

        {/* People Tab */}
        {activeTab === 'people' && (
          <>
            {peopleRecipients.length === 0 ? (
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
                {sortedPeople.map((recipient) => {
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
          </>
        )}

        {/* Occasions Tab */}
        {activeTab === 'occasions' && (
          <>
            {occasionRecipients.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🎯</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Occasion Profiles
                  </h2>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    Create gift profiles for recurring scenarios — teacher appreciation, kids' parties, coworker exchanges, and more. Get AI recommendations and keep gifts on-hand.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedOccasionProfile(null);
                      setIsOccasionModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-sm h-10 px-6 font-medium"
                  >
                    Create Your First Occasion Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {sortedOccasions.map((profile) => {
                  const occasion = getNextOccasion(profile);
                  const preset = getPresetByType(profile.profile_type || '');

                  return (
                    <div
                      key={profile.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3 group relative"
                    >
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOccasionProfile(profile);
                          setIsOccasionModalOpen(true);
                        }}
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Link href={`/recipients/${profile.id}`} className="block">
                        <div className="flex items-center gap-3">
                          <Avatar
                            type={profile.avatar_type ?? undefined}
                            data={profile.avatar_data ?? undefined}
                            background={profile.avatar_background ?? undefined}
                            name={profile.name}
                            size="md"
                            showBorder
                          />
                          <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                              {profile.name}
                            </h2>
                            {profile.relationship && (
                              <p className="text-xs text-gray-500 truncate">{profile.relationship}</p>
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

                        {/* On-hand progress + budget */}
                        <div className="mt-2 space-y-1.5">
                          {(profile.target_quantity ?? 1) > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className={`text-[10px] font-semibold ${
                                  (onHandCounts[profile.id] || 0) >= (profile.target_quantity ?? 1)
                                    ? 'text-green-700' : 'text-amber-700'
                                }`}>
                                  {onHandCounts[profile.id] || 0}/{profile.target_quantity ?? 1} on hand
                                </span>
                                {profile.max_budget != null && (
                                  <span className="text-[10px] font-medium text-gray-500">
                                    ${profile.max_budget}/gift
                                  </span>
                                )}
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    (onHandCounts[profile.id] || 0) >= (profile.target_quantity ?? 1)
                                      ? 'bg-green-500' : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${Math.min(100, ((onHandCounts[profile.id] || 0) / (profile.target_quantity ?? 1)) * 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Budget Summary */}
                      <RecipientBudgetSummary recipientId={profile.id} />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Recipient Modal (People) */}
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

      {/* Occasion Profile Modal */}
      <OccasionProfileModal
        isOpen={isOccasionModalOpen}
        onClose={() => {
          setIsOccasionModalOpen(false);
          setSelectedOccasionProfile(null);
        }}
        onSuccess={() => {
          fetchRecipients();
        }}
        existingProfile={selectedOccasionProfile ? {
          id: selectedOccasionProfile.id,
          name: selectedOccasionProfile.name,
          profile_type: selectedOccasionProfile.profile_type || '',
          max_budget: selectedOccasionProfile.max_budget || null,
          target_quantity: selectedOccasionProfile.target_quantity || null,
          notes: selectedOccasionProfile.notes || null,
          interests: selectedOccasionProfile.interests,
          gift_dos: selectedOccasionProfile.gift_dos || null,
          gift_donts: selectedOccasionProfile.gift_donts || null,
          important_dates: selectedOccasionProfile.important_dates,
          relationship: selectedOccasionProfile.relationship,
        } : null}
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

export default function RecipientsPage() {
  return (
    <Suspense fallback={
      <div className="p-3 md:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-giftstash-orange mx-auto"></div>
            <p className="mt-4 text-sm md:text-base text-gray-600">Loading recipients...</p>
          </div>
        </div>
      </div>
    }>
      <RecipientsPageContent />
    </Suspense>
  );
}
