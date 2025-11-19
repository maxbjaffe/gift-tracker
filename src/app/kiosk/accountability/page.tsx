'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChildAvatar } from '@/components/ChildAvatar';
import { Ban, Target, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { format, formatDistance, differenceInHours, isPast } from 'date-fns';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_type: string | null;
  avatar_data: string | null;
  avatar_background: string | null;
}

interface Consequence {
  id: string;
  child_id: string;
  child: { id: string; name: string };
  restriction_type: string;
  restriction_item: string;
  reason: string;
  severity: string;
  status: string;
  created_at: string;
  expires_at: string | null;
}

interface Commitment {
  id: string;
  child_id: string;
  child: { id: string; name: string };
  commitment_text: string;
  category: string;
  due_date: string;
  status: string;
  completed_at: string | null;
  completed_on_time: boolean | null;
}

interface AccountabilityData {
  children: Child[];
  consequences: Consequence[];
  commitments: Commitment[];
}

function AccountabilityKioskContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  const [data, setData] = useState<AccountabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!token) {
      setError('No kiosk token provided in URL');
      setLoading(false);
      return;
    }

    loadData();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(loadData, 30000);

    // Update time every second for countdown timers
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(timeInterval);
    };
  }, [token]);

  async function loadData() {
    try {
      if (!token) return;

      const response = await fetch(`/api/kiosk/accountability?token=${encodeURIComponent(token)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load' }));
        setError(errorData.error || `Failed to load (${response.status})`);
        setLoading(false);
        return;
      }

      const accountabilityData = await response.json();
      setData(accountabilityData);
      setError(null);
    } catch (error) {
      console.error('Error loading accountability data:', error);
      setError(`Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  const getRestrictionIcon = (type: string) => {
    switch (type) {
      case 'device': return '📱';
      case 'activity': return '🎮';
      case 'privilege': return '✨';
      case 'location': return '📍';
      default: return '🚫';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'homework': return '📚';
      case 'chores': return '🧹';
      case 'responsibilities': return '🎯';
      case 'behavior': return '🌟';
      default: return '📋';
    }
  };

  const getProgressData = (consequence: Consequence) => {
    if (!consequence.expires_at) return null;

    const now = currentTime;
    const startDate = new Date(consequence.created_at);
    const endDate = new Date(consequence.expires_at);

    const totalDuration = differenceInHours(endDate, startDate);
    const elapsed = differenceInHours(now, startDate);
    const remaining = differenceInHours(endDate, now);

    if (totalDuration <= 0) return null;

    const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    return {
      percentage,
      remaining,
      isAlmostOver: percentage >= 75,
    };
  };

  const getTimeRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = currentTime;

    if (isPast(due)) {
      return {
        text: `Overdue by ${formatDistance(due, now)}`,
        isOverdue: true,
      };
    }

    return {
      text: formatDistance(due, now, { addSuffix: true }),
      isOverdue: false,
    };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please use the kiosk URL from your account settings.
          </p>
        </Card>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Group commitments by child
  const commitmentsByChild = data.children.map(child => ({
    child,
    commitments: data.commitments.filter(c => c.child_id === child.id),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
      {/* AI Max on margins */}
      <div className="fixed -left-32 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none z-0">
        <Image
          src="/images/aimaxhead.png"
          alt="AI Max Left"
          width={800}
          height={800}
          className="object-contain"
        />
      </div>
      <div className="fixed -right-32 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none z-0">
        <Image
          src="/images/aimaxhead.png"
          alt="AI Max Right"
          width={800}
          height={800}
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Family Accountability
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                {format(currentTime, 'EEEE, MMMM d, yyyy • h:mm a')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Children Grid - Each child shows consequences and commitments side by side */}
        <div className="space-y-6">
          {data.children.map(child => {
            const childConsequences = data.consequences.filter(c => c.child_id === child.id);
            const childCommitments = data.commitments.filter(c => c.child_id === child.id);

            return (
              <Card key={child.id} className="p-6">
                {/* Child Header */}
                <div className="flex items-center gap-3 pb-4 mb-4 border-b-2 border-gray-200">
                  <ChildAvatar
                    name={child.name}
                    avatarType={child.avatar_type}
                    avatarData={child.avatar_data}
                    avatarBackground={child.avatar_background}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{child.name}</h2>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>{childConsequences.length} consequences</span>
                      <span>•</span>
                      <span>{childCommitments.length} commitments</span>
                    </div>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Consequences Column */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Ban className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-bold text-red-900">Consequences</h3>
                    </div>

                    {childConsequences.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                        <p className="text-sm">No active consequences</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {childConsequences.map(consequence => {
                          const progressData = getProgressData(consequence);

                          return (
                            <Card key={consequence.id} className="p-3 bg-red-50 border-red-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{getRestrictionIcon(consequence.restriction_type)}</span>
                                <span className="font-semibold text-red-700 text-sm">
                                  {consequence.restriction_item}
                                </span>
                              </div>

                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {consequence.reason}
                              </p>

                              {progressData && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className={`font-medium ${progressData.isAlmostOver ? 'text-green-600' : 'text-orange-600'}`}>
                                      {progressData.remaining > 24 ? (
                                        `${Math.ceil(progressData.remaining / 24)} days left`
                                      ) : progressData.remaining > 0 ? (
                                        `${progressData.remaining} hours left`
                                      ) : (
                                        'Almost done!'
                                      )}
                                    </span>
                                    <span className="text-gray-500">
                                      {Math.round(progressData.percentage)}%
                                    </span>
                                  </div>
                                  <Progress value={progressData.percentage} className="h-2" />
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Commitments Column */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-blue-900">Commitments</h3>
                    </div>

                    {childCommitments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                        <p className="text-sm">No active commitments</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {childCommitments.map(commitment => {
                          const timeInfo = getTimeRemaining(commitment.due_date);
                          const isCompleted = commitment.status === 'completed';

                          return (
                            <div
                              key={commitment.id}
                              className={`flex items-center gap-2 p-3 rounded-lg border ${
                                isCompleted
                                  ? 'bg-green-50 border-green-300'
                                  : timeInfo.isOverdue
                                  ? 'bg-red-50 border-red-300'
                                  : 'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <span className="text-xl flex-shrink-0">
                                {getCategoryIcon(commitment.category)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${isCompleted ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                                  {commitment.commitment_text}
                                </p>
                                <div className="flex items-center gap-1 mt-1 text-xs">
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      <span className="text-green-600 font-medium">
                                        Done {commitment.completed_on_time ? 'on time' : 'late'}
                                      </span>
                                    </>
                                  ) : timeInfo.isOverdue ? (
                                    <>
                                      <AlertCircle className="h-3 w-3 text-red-600" />
                                      <span className="text-red-600 font-medium">{timeInfo.text}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-3 w-3 text-blue-600" />
                                      <span className="text-blue-600 font-medium">Due {timeInfo.text}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AccountabilityKioskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    }>
      <AccountabilityKioskContent />
    </Suspense>
  );
}
